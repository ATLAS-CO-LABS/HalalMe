-- =============================================================================
-- 076_social_post_validation.sql
-- Social: server-side post validation + unlisted recipe visibility via Social.
--
-- APPLY THIS WHEN THE NEW SOCIAL COMPOSER IS DEPLOYED, NOT BEFORE.
--   The previous composer inserts 'recipe' posts without a recipe_id and
--   'question' / 'review' posts without a title or rating. This trigger
--   rejects those, so applying it ahead of the frontend would break posting
--   for three of the four post types on the live site.
--
--   The shared-recipe read policy (section 2) lives here rather than in 075
--   on purpose: it is only safe together with validate_post(), which is what
--   stops a user attaching someone else's draft to a post to make it readable.
--
-- Prerequisite: 075_social_posts_v2.sql
-- Tests: supabase/tests/075_social_posts_v2.test.sql (covers 075 + 076)
-- =============================================================================


-- =============================================================================
-- 1. validate_post(): the shape of each post type, enforced server-side
--
--   general  : text and/or media. No recipe, title, rating or subject.
--   recipe   : must attach a recipe the poster can share (published, or their
--              own draft). Caption optional.
--   question : title (the question itself, 10-200 chars) required. Details
--              optional. Only questions can have an accepted answer.
--   review   : subject (2-120 chars) + rating (1-5) + at least 10 chars of text.
--
--   Media: up to 4 images, or exactly 1 video. Every URL must be a Cloudinary
--   asset in halalme/posts/{user_id}/{post_id}/, which is the folder
--   /api/upload/sign builds from the session. So a post can only carry files
--   its own author uploaded for that post, never a hotlinked or foreign file.
--
--   On UPDATE only changed fields are re-checked, so legacy rows stay editable.
--   user_id and post_type are immutable. recipe_id may only be cleared (the FK
--   ON DELETE SET NULL does that when a recipe is hard-deleted).
--
--   SECURITY INVOKER on purpose: the recipe lookup runs under the caller's RLS,
--   so another user's draft is simply "not found".
-- =============================================================================

-- One place to change the Cloudinary cloud the media check accepts.
CREATE OR REPLACE FUNCTION social_media_cloud()
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$ SELECT 'dh6is9zed'::text $$;

CREATE OR REPLACE FUNCTION validate_post()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_recipe      RECORD;
  v_comment     RECORD;
  v_url_re      TEXT;
  v_pid_prefix  TEXT;
  v_n           INTEGER;
  v_videos      INTEGER := 0;
  v_is_insert   BOOLEAN := TG_OP = 'INSERT';
  v_has_media   BOOLEAN;
