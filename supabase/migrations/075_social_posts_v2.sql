-- =============================================================================
-- 075_social_posts_v2.sql
-- Social: distinct post types, server-side post validation, recipe sharing
-- rewards, unlisted recipe visibility via Social, and a keyset/ranked feed.
--
-- WHY:
--   Posts are inserted straight from the browser. Until now the four composer
--   options (Post / Recipe / Question / Review) only changed a label: no recipe
--   was ever attached, and questions and reviews collected nothing of their
--   own. This migration adds what each type needs and the feed / rewards
--   plumbing. It is backward compatible with the previous composer, so it can
--   be applied before the new frontend ships.
--
--   1. Typed columns per post type (question title, review subject + rating,
--      accepted answer) with simple bounds.
--   2. Feed indexes.
--   3. recipe_share reward rule, awarded from the existing post trigger through
--      the existing award_points() engine. One award per recipe per user ever,
--      3 per day, own recipes only, AI recipes need a photo of the dish.
--      AI-generated recipe saves no longer earn creation points (they were
--      earning recipe_upload + first_recipe + recipe badges for a button press).
--   4. get_social_feed(): one round trip, keyset cursors, ranked "For you".
--
--   The strict per-type validation trigger and the shared-recipe read policy
--   are in 076_social_post_validation.sql, applied together with the frontend.
--
-- Prerequisites: 047_award_points_engine.sql, 050_badge_engine.sql,
--                070_hub_to_social_rename.sql
-- =============================================================================


-- =============================================================================
-- 1. Columns + simple bounds
-- =============================================================================

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS title               TEXT,
  ADD COLUMN IF NOT EXISTS rating              SMALLINT,
  ADD COLUMN IF NOT EXISTS review_subject      TEXT,
  ADD COLUMN IF NOT EXISTS accepted_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL;

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_length;
ALTER TABLE posts ADD  CONSTRAINT posts_content_length        CHECK (char_length(content) <= 5000);
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_title_length;
ALTER TABLE posts ADD  CONSTRAINT posts_title_length          CHECK (title IS NULL OR char_length(title) BETWEEN 10 AND 200);
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_rating_range;
ALTER TABLE posts ADD  CONSTRAINT posts_rating_range          CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_review_subject_length;
ALTER TABLE posts ADD  CONSTRAINT posts_review_subject_length CHECK (review_subject IS NULL OR char_length(review_subject) BETWEEN 2 AND 120);
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_media_count;
ALTER TABLE posts ADD  CONSTRAINT posts_media_count           CHECK (coalesce(cardinality(media_urls), 0) <= 4);


-- =============================================================================
-- 2. Indexes for the feed, recipe lookups and the shared-recipe policy
-- =============================================================================

-- "Latest" keyset scan: (created_at, id) DESC over live posts only.
CREATE INDEX IF NOT EXISTS idx_posts_live_created_id
  ON posts (created_at DESC, id DESC)
  WHERE is_published AND deleted_at IS NULL;

-- Profile feed keyset scan.
CREATE INDEX IF NOT EXISTS idx_posts_user_created_id
  ON posts (user_id, created_at DESC, id DESC)
  WHERE is_published AND deleted_at IS NULL;

-- Shared-recipe RLS policy + "which posts share this recipe".
CREATE INDEX IF NOT EXISTS idx_posts_recipe_id
  ON posts (recipe_id)
  WHERE recipe_id IS NOT NULL;


-- =============================================================================
-- 3. Recipe sharing rewards
--
-- Eligibility (single source of truth: recipe_share_check):
--   - the recipe exists, is not deleted, and the sharer can see it
--   - it is the sharer's own recipe (sharing other people's recipes is welcome
--     but earns nothing, otherwise the public catalogue is a points farm)
--   - AI-generated recipes need a photo on the post (proof it was cooked)
--   - once per recipe per user, ever (reward_tx_action_reference_unique), so
--     delete-and-repost earns nothing
--   - at most max_per_day awards per day (rule row, 3)
-- The award runs inside the post INSERT transaction, so a post that fails to
-- insert can never have earned points.
-- =============================================================================

