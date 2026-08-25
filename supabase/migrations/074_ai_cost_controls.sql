-- =============================================================================
-- 074_ai_cost_controls.sql
-- AQI is about to become free and gain image input. Today the only limit is
-- hourly, it is bypassable, and nothing anywhere records what a request cost.
--
-- (1) THE HOURLY LIMIT IS THE ONLY LIMIT
-- The window resets every hour with no cumulative tracking, so a user can hit
-- their cap every hour forever. A Bronze user doing that costs roughly $11.50 a
-- month on gpt-5.6-luna, against a $9 balance, and there is no platform-wide
-- ceiling at all. Daily and monthly caps are added below, plus a separate image
-- cap because image requests carry a second abuse surface (upload bandwidth,
-- content risk) and a cost that swings by 70x on one parameter.
--
-- Daily and monthly usage are derived by aggregating the existing hourly rows
-- rather than adding parallel counters, so there is one source of truth. At a
-- worst case of 24 rows a day this stays cheap.
--
-- (2) THE COUNTER HAS A READ-THEN-WRITE RACE
-- generate-recipe reads request_count at the start of the request and writes
-- back value+1 at the end. Concurrent requests all read the same number and all
-- write the same increment, so ten parallel calls can register as one. The
-- limit is bypassable from a browser console. consume_ai_request() below does
-- the check and the increment in one call, serialised per user by an advisory
-- lock, so concurrency cannot interleave them.
--
-- (3) FAILED REQUESTS ARE FREE
-- The old increment only ran after OpenAI returned successfully, so anything
-- that timed out or failed validation was billed by OpenAI but cost the user
-- nothing. Reserving quota up front is the fix; the edge function calls this
-- before the OpenAI request, not after.
--
-- (4) NOTHING RECORDS COST
-- ai_request_counts stores a count and nothing else, and OpenAI's usage figures
-- are discarded on every response. ai_usage_log keeps them so "which users cost
-- most" and "did the model swap change unit economics" become answerable, and
-- so the global spend ceiling has something real to measure.
-- =============================================================================

-- ── Per-request usage and cost ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- SET NULL, not CASCADE: cost history has to survive account deletion or the
  -- spend record develops holes. Same reasoning as donations in migration 073.
  user_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  model             TEXT NOT NULL,
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  -- Image tokens are billed as input tokens and are already inside
  -- prompt_tokens. Kept separately so image cost can be reasoned about on its
  -- own, since it is the part that varies wildly with the detail setting.
  image_tokens      INTEGER NOT NULL DEFAULT 0,
  had_image         BOOLEAN NOT NULL DEFAULT FALSE,
  cost_usd          NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_usage_log_created_idx ON ai_usage_log (created_at DESC);
CREATE INDEX IF NOT EXISTS ai_usage_log_user_idx    ON ai_usage_log (user_id, created_at DESC);

-- Server-side only, like ai_request_counts. No policies, so RLS denies every
-- anon/authenticated request and only the service role can reach it.
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- ── Image counter on the existing hourly rows ────────────────────────────────

ALTER TABLE ai_request_counts
  ADD COLUMN IF NOT EXISTS image_count INTEGER NOT NULL DEFAULT 0;

-- Aggregating "today" and "this month" scans a user's recent windows.
CREATE INDEX IF NOT EXISTS ai_request_counts_user_window_idx
  ON ai_request_counts (user_id, window_start DESC);

-- ── Tier limits ──────────────────────────────────────────────────────────────
-- Hourly stays as-is and keeps doing burst control. Daily is the layer that was
-- missing. Monthly is the hard ceiling that bounds worst-case spend per user.

ALTER TABLE reward_tiers
  ADD COLUMN IF NOT EXISTS ai_requests_per_day   INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS ai_requests_per_month INTEGER NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS ai_images_per_day     INTEGER NOT NULL DEFAULT 5;

UPDATE reward_tiers SET ai_requests_per_day = 30,  ai_requests_per_month = 300,  ai_images_per_day = 5  WHERE name = 'bronze';
UPDATE reward_tiers SET ai_requests_per_day = 50,  ai_requests_per_month = 500,  ai_images_per_day = 10 WHERE name = 'silver';
UPDATE reward_tiers SET ai_requests_per_day = 75,  ai_requests_per_month = 750,  ai_images_per_day = 15 WHERE name = 'gold';
UPDATE reward_tiers SET ai_requests_per_day = 120, ai_requests_per_month = 1200, ai_images_per_day = 20 WHERE name = 'platinum';

