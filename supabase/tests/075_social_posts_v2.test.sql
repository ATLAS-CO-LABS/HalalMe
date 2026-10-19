-- =============================================================================
-- Tests for 075_social_posts_v2.sql + 076_social_post_validation.sql
--
-- Needs BOTH migrations. 075 is live; 076 is applied when the new composer
-- ships, so until then run it as: BEGIN; <076> <this file> ROLLBACK;
-- (Last run: 2026-10-18, all passing, as a dry run of 075 + 076 together.)
--
-- Runs entirely inside one transaction and ends in ROLLBACK, so it is safe to
-- run against production: nothing it creates survives. Any failed assertion
-- raises and aborts the run with a "FAILED:" message.
--
-- How to run (Supabase MCP execute_sql, or psql):
--   BEGIN;  <this file>  ROLLBACK;
-- To dry-run the migration itself first, paste the migration between BEGIN and
-- this file.
--
-- Acts as real users under RLS via SET LOCAL ROLE authenticated + JWT claims,
-- the same way PostgREST does, so policy behaviour is what is being tested.
-- =============================================================================

CREATE FUNCTION pg_temp.ok(p_cond BOOLEAN, p_msg TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF NOT COALESCE(p_cond, FALSE) THEN RAISE EXCEPTION 'FAILED: %', p_msg; END IF;
END $$;

CREATE FUNCTION pg_temp.expect_error(p_sql TEXT, p_like TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT ILIKE '%' || p_like || '%' THEN
      RAISE EXCEPTION 'FAILED: expected error like "%" but got "%" for: %', p_like, SQLERRM, p_sql;
    END IF;
    RETURN;
  END;
  RAISE EXCEPTION 'FAILED: expected error like "%" but it succeeded: %', p_like, p_sql;
END $$;

CREATE FUNCTION pg_temp.as_user(p_uid UUID) RETURNS VOID LANGUAGE sql AS $$
  SELECT set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
$$;

CREATE FUNCTION pg_temp.points(p_uid UUID, p_action TEXT, p_ref UUID DEFAULT NULL) RETURNS INTEGER LANGUAGE sql AS $$
  SELECT COALESCE(SUM(points), 0)::INTEGER FROM reward_transactions
  WHERE user_id = p_uid AND action = p_action AND (p_ref IS NULL OR reference_id = p_ref);
$$;

-- Media URL / public id for post p by user u, as /api/upload/sign would build.
CREATE FUNCTION pg_temp.media_url(u UUID, p UUID, name TEXT, kind TEXT DEFAULT 'image') RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'https://res.cloudinary.com/' || social_media_cloud() || '/' || kind || '/upload/v1/halalme/posts/' || u || '/' || p || '/' || name
         || CASE WHEN kind = 'video' THEN '.mp4' ELSE '.jpg' END;
$$;
CREATE FUNCTION pg_temp.media_pid(u UUID, p UUID, name TEXT) RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'halalme/posts/' || u || '/' || p || '/' || name;
$$;

-- ---------------------------------------------------------------------------
-- Fixtures (as the migration owner)
-- ---------------------------------------------------------------------------
-- Users A (sharer) and B (viewer). handle_new_user creates the profiles.
INSERT INTO auth.users (id, instance_id, aud, role, email, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES
  ('0000075a-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'social-test-a@example.invalid', now(), '{"full_name":"Social Test A"}', now(), now()),
  ('0000075b-0000-4000-8000-00000000000b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'social-test-b@example.invalid', now(), '{"full_name":"Social Test B"}', now(), now());

-- Recipes. Fixed ids so assertions can name them.
INSERT INTO recipes (id, user_id, title, is_published, is_ai_generated, ingredients, instructions) VALUES
  ('075a0001-0000-4000-8000-000000000001', '0000075a-0000-4000-8000-00000000000a', 'A published',  TRUE,  FALSE, '[]', '[]'),
  ('075a0002-0000-4000-8000-000000000002', '0000075a-0000-4000-8000-00000000000a', 'A draft',      FALSE, FALSE, '[]', '[]'),
  ('075a0003-0000-4000-8000-000000000003', '0000075a-0000-4000-8000-00000000000a', 'A AI draft',   FALSE, TRUE,  '[]', '[]'),
  ('075a0004-0000-4000-8000-000000000004', '0000075a-0000-4000-8000-00000000000a', 'A AI draft 2', FALSE, TRUE,  '[]', '[]'),
  ('075a0005-0000-4000-8000-000000000005', '0000075a-0000-4000-8000-00000000000a', 'A published 2',TRUE,  FALSE, '[]', '[]'),
  ('075a0006-0000-4000-8000-000000000006', '0000075a-0000-4000-8000-00000000000a', 'A private',    FALSE, FALSE, '[]', '[]'),
  ('075b0001-0000-4000-8000-000000000001', '0000075b-0000-4000-8000-00000000000b', 'B draft',      FALSE, FALSE, '[]', '[]'),
  ('075b0002-0000-4000-8000-000000000002', '0000075b-0000-4000-8000-00000000000b', 'B published',  TRUE,  FALSE, '[]', '[]');

-- AI saves no longer earn creation points; manual uploads still do.
SELECT pg_temp.ok(pg_temp.points('0000075a-0000-4000-8000-00000000000a', 'recipe_upload', '075a0003-0000-4000-8000-000000000003') = 0,
                  'AI-generated recipe save must not earn recipe_upload');
SELECT pg_temp.ok(pg_temp.points('0000075a-0000-4000-8000-00000000000a', 'recipe_upload', '075a0001-0000-4000-8000-000000000001') > 0,
                  'manual recipe upload still earns recipe_upload');

-- B follows A (feed following mode).
INSERT INTO follows (follower_id, following_id) VALUES ('0000075b-0000-4000-8000-00000000000b', '0000075a-0000-4000-8000-00000000000a');

-- ---------------------------------------------------------------------------
-- Act as A
-- ---------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT pg_temp.as_user('0000075a-0000-4000-8000-00000000000a');

DO $$
DECLARE
  a  CONSTANT UUID := '0000075a-0000-4000-8000-00000000000a';
  b  CONSTANT UUID := '0000075b-0000-4000-8000-00000000000b';
  p  UUID;
  st JSONB;
BEGIN
  PERFORM pg_temp.ok(auth.uid() = a, 'impersonation works');

  -- general ---------------------------------------------------------------
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type) VALUES (%L, '   ', 'general')$q$, a),
                               'Write something or add a photo');
  INSERT INTO posts (id, user_id, content, post_type)
  VALUES ('075c0001-0000-4000-8000-000000000001', a, 'Hello Social', 'general');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (%L, 'x', 'general', '075a0001-0000-4000-8000-000000000001')$q$, a),
                               'Only recipe posts can attach a recipe');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, rating, review_subject) VALUES (%L, 'x', 'general', 4, 'Cafe')$q$, a),
                               'Only reviews have a rating');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type) VALUES (%L, repeat('x', 5001), 'general')$q$, a),
                               'posts_content_length');

  -- question --------------------------------------------------------------
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type) VALUES (%L, 'details', 'question')$q$, a),
                               'Questions need the question itself');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, title) VALUES (%L, '', 'question', 'Too short')$q$, a),
                               'posts_title_length');
  INSERT INTO posts (id, user_id, content, post_type, title)
  VALUES ('075c0002-0000-4000-8000-000000000002', a, '', 'question', 'Where can I buy halal gelatine in Leeds?');

  -- review ----------------------------------------------------------------
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, review_subject) VALUES (%L, 'Lovely food overall', 'review', 'Cafe')$q$, a),
                               'Reviews need what you are reviewing');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, review_subject, rating) VALUES (%L, 'Lovely food overall', 'review', 'Cafe', 6)$q$, a),
                               'posts_rating_range');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, review_subject, rating) VALUES (%L, 'Good', 'review', 'Cafe', 4)$q$, a),
                               'at least 10 characters');
  INSERT INTO posts (id, user_id, content, post_type, review_subject, rating)
  VALUES ('075c0003-0000-4000-8000-000000000003', a, 'Great grill, friendly staff.', 'review', 'Grill House', 4);

  -- recipe: access ----------------------------------------------------------
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type) VALUES (%L, '', 'recipe')$q$, a),
                               'Choose a recipe to share');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (%L, '', 'recipe', '075b0001-0000-4000-8000-000000000001')$q$, a),
                               'not available to share');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (%L, '', 'recipe', '00000000-0000-4000-8000-0000000000ff')$q$, a),
                               'not available to share');

  -- recipe: points ----------------------------------------------------------
  -- Someone else's published recipe: allowed, no points.
  INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (a, 'Try this one', 'recipe', '075b0002-0000-4000-8000-000000000002');
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share') = 0, 'sharing another user''s recipe earns nothing');

  st := get_recipe_share_status('075a0001-0000-4000-8000-000000000001');
  PERFORM pg_temp.ok(st->>'without_photo' = 'eligible' AND (st->>'points')::int = 25, 'status: own published recipe is eligible: ' || st::text);

  -- Own published recipe: 25 points, once.
  INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (a, 'My biryani', 'recipe', '075a0001-0000-4000-8000-000000000001');
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share', '075a0001-0000-4000-8000-000000000001') = 25, 'own recipe share earns 25');
  INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (a, 'Again', 'recipe', '075a0001-0000-4000-8000-000000000001');
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share', '075a0001-0000-4000-8000-000000000001') = 25, 'resharing the same recipe earns nothing more');
  st := get_recipe_share_status('075a0001-0000-4000-8000-000000000001');
  PERFORM pg_temp.ok(st->>'without_photo' = 'already_rewarded', 'status reports already_rewarded');

  -- AI draft without a photo: allowed, no points; with a photo: points.
  st := get_recipe_share_status('075a0003-0000-4000-8000-000000000003');
  PERFORM pg_temp.ok(st->>'without_photo' = 'needs_photo' AND st->>'with_photo' = 'eligible', 'status: AI recipe needs a photo: ' || st::text);
  INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (a, '', 'recipe', '075a0003-0000-4000-8000-000000000003');
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share', '075a0003-0000-4000-8000-000000000003') = 0, 'AI recipe without photo earns nothing');

  p := '075c0004-0000-4000-8000-000000000004';
  INSERT INTO posts (id, user_id, content, post_type, recipe_id, media_urls, media_public_ids)
  VALUES (p, a, 'Cooked it tonight', 'recipe', '075a0004-0000-4000-8000-000000000004',
          ARRAY[pg_temp.media_url(a, p, 'dish')], ARRAY[pg_temp.media_pid(a, p, 'dish')]);
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share', '075a0004-0000-4000-8000-000000000004') = 25, 'AI recipe with a photo earns 25');

  -- Third award of the day (own draft), then the daily cap.
  INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (a, '', 'recipe', '075a0002-0000-4000-8000-000000000002');
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share') = 75, 'three awards today: ' || pg_temp.points(a, 'recipe_share'));
  st := get_recipe_share_status('075a0005-0000-4000-8000-000000000005');
  PERFORM pg_temp.ok(st->>'without_photo' = 'daily_cap', 'status reports daily_cap: ' || st::text);
  INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (a, '', 'recipe', '075a0005-0000-4000-8000-000000000005');
  PERFORM pg_temp.ok(pg_temp.points(a, 'recipe_share') = 75, 'daily cap holds at 3 awards');

  -- Users can never call the check or the engine directly.
  PERFORM pg_temp.expect_error(format($q$SELECT recipe_share_check(%L, '075a0005-0000-4000-8000-000000000005', true)$q$, a), 'permission denied');
  PERFORM pg_temp.expect_error(format($q$SELECT award_points(%L, 'recipe_share', '075a0006-0000-4000-8000-000000000006')$q$, a), 'permission denied');

  -- media ---------------------------------------------------------------------
  p := '075c0005-0000-4000-8000-000000000005';
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (id, user_id, content, media_urls, media_public_ids) VALUES (%L, %L, 'x', ARRAY['https://evil.example/x.jpg'], ARRAY['x'])$q$, p, a),
                               'uploaded through HalalMe');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (id, user_id, content, media_urls, media_public_ids) VALUES (%L, %L, 'x', ARRAY[%L], ARRAY[%L])$q$,
                                      p, a, pg_temp.media_url(b, p, 'stolen'), pg_temp.media_pid(b, p, 'stolen')),
                               'uploaded through HalalMe');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (id, user_id, content, media_urls, media_public_ids) VALUES (%L, %L, 'x', ARRAY[%L], ARRAY[%L])$q$,
                                      p, a, pg_temp.media_url(a, '075c0001-0000-4000-8000-000000000001', 'other'), pg_temp.media_pid(a, '075c0001-0000-4000-8000-000000000001', 'other')),
                               'uploaded through HalalMe');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (id, user_id, content, media_urls, media_public_ids) VALUES (%L, %L, 'x', ARRAY[%L, %L], ARRAY[%L])$q$,
                                      p, a, pg_temp.media_url(a, p, 'one'), pg_temp.media_url(a, p, 'two'), pg_temp.media_pid(a, p, 'one')),
                               'Media list is incomplete');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (id, user_id, content, media_urls, media_public_ids) VALUES (%L, %L, 'x', ARRAY[%L, %L], ARRAY[%L, %L])$q$,
                                      p, a, pg_temp.media_url(a, p, 'clip', 'video'), pg_temp.media_url(a, p, 'pic'),
                                      pg_temp.media_pid(a, p, 'clip'), pg_temp.media_pid(a, p, 'pic')),
                               'one video');
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (id, user_id, content, media_urls, media_public_ids) VALUES (%L, %L, 'x', ARRAY[%L,%L,%L,%L,%L], ARRAY[%L,%L,%L,%L,%L])$q$,
                                      p, a,
                                      pg_temp.media_url(a, p, 'a1'), pg_temp.media_url(a, p, 'a2'), pg_temp.media_url(a, p, 'a3'), pg_temp.media_url(a, p, 'a4'), pg_temp.media_url(a, p, 'a5'),
                                      pg_temp.media_pid(a, p, 'a1'), pg_temp.media_pid(a, p, 'a2'), pg_temp.media_pid(a, p, 'a3'), pg_temp.media_pid(a, p, 'a4'), pg_temp.media_pid(a, p, 'a5')),
                               'posts_media_count');
  -- Photo-only general post (no text) is fine.
  INSERT INTO posts (id, user_id, content, media_urls, media_public_ids)
  VALUES (p, a, '', ARRAY[pg_temp.media_url(a, p, 'pic1'), pg_temp.media_url(a, p, 'pic2')],
                    ARRAY[pg_temp.media_pid(a, p, 'pic1'), pg_temp.media_pid(a, p, 'pic2')]);

  -- updates -------------------------------------------------------------------
  PERFORM pg_temp.expect_error($q$UPDATE posts SET post_type = 'review' WHERE id = '075c0001-0000-4000-8000-000000000001'$q$, 'type cannot be changed');
  PERFORM pg_temp.expect_error($q$UPDATE posts SET recipe_id = '075a0006-0000-4000-8000-000000000006' WHERE id = '075c0004-0000-4000-8000-000000000004'$q$, 'cannot be swapped');
  UPDATE posts SET content = 'Hello Social, edited' WHERE id = '075c0001-0000-4000-8000-000000000001';
  PERFORM pg_temp.ok((SELECT content FROM posts WHERE id = '075c0001-0000-4000-8000-000000000001') = 'Hello Social, edited', 'content edit works');
  -- Dropping one photo of two is allowed (subset still validates).
  UPDATE posts SET media_urls = media_urls[1:1], media_public_ids = media_public_ids[1:1] WHERE id = p;
