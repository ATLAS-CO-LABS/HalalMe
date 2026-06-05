-- =============================================================================
-- 031_recipe_real_images.sql
-- Replace TheMealDB approximation images (migration 026) with the real,
-- purpose-shot dish photos stored in /public/images/Recipes/.
-- Paths are local static assets: lowercase-hyphen slugs, .jpg, case-sensitive.
-- Safe to re-run.
-- =============================================================================

DO $$
DECLARE
  v_uid UUID := '0625de77-8d43-4bf3-8749-24d8a17e4229';
BEGIN

  -- Helper note: image_public_id is cleared to NULL because these are local
  -- assets, not Cloudinary uploads (prevents stale transform/delete attempts).

  UPDATE recipes SET image_url = '/images/Recipes/chicken-biryani.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Chicken Biryani';

  UPDATE recipes SET image_url = '/images/Recipes/butter-chicken.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Butter Chicken';

  UPDATE recipes SET image_url = '/images/Recipes/dal-makhani.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Dal Makhani';

  UPDATE recipes SET image_url = '/images/Recipes/haleem.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Haleem';

  UPDATE recipes SET image_url = '/images/Recipes/chicken-nihari.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Chicken Nihari';

  UPDATE recipes SET image_url = '/images/Recipes/crispy-potato-samosas.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Crispy Potato Samosas';

  UPDATE recipes SET image_url = '/images/Recipes/chicken-shawarma.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Chicken Shawarma';

  UPDATE recipes SET image_url = '/images/Recipes/crispy-falafel.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Crispy Falafel';

  UPDATE recipes SET image_url = '/images/Recipes/jordanian-lamb-mansaf.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Jordanian Lamb Mansaf';

  UPDATE recipes SET image_url = '/images/Recipes/saudi-kabsa.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Saudi Kabsa';

  UPDATE recipes SET image_url = '/images/Recipes/lebanese-tabbouleh.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Lebanese Tabbouleh';

  UPDATE recipes SET image_url = '/images/Recipes/baked-kibbeh.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Baked Kibbeh';

  UPDATE recipes SET image_url = '/images/Recipes/moroccan-chicken-tagine.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Moroccan Chicken Tagine';

  UPDATE recipes SET image_url = '/images/Recipes/harira-soup.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Harira Soup';

  UPDATE recipes SET image_url = '/images/Recipes/moroccan-lamb-couscous.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Moroccan Lamb Couscous';

  UPDATE recipes SET image_url = '/images/Recipes/chicken-bastilla.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Chicken Bastilla';

  UPDATE recipes SET image_url = '/images/Recipes/iskender-kebab.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Iskender Kebab';

  UPDATE recipes SET image_url = '/images/Recipes/lahmacun.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Lahmacun';

  UPDATE recipes SET image_url = '/images/Recipes/menemen.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Menemen';

  UPDATE recipes SET image_url = '/images/Recipes/nigerian-suya-skewers.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Nigerian Suya Skewers';

  UPDATE recipes SET image_url = '/images/Recipes/tandoori-chicken.png', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Tandoori Chicken';

  UPDATE recipes SET image_url = '/images/Recipes/classic-hummus.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Classic Hummus';

  UPDATE recipes SET image_url = '/images/Recipes/west-african-jollof-rice.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'West African Jollof Rice';

  UPDATE recipes SET image_url = '/images/Recipes/chermoula-grilled-sea-bass.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Chermoula Grilled Sea Bass';

  UPDATE recipes SET image_url = '/images/Recipes/lamb-seekh-kebab.jpg', image_public_id = NULL
  WHERE user_id = v_uid AND title = 'Lamb Seekh Kebab';

END $$;