INSERT INTO reward_rules (action, label, points_per_unit, unit, max_per_day, max_lifetime)
VALUES ('recipe_share', 'Shared a recipe on Social', 25, 'fixed', 3, NULL)
ON CONFLICT (action) DO NOTHING;

CREATE OR REPLACE FUNCTION recipe_share_check(p_user_id UUID, p_recipe_id UUID, p_has_photo BOOLEAN)
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_recipe RECORD;
  v_rule   reward_rules%ROWTYPE;
  v_count  INTEGER;
BEGIN
  SELECT user_id, is_published, is_ai_generated, deleted_at INTO v_recipe
  FROM recipes WHERE id = p_recipe_id;

  -- Not found / deleted / someone else's draft all read the same, so this can't
  -- be used to probe which recipe ids exist.
  IF NOT FOUND OR v_recipe.deleted_at IS NOT NULL
     OR (v_recipe.user_id <> p_user_id AND NOT v_recipe.is_published) THEN
    RETURN 'unavailable';
  END IF;

  IF v_recipe.user_id <> p_user_id THEN
    RETURN 'not_owner';
  END IF;

  SELECT * INTO v_rule FROM reward_rules
  WHERE action = 'recipe_share' AND is_active
    AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until > NOW());
  IF NOT FOUND THEN
    RETURN 'inactive';
  END IF;

  IF EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE user_id = p_user_id AND action = 'recipe_share' AND reference_id = p_recipe_id
  ) THEN
    RETURN 'already_rewarded';
  END IF;

  IF v_rule.max_per_day IS NOT NULL THEN
    SELECT count(*) INTO v_count FROM reward_transactions
    WHERE user_id = p_user_id AND action = 'recipe_share'
      AND created_date = CURRENT_DATE AND points > 0;
    IF v_count >= v_rule.max_per_day THEN
      RETURN 'daily_cap';
    END IF;
  END IF;

  IF v_recipe.is_ai_generated AND NOT COALESCE(p_has_photo, FALSE) THEN
    RETURN 'needs_photo';
  END IF;

  RETURN 'eligible';
END;
$$;

REVOKE ALL ON FUNCTION recipe_share_check(UUID, UUID, BOOLEAN) FROM PUBLIC, anon, authenticated;