BEGIN
  -- Normalise: blank optional text becomes NULL, media arrays never NULL.
  NEW.title            := NULLIF(btrim(NEW.title), '');
  NEW.review_subject   := NULLIF(btrim(NEW.review_subject), '');
  NEW.media_urls       := COALESCE(NEW.media_urls, '{}');
  NEW.media_public_ids := COALESCE(NEW.media_public_ids, '{}');
  v_has_media          := cardinality(NEW.media_urls) > 0;

  IF NOT v_is_insert THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'A post cannot change owner.' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.post_type IS DISTINCT FROM OLD.post_type THEN
      RAISE EXCEPTION 'A post''s type cannot be changed after posting.' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.recipe_id IS DISTINCT FROM OLD.recipe_id AND NEW.recipe_id IS NOT NULL THEN
      RAISE EXCEPTION 'The recipe on a post cannot be swapped.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- ---- Per-type field rules ------------------------------------------------
  IF v_is_insert
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.rating IS DISTINCT FROM OLD.rating
     OR NEW.review_subject IS DISTINCT FROM OLD.review_subject
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.media_urls IS DISTINCT FROM OLD.media_urls THEN

    IF NEW.post_type <> 'question' AND NEW.title IS NOT NULL THEN
      RAISE EXCEPTION 'Only questions have a title.' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.post_type <> 'review' AND (NEW.rating IS NOT NULL OR NEW.review_subject IS NOT NULL) THEN
      RAISE EXCEPTION 'Only reviews have a rating.' USING ERRCODE = 'check_violation';
    END IF;

    CASE NEW.post_type
      WHEN 'general' THEN
        IF btrim(NEW.content) = '' AND NOT v_has_media THEN
          RAISE EXCEPTION 'Write something or add a photo.' USING ERRCODE = 'check_violation';
        END IF;
      WHEN 'question' THEN
        IF NEW.title IS NULL THEN
          RAISE EXCEPTION 'Questions need the question itself (at least 10 characters).' USING ERRCODE = 'check_violation';
        END IF;
      WHEN 'review' THEN
        IF NEW.review_subject IS NULL OR NEW.rating IS NULL THEN
          RAISE EXCEPTION 'Reviews need what you are reviewing and a star rating.' USING ERRCODE = 'check_violation';
        END IF;
        IF char_length(btrim(NEW.content)) < 10 THEN
          RAISE EXCEPTION 'Reviews need at least 10 characters of text.' USING ERRCODE = 'check_violation';
        END IF;
      ELSE
        NULL; -- 'recipe' is checked below; post_type itself is a CHECK constraint.
    END CASE;
  END IF;

  -- ---- Recipe attachment ---------------------------------------------------
  IF NEW.post_type <> 'recipe' AND NEW.recipe_id IS NOT NULL THEN
    RAISE EXCEPTION 'Only recipe posts can attach a recipe.' USING ERRCODE = 'check_violation';
  END IF;

  IF v_is_insert AND NEW.post_type = 'recipe' THEN
    IF NEW.recipe_id IS NULL THEN
      RAISE EXCEPTION 'Choose a recipe to share.' USING ERRCODE = 'check_violation';
    END IF;
    SELECT id, user_id, is_published, deleted_at INTO v_recipe
    FROM recipes WHERE id = NEW.recipe_id;
    IF NOT FOUND
       OR v_recipe.deleted_at IS NOT NULL
       OR (NOT v_recipe.is_published AND v_recipe.user_id <> NEW.user_id) THEN
      RAISE EXCEPTION 'That recipe is not available to share.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- ---- Accepted answer -----------------------------------------------------
  IF NEW.accepted_comment_id IS NOT NULL
     AND (v_is_insert OR NEW.accepted_comment_id IS DISTINCT FROM OLD.accepted_comment_id) THEN
    IF NEW.post_type <> 'question' THEN
      RAISE EXCEPTION 'Only questions can have an accepted answer.' USING ERRCODE = 'check_violation';
    END IF;
    SELECT post_id, parent_id, deleted_at INTO v_comment
    FROM comments WHERE id = NEW.accepted_comment_id;
    IF NOT FOUND OR v_comment.post_id <> NEW.id OR v_comment.parent_id IS NOT NULL OR v_comment.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'That answer is not on this question.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- ---- Media ---------------------------------------------------------------
  IF v_is_insert
     OR NEW.media_urls IS DISTINCT FROM OLD.media_urls
     OR NEW.media_public_ids IS DISTINCT FROM OLD.media_public_ids THEN

    v_n := cardinality(NEW.media_urls);
    IF v_n <> cardinality(NEW.media_public_ids) THEN
      RAISE EXCEPTION 'Media list is incomplete.' USING ERRCODE = 'check_violation';
    END IF;

    v_pid_prefix := 'halalme/posts/' || NEW.user_id || '/' || NEW.id || '/';
    v_url_re := '^https://res\.cloudinary\.com/' || social_media_cloud()
             || '/(image|video)/upload/(v[0-9]+/)?' || v_pid_prefix
             || '[A-Za-z0-9_-]+\.[A-Za-z0-9]+$';

    FOR i IN 1..v_n LOOP
      IF NEW.media_urls[i] !~ v_url_re
         OR NEW.media_public_ids[i] IS NULL
         OR left(NEW.media_public_ids[i], length(v_pid_prefix)) <> v_pid_prefix
         OR position(NEW.media_public_ids[i] IN NEW.media_urls[i]) = 0 THEN
        RAISE EXCEPTION 'Media must be uploaded through HalalMe for this post.' USING ERRCODE = 'check_violation';
      END IF;
      IF NEW.media_urls[i] LIKE '%/video/upload/%' THEN
        v_videos := v_videos + 1;
      END IF;
    END LOOP;

    IF v_videos > 0 AND v_n > 1 THEN
      RAISE EXCEPTION 'A post can have one video, or up to 4 photos.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_validate ON posts;
CREATE TRIGGER posts_validate
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION validate_post();


-- =============================================================================
-- 2. Unlisted recipes: anything attached to a live Social post is readable.
--    Explore, search and the sitemap all filter is_published = true, so a
--    shared draft is reachable from the post but never listed. Only the owner
--    can attach their own draft (validate_post), so this cannot expose anyone
--    else's private recipe. posts policies never reference recipes, so there is
--    no RLS recursion.
-- =============================================================================

DROP POLICY IF EXISTS "Recipes shared on Social are viewable" ON recipes;
CREATE POLICY "Recipes shared on Social are viewable" ON recipes
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM posts p
      WHERE p.recipe_id = recipes.id
        AND p.is_published
        AND p.deleted_at IS NULL
    )
  );