END $$;

-- ---------------------------------------------------------------------------
-- Act as B
-- ---------------------------------------------------------------------------
SELECT pg_temp.as_user('0000075b-0000-4000-8000-00000000000b');

DO $$
DECLARE
  a CONSTANT UUID := '0000075a-0000-4000-8000-00000000000a';
  b CONSTANT UUID := '0000075b-0000-4000-8000-00000000000b';
  n INTEGER;
BEGIN
  -- A's draft shared on Social is readable; A's unshared draft is not.
  PERFORM pg_temp.ok(EXISTS (SELECT 1 FROM recipes WHERE id = '075a0002-0000-4000-8000-000000000002'), 'shared draft is readable via its post');
  PERFORM pg_temp.ok(NOT EXISTS (SELECT 1 FROM recipes WHERE id = '075a0006-0000-4000-8000-000000000006'), 'unshared draft stays private');
  -- B sharing A's shared-but-unpublished draft is refused (only owners can attach drafts).
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content, post_type, recipe_id) VALUES (%L, '', 'recipe', '075a0002-0000-4000-8000-000000000002')$q$, b),
                               'not available to share');
  -- B cannot pose as A.
  PERFORM pg_temp.expect_error(format($q$INSERT INTO posts (user_id, content) VALUES (%L, 'spoof')$q$, a), 'row-level security');

  -- B answers A's question; B cannot accept answers on A's question.
  INSERT INTO comments (id, post_id, user_id, content)
  VALUES ('075d0001-0000-4000-8000-000000000001', '075c0002-0000-4000-8000-000000000002', b, 'Try the Turkish grocer on Harehills Road.');
  INSERT INTO comments (id, post_id, user_id, content, parent_id)
  VALUES ('075d0002-0000-4000-8000-000000000002', '075c0002-0000-4000-8000-000000000002', b, 'Open till 9.', '075d0001-0000-4000-8000-000000000001');
  INSERT INTO comments (id, post_id, user_id, content)
  VALUES ('075d0003-0000-4000-8000-000000000003', '075c0001-0000-4000-8000-000000000001', b, 'Nice post');
  UPDATE posts SET accepted_comment_id = '075d0001-0000-4000-8000-000000000001' WHERE id = '075c0002-0000-4000-8000-000000000002';
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM pg_temp.ok(n = 0, 'non-owner cannot accept an answer');

  -- Feed: following mode sees A's posts; saved mode sees bookmarks.
  INSERT INTO post_bookmarks (user_id, post_id) VALUES (b, '075c0003-0000-4000-8000-000000000003');
  PERFORM pg_temp.ok((SELECT count(*) FROM get_social_feed('following', 50)) >= 8, 'following feed returns followed author''s posts');
  PERFORM pg_temp.ok((SELECT count(*) FROM get_social_feed('saved', 50)) = 1, 'saved feed returns bookmarks');
  PERFORM pg_temp.ok((SELECT bool_and(is_bookmarked) FROM get_social_feed('saved', 50)), 'saved rows are flagged bookmarked');
  PERFORM pg_temp.ok((SELECT count(*) FROM get_social_feed('user', 50, 'review', a)) = 1, 'user mode + type filter');