-- ── Global switches ──────────────────────────────────────────────────────────
-- The backstop that protects against a bug rather than a user. If a runaway
-- loop starts burning budget, ai_enabled goes false and AQI degrades to a
-- friendly message with no code deploy.

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO app_settings (key, value) VALUES
  ('ai_enabled', 'true'::jsonb),
  -- Platform-wide spend ceiling for a single UTC day, measured against
  -- ai_usage_log. Deliberately low to start: raise it once real cost data
  -- exists rather than guessing upward.
  ('ai_daily_spend_cap_usd', '2.00'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── Atomic reserve-or-deny ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.consume_ai_request(
  p_user_id  UUID,
  p_is_image BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hour        TIMESTAMPTZ := date_trunc('hour',  now());
  v_day         TIMESTAMPTZ := date_trunc('day',   now());
  v_month       TIMESTAMPTZ := date_trunc('month', now());
  v_tier        TEXT;
  v_lim_hour    INTEGER;
  v_lim_day     INTEGER;
  v_lim_month   INTEGER;
  v_lim_img     INTEGER;
  v_boost       INTEGER := 0;
  v_used_hour   INTEGER := 0;
  v_used_day    INTEGER := 0;
  v_used_month  INTEGER := 0;
  v_used_img    INTEGER := 0;
  v_enabled     BOOLEAN;
  v_spend_cap   NUMERIC;
  v_spend_today NUMERIC;
BEGIN
  -- Serialise per user. Without this the check and the increment are two
  -- statements that concurrent requests can interleave, which is the original
  -- bug. Transaction-scoped, so it releases automatically.
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  SELECT coalesce((value)::text::boolean, true) INTO v_enabled
    FROM app_settings WHERE key = 'ai_enabled';
  IF v_enabled IS FALSE THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'disabled');
  END IF;

  SELECT coalesce((value)::text::numeric, 0) INTO v_spend_cap
    FROM app_settings WHERE key = 'ai_daily_spend_cap_usd';
  IF v_spend_cap > 0 THEN
    SELECT coalesce(sum(cost_usd), 0) INTO v_spend_today
      FROM ai_usage_log WHERE created_at >= v_day;
    IF v_spend_today >= v_spend_cap THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'global_spend_cap');
    END IF;
  END IF;

  SELECT reward_tier INTO v_tier FROM profiles WHERE id = p_user_id;

  SELECT ai_requests_per_hour, ai_requests_per_day, ai_requests_per_month, ai_images_per_day
    INTO v_lim_hour, v_lim_day, v_lim_month, v_lim_img
    FROM reward_tiers WHERE name = coalesce(v_tier, 'bronze');

  -- Missing tier row must not mean unlimited.
  v_lim_hour  := coalesce(v_lim_hour,  10);
  v_lim_day   := coalesce(v_lim_day,   30);
  v_lim_month := coalesce(v_lim_month, 300);
  v_lim_img   := coalesce(v_lim_img,   5);

  -- "AI power-up" redemption tops up the hourly allowance only. It is a burst
  -- perk, so it must not lift the daily or monthly ceiling.
  SELECT coalesce(sum(boosted_limit), 0) INTO v_boost
    FROM ai_limit_boosts
    WHERE user_id = p_user_id AND expires_at > now();
  v_lim_hour := v_lim_hour + v_boost;

  SELECT coalesce(sum(request_count), 0)
    INTO v_used_month
    FROM ai_request_counts
    WHERE user_id = p_user_id AND window_start >= v_month;

  -- The image cap is a daily one, so image usage is only ever read over the day
  -- window. Reading it over the month too would silently overwrite this.
  SELECT coalesce(sum(request_count), 0),
         coalesce(sum(image_count), 0)
    INTO v_used_day, v_used_img
    FROM ai_request_counts
    WHERE user_id = p_user_id AND window_start >= v_day;

  SELECT coalesce(request_count, 0) INTO v_used_hour
    FROM ai_request_counts
    WHERE user_id = p_user_id AND window_start = v_hour;
  v_used_hour := coalesce(v_used_hour, 0);

  IF v_used_month >= v_lim_month THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'monthly',
      'limit', v_lim_month, 'used', v_used_month);
  END IF;
  IF v_used_day >= v_lim_day THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'daily',
      'limit', v_lim_day, 'used', v_used_day);
  END IF;
  IF v_used_hour >= v_lim_hour THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'hourly',
      'limit', v_lim_hour, 'used', v_used_hour);
  END IF;
  IF p_is_image AND v_used_img >= v_lim_img THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'image_daily',
      'limit', v_lim_img, 'used', v_used_img);
  END IF;

  INSERT INTO ai_request_counts (user_id, window_start, request_count, image_count)
  VALUES (p_user_id, v_hour, 1, CASE WHEN p_is_image THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, window_start) DO UPDATE
    SET request_count = ai_request_counts.request_count + 1,
        image_count   = ai_request_counts.image_count
                        + CASE WHEN p_is_image THEN 1 ELSE 0 END;

  RETURN jsonb_build_object(
    'allowed', true,
    'rate_limit', v_lim_hour,
    'requests_remaining', greatest(v_lim_hour - (v_used_hour + 1), 0),
    'daily_remaining',    greatest(v_lim_day   - (v_used_day + 1), 0),
    'monthly_remaining',  greatest(v_lim_month - (v_used_month + 1), 0),
    'images_remaining',   greatest(v_lim_img - (v_used_img + CASE WHEN p_is_image THEN 1 ELSE 0 END), 0)
  );
END;
$$;

-- Only the edge function (service role) may spend quota. Leaving this callable
-- by anon/authenticated would let a client burn its own allowance, or worse
-- someone else's, straight from the REST API.
REVOKE ALL ON FUNCTION public.consume_ai_request(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_ai_request(UUID, BOOLEAN) FROM anon;
REVOKE ALL ON FUNCTION public.consume_ai_request(UUID, BOOLEAN) FROM authenticated;

-- Releases quota when a request fails before OpenAI is ever billed, so a
-- server-side error does not silently cost the user an allowance.
CREATE OR REPLACE FUNCTION public.refund_ai_request(
  p_user_id  UUID,
  p_is_image BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ai_request_counts
     SET request_count = greatest(request_count - 1, 0),
         image_count   = greatest(image_count - CASE WHEN p_is_image THEN 1 ELSE 0 END, 0)
   WHERE user_id = p_user_id
     AND window_start = date_trunc('hour', now());
END;
$$;

REVOKE ALL ON FUNCTION public.refund_ai_request(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refund_ai_request(UUID, BOOLEAN) FROM anon;
REVOKE ALL ON FUNCTION public.refund_ai_request(UUID, BOOLEAN) FROM authenticated;