-- Composer hint: what would sharing this recipe earn, with and without a photo?
-- Always evaluates for auth.uid(), never a caller-supplied user.
CREATE OR REPLACE FUNCTION get_recipe_share_status(p_recipe_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid    UUID := auth.uid();
  v_points INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('points', 0, 'without_photo', 'signed_out', 'with_photo', 'signed_out');
  END IF;
  SELECT points_per_unit::INTEGER INTO v_points FROM reward_rules
  WHERE action = 'recipe_share' AND is_active;
  RETURN jsonb_build_object(
    'points',        COALESCE(v_points, 0),
    'without_photo', recipe_share_check(v_uid, p_recipe_id, FALSE),
    'with_photo',    recipe_share_check(v_uid, p_recipe_id, TRUE)
  );
END;
$$;

REVOKE ALL ON FUNCTION get_recipe_share_status(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_recipe_share_status(UUID) TO authenticated;

-- Post trigger: unchanged first_post / daily_post / badge, plus recipe_share.
CREATE OR REPLACE FUNCTION handle_post_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'first_post', p_description => 'Your first post');
  PERFORM award_points(NEW.user_id, 'daily_post', p_reference_id => NEW.id, p_description => 'Posted on Social');
  PERFORM award_badge(NEW.user_id, 'first-post', 'First post on Social');

  IF NEW.post_type = 'recipe' AND NEW.recipe_id IS NOT NULL AND NEW.is_published
     AND recipe_share_check(NEW.user_id, NEW.recipe_id, cardinality(COALESCE(NEW.media_urls, '{}')) > 0) = 'eligible' THEN
    PERFORM award_points(
      NEW.user_id, 'recipe_share',
      p_reference_id => NEW.recipe_id,
      p_description  => 'Shared a recipe on Social'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Recipe trigger: AI-generated saves are not uploads. Saving an Assistant recipe
-- is one click, so it no longer earns first_recipe / recipe_upload or the
-- recipe badges. Manually uploaded recipes are unchanged.
CREATE OR REPLACE FUNCTION handle_recipe_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_ai_generated THEN
    RETURN NEW;
  END IF;
  PERFORM award_points(NEW.user_id, 'first_recipe', p_description => 'Your first recipe');
  PERFORM award_points(NEW.user_id, 'recipe_upload', p_reference_id => NEW.id, p_description => 'Recipe uploaded');
  PERFORM award_badge(NEW.user_id, 'first-recipe', 'First recipe uploaded');
  IF (SELECT count(*) FROM recipes WHERE user_id = NEW.user_id AND NOT is_ai_generated) >= 5 THEN
    PERFORM award_badge(NEW.user_id, 'home-chef', 'Uploaded 5 recipes');
  END IF;
  RETURN NEW;
END;
$$;


-- =============================================================================
-- 4. get_social_feed(): every feed surface in one round trip
--
--   p_mode:
--     'for_you'   ranked: engagement (log-damped) x followed-author boost x
--                 recipe/media boost, decayed by age, with a per-author
--                 diversity penalty (0.7^n for an author's nth post) so one
--                 prolific account can't fill the screen. Featured (boosted)
--                 posts lead. Window: 30 days before p_as_of.
--     'latest'    chronological
--     'following' chronological, authors the caller follows
--     'saved'     the caller's bookmarks, newest bookmark first
--     'user'      one author's posts (p_author_id), chronological
--
--   Cursors are keyset, never offsets, so posts arriving mid-scroll can't
--   shift the window into duplicates or gaps:
--     chronological: (sort_ts, id)    < (p_cursor_ts, p_cursor_id)
--     for_you      : (sort_score, id) < (p_cursor_score, p_cursor_id)
--   For 'for_you' the client pins p_as_of to the first page's time, so ages,
--   and therefore scores, are identical on every page. Only like/comment
--   changes between page loads can move a post across the cursor; the client
--   dedupes by id for that case.
--
--   SECURITY INVOKER: posts / recipes / bookmarks RLS all still apply.
--   Stage 1 picks ids + sort keys per mode; stage 2 is one shared projection.
-- =============================================================================

DROP FUNCTION IF EXISTS get_social_feed(TEXT, INTEGER, TEXT, UUID, TIMESTAMPTZ, DOUBLE PRECISION, UUID, TIMESTAMPTZ);

CREATE FUNCTION get_social_feed(
  p_mode         TEXT             DEFAULT 'latest',
  p_limit        INTEGER          DEFAULT 20,
  p_post_type    TEXT             DEFAULT NULL,
  p_author_id    UUID             DEFAULT NULL,
  p_cursor_ts    TIMESTAMPTZ      DEFAULT NULL,
  p_cursor_score DOUBLE PRECISION DEFAULT NULL,
  p_cursor_id    UUID             DEFAULT NULL,
  p_as_of        TIMESTAMPTZ      DEFAULT NULL
)
RETURNS TABLE (
  id                  UUID,
  user_id             UUID,
  post_type           TEXT,
  content             TEXT,
  title               TEXT,
  rating              SMALLINT,
  review_subject      TEXT,
  media_urls          TEXT[],
  media_public_ids    TEXT[],
  recipe_id           UUID,
  accepted_comment_id UUID,
  like_count          INTEGER,
  comment_count       INTEGER,
  view_count          INTEGER,
  is_featured         BOOLEAN,
  featured_until      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ,
  profiles            JSONB,
  is_liked            BOOLEAN,
  is_bookmarked       BOOLEAN,
  sort_ts             TIMESTAMPTZ,
  sort_score          DOUBLE PRECISION
)
LANGUAGE plpgsql STABLE SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  v_uid    UUID        := auth.uid();
  v_limit  INTEGER     := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 50);
  v_as_of  TIMESTAMPTZ := COALESCE(p_as_of, NOW());
  v_ids    UUID[];
  v_ts     TIMESTAMPTZ[];
  v_scores DOUBLE PRECISION[];
BEGIN
  IF p_post_type IS NOT NULL AND p_post_type NOT IN ('general', 'recipe', 'question', 'review') THEN
    RAISE EXCEPTION 'Unknown post type' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF (p_cursor_ts IS NOT NULL OR p_cursor_score IS NOT NULL) AND p_cursor_id IS NULL THEN
    RAISE EXCEPTION 'Cursor is incomplete' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_mode = 'for_you' THEN
    WITH candidates AS (
      SELECT p.id, p.user_id, p.created_at, p.is_featured, p.like_count, p.comment_count,
             p.post_type, p.recipe_id, cardinality(COALESCE(p.media_urls, '{}')) > 0 AS has_media,
             (v_uid IS NOT NULL AND EXISTS (
               SELECT 1 FROM follows f WHERE f.follower_id = v_uid AND f.following_id = p.user_id
             )) AS followed
      FROM posts p
      WHERE p.is_published AND p.deleted_at IS NULL
        AND p.created_at <= v_as_of
        AND p.created_at >  v_as_of - INTERVAL '30 days'
        AND (p_post_type IS NULL OR p.post_type = p_post_type)
    ), scored AS (
      SELECT c.*,
             (1 + ln(1 + c.like_count + 2 * c.comment_count))
             * CASE WHEN c.followed THEN 1.5 ELSE 1 END
             * CASE WHEN c.post_type = 'recipe' AND c.recipe_id IS NOT NULL THEN 1.15 ELSE 1 END
             * CASE WHEN c.has_media THEN 1.1 ELSE 1 END
             / power(EXTRACT(EPOCH FROM (v_as_of - c.created_at)) / 3600.0 + 2, 1.3) AS raw_score
      FROM candidates c
    ), ranked AS (
      SELECT s.id, s.created_at,
             (s.raw_score * power(0.7, (row_number() OVER (PARTITION BY s.user_id ORDER BY s.raw_score DESC, s.id DESC)) - 1)
               + CASE WHEN s.is_featured THEN 1000 ELSE 0 END)::DOUBLE PRECISION AS score
      FROM scored s
    ), page AS (
      SELECT r.* FROM ranked r
      WHERE p_cursor_score IS NULL OR (r.score, r.id) < (p_cursor_score, p_cursor_id)
      ORDER BY r.score DESC, r.id DESC
      LIMIT v_limit
    )
    SELECT array_agg(pg.id ORDER BY pg.score DESC, pg.id DESC),
           array_agg(pg.created_at ORDER BY pg.score DESC, pg.id DESC),
           array_agg(pg.score ORDER BY pg.score DESC, pg.id DESC)
    INTO v_ids, v_ts, v_scores
    FROM page pg;

  ELSIF p_mode = 'latest' THEN
    SELECT array_agg(q.id ORDER BY q.created_at DESC, q.id DESC),
           array_agg(q.created_at ORDER BY q.created_at DESC, q.id DESC)
    INTO v_ids, v_ts
    FROM (
      SELECT p.id, p.created_at FROM posts p
      WHERE p.is_published AND p.deleted_at IS NULL
        AND (p_post_type IS NULL OR p.post_type = p_post_type)
        AND (p_cursor_ts IS NULL OR (p.created_at, p.id) < (p_cursor_ts, p_cursor_id))
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT v_limit
    ) q;

  ELSIF p_mode = 'following' THEN
    IF v_uid IS NULL THEN RETURN; END IF;
    SELECT array_agg(q.id ORDER BY q.created_at DESC, q.id DESC),
           array_agg(q.created_at ORDER BY q.created_at DESC, q.id DESC)
    INTO v_ids, v_ts
    FROM (
      SELECT p.id, p.created_at FROM posts p
      JOIN follows f ON f.following_id = p.user_id AND f.follower_id = v_uid
      WHERE p.is_published AND p.deleted_at IS NULL
        AND (p_post_type IS NULL OR p.post_type = p_post_type)
        AND (p_cursor_ts IS NULL OR (p.created_at, p.id) < (p_cursor_ts, p_cursor_id))
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT v_limit
    ) q;

  ELSIF p_mode = 'saved' THEN
    IF v_uid IS NULL THEN RETURN; END IF;
    SELECT array_agg(q.id ORDER BY q.saved_at DESC, q.id DESC),
           array_agg(q.saved_at ORDER BY q.saved_at DESC, q.id DESC)
    INTO v_ids, v_ts
    FROM (
      SELECT p.id, b.created_at AS saved_at FROM post_bookmarks b
      JOIN posts p ON p.id = b.post_id
      WHERE b.user_id = v_uid
        AND p.is_published AND p.deleted_at IS NULL
        AND (p_post_type IS NULL OR p.post_type = p_post_type)
        AND (p_cursor_ts IS NULL OR (b.created_at, p.id) < (p_cursor_ts, p_cursor_id))
      ORDER BY b.created_at DESC, p.id DESC
      LIMIT v_limit
    ) q;

  ELSIF p_mode = 'user' THEN
    IF p_author_id IS NULL THEN
      RAISE EXCEPTION 'p_author_id is required for user mode' USING ERRCODE = 'invalid_parameter_value';
    END IF;
    SELECT array_agg(q.id ORDER BY q.created_at DESC, q.id DESC),
           array_agg(q.created_at ORDER BY q.created_at DESC, q.id DESC)
    INTO v_ids, v_ts
    FROM (
      SELECT p.id, p.created_at FROM posts p
      WHERE p.user_id = p_author_id
        AND p.is_published AND p.deleted_at IS NULL
        AND (p_post_type IS NULL OR p.post_type = p_post_type)
        AND (p_cursor_ts IS NULL OR (p.created_at, p.id) < (p_cursor_ts, p_cursor_id))
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT v_limit
    ) q;

  ELSE
    RAISE EXCEPTION 'Unknown feed mode' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF v_ids IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id, p.user_id, p.post_type, p.content, p.title, p.rating, p.review_subject,
         COALESCE(p.media_urls, '{}'), COALESCE(p.media_public_ids, '{}'),
         p.recipe_id, p.accepted_comment_id,
         p.like_count, p.comment_count, p.view_count, p.is_featured, p.featured_until,
         p.created_at, p.updated_at,
         jsonb_build_object(
           'username',      pr.username,
           'full_name',     pr.full_name,
           'avatar_url',    pr.avatar_url,
           'is_verified',   pr.is_verified,
           'profile_flair', pr.profile_flair
         ),
         (v_uid IS NOT NULL AND EXISTS (SELECT 1 FROM post_likes l WHERE l.post_id = p.id AND l.user_id = v_uid)),
         (v_uid IS NOT NULL AND EXISTS (SELECT 1 FROM post_bookmarks b WHERE b.post_id = p.id AND b.user_id = v_uid)),
         k.ts,
         k.score
  FROM unnest(v_ids, v_ts, COALESCE(v_scores, array_fill(NULL::DOUBLE PRECISION, ARRAY[cardinality(v_ids)])))
       WITH ORDINALITY AS k(id, ts, score, ord)
  JOIN posts p     ON p.id = k.id
  JOIN profiles pr ON pr.id = p.user_id
  ORDER BY k.ord;
END;
$$;

REVOKE ALL ON FUNCTION get_social_feed(TEXT, INTEGER, TEXT, UUID, TIMESTAMPTZ, DOUBLE PRECISION, UUID, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_social_feed(TEXT, INTEGER, TEXT, UUID, TIMESTAMPTZ, DOUBLE PRECISION, UUID, TIMESTAMPTZ) TO anon, authenticated;