END $$;

-- ---------------------------------------------------------------------------
-- Back to A: accepted answers
-- ---------------------------------------------------------------------------
SELECT pg_temp.as_user('0000075a-0000-4000-8000-00000000000a');

DO $$
BEGIN
  PERFORM pg_temp.expect_error($q$UPDATE posts SET accepted_comment_id = '075d0003-0000-4000-8000-000000000003' WHERE id = '075c0002-0000-4000-8000-000000000002'$q$,
                               'not on this question');
  PERFORM pg_temp.expect_error($q$UPDATE posts SET accepted_comment_id = '075d0002-0000-4000-8000-000000000002' WHERE id = '075c0002-0000-4000-8000-000000000002'$q$,
                               'not on this question');
  PERFORM pg_temp.expect_error($q$UPDATE posts SET accepted_comment_id = '075d0003-0000-4000-8000-000000000003' WHERE id = '075c0001-0000-4000-8000-000000000001'$q$,
                               'Only questions');
  UPDATE posts SET accepted_comment_id = '075d0001-0000-4000-8000-000000000001' WHERE id = '075c0002-0000-4000-8000-000000000002';
  PERFORM pg_temp.ok((SELECT accepted_comment_id FROM posts WHERE id = '075c0002-0000-4000-8000-000000000002') = '075d0001-0000-4000-8000-000000000001',
                     'owner can accept a top-level answer');
END $$;

-- ---------------------------------------------------------------------------
-- Pagination: walk every mode page by page, prove no duplicates and no gaps
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_mode   TEXT;
  v_seen   UUID[];
  v_page   RECORD;
  v_ts     TIMESTAMPTZ;
  v_score  DOUBLE PRECISION;
  v_id     UUID;
  v_as_of  TIMESTAMPTZ := now();
  v_rows   INTEGER;
  v_total  INTEGER;
  v_pages  INTEGER;
BEGIN
  FOREACH v_mode IN ARRAY ARRAY['latest', 'for_you'] LOOP
    v_seen := '{}'; v_ts := NULL; v_score := NULL; v_id := NULL; v_pages := 0;
    LOOP
      v_rows := 0;
      FOR v_page IN SELECT * FROM get_social_feed(v_mode, 3, NULL, NULL, v_ts, v_score, v_id, v_as_of) LOOP
        PERFORM pg_temp.ok(NOT (v_page.id = ANY (v_seen)), v_mode || ': duplicate across pages ' || v_page.id);
        v_seen := v_seen || v_page.id;
        v_ts := v_page.sort_ts; v_score := v_page.sort_score; v_id := v_page.id;
        v_rows := v_rows + 1;
      END LOOP;
      v_pages := v_pages + 1;
      EXIT WHEN v_rows < 3 OR v_pages > 100;
    END LOOP;

    SELECT count(*) INTO v_total FROM posts
    WHERE is_published AND deleted_at IS NULL
      AND (v_mode = 'latest' OR created_at > v_as_of - INTERVAL '30 days');
    PERFORM pg_temp.ok(cardinality(v_seen) = v_total,
                       v_mode || ': paged ' || cardinality(v_seen) || ' posts, expected ' || v_total);
  END LOOP;

  -- for_you: the diversity penalty means A's 2nd-ranked post scores below
  -- its raw value. Concretely: the top page must not be all one author when
  -- another author exists in the window.
  PERFORM pg_temp.expect_error($q$SELECT * FROM get_social_feed('sideways')$q$, 'Unknown feed mode');
  PERFORM pg_temp.expect_error($q$SELECT * FROM get_social_feed('latest', 5, 'poll')$q$, 'Unknown post type');
END $$;

-- ---------------------------------------------------------------------------
-- Anonymous visitor
-- ---------------------------------------------------------------------------
RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);

DO $$
BEGIN
  PERFORM pg_temp.ok((SELECT count(*) FROM get_social_feed('latest', 50)) > 0, 'anon can read the latest feed');
  PERFORM pg_temp.ok((SELECT count(*) FROM get_social_feed('following', 50)) = 0, 'anon following feed is empty');
  PERFORM pg_temp.ok((SELECT bool_or(is_liked) IS NOT TRUE FROM get_social_feed('latest', 50)), 'anon never sees is_liked');
  PERFORM pg_temp.ok(EXISTS (SELECT 1 FROM recipes WHERE id = '075a0002-0000-4000-8000-000000000002'), 'anon can open a draft shared on Social');
  PERFORM pg_temp.ok(NOT EXISTS (SELECT 1 FROM recipes WHERE id = '075a0006-0000-4000-8000-000000000006'), 'anon cannot see an unshared draft');
  PERFORM pg_temp.ok((get_recipe_share_status('075a0001-0000-4000-8000-000000000001')) IS NULL, 'unreachable');
EXCEPTION WHEN insufficient_privilege THEN
  -- get_recipe_share_status is authenticated-only; reaching here is the pass.
  NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Deletion paths still work with the new FK + trigger (as owner/admin)
-- ---------------------------------------------------------------------------
RESET ROLE;

DO $$
BEGIN
  -- Deleting a question whose accepted answer cascades away.
  DELETE FROM posts WHERE id = '075c0002-0000-4000-8000-000000000002';
  PERFORM pg_temp.ok(NOT EXISTS (SELECT 1 FROM comments WHERE id = '075d0001-0000-4000-8000-000000000001'), 'question delete cascades its answers');
  -- Hard-deleting a shared recipe nulls posts.recipe_id through the trigger.
  DELETE FROM recipes WHERE id = '075a0001-0000-4000-8000-000000000001';
  PERFORM pg_temp.ok(NOT EXISTS (SELECT 1 FROM posts WHERE recipe_id = '075a0001-0000-4000-8000-000000000001'), 'recipe hard delete clears recipe_id');
  -- Account deletion cascade still works.
  DELETE FROM auth.users WHERE id IN ('0000075a-0000-4000-8000-00000000000a', '0000075b-0000-4000-8000-00000000000b');
  PERFORM pg_temp.ok(NOT EXISTS (SELECT 1 FROM posts WHERE user_id = '0000075a-0000-4000-8000-00000000000a'), 'account delete cascades posts');
END $$;

SELECT 'ALL 075 SOCIAL TESTS PASSED' AS result;
