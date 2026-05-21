-- =============================================================================
-- 026_recipe_images_fix.sql
-- Replace incorrect Unsplash placeholder images with accurate TheMealDB images.
-- =============================================================================

DO $$
DECLARE
  v_uid UUID := '0625de77-8d43-4bf3-8749-24d8a17e4229';
BEGIN

  -- 1. Chicken Biryani → Lamb Biryani (exact dish)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/xrttsx1487339558.jpg'
  WHERE user_id = v_uid AND title = 'Chicken Biryani';

  -- 2. Butter Chicken → Nutty Chicken Curry (orange tomato-cream curry)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/yxsurp1511304301.jpg'
  WHERE user_id = v_uid AND title = 'Butter Chicken';

  -- 3. Lamb Seekh Kebab → Adana Kebab (exact match — minced lamb on skewer)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/04axct1763793018.jpg'
  WHERE user_id = v_uid AND title = 'Lamb Seekh Kebab';

  -- 4. Dal Makhani → Dal Fry (lentil dish)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg'
  WHERE user_id = v_uid AND title = 'Dal Makhani';

  -- 5. Haleem → Lamb Rogan Josh (rich, slow-cooked lamb stew)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/vvstvq1487342592.jpg'
  WHERE user_id = v_uid AND title = 'Haleem';

  -- 6. Chicken Nihari → Chicken Handi (similar thick chicken gravy)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/wyxwsp1486979827.jpg'
  WHERE user_id = v_uid AND title = 'Chicken Nihari';

  -- 7. Crispy Potato Samosas → Beef Empanadas (closest pastry pocket match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/dxpc7j1764370714.jpg'
  WHERE user_id = v_uid AND title = 'Crispy Potato Samosas';

  -- 8. Tandoori Chicken → Tandoori Chicken (exact match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/qptpvt1487339892.jpg'
  WHERE user_id = v_uid AND title = 'Tandoori Chicken';

  -- 9. Chicken Shawarma → Chicken Shawarma with garlic herb yoghurt (exact match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/hcg6l91763596970.jpg'
  WHERE user_id = v_uid AND title = 'Chicken Shawarma';

  -- 10. Classic Hummus → Hummus (exact match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/gpon5u1763801180.jpg'
  WHERE user_id = v_uid AND title = 'Classic Hummus';

  -- 11. Crispy Falafel → Falafel (exact match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/u5e9qq1763795441.jpg'
  WHERE user_id = v_uid AND title = 'Crispy Falafel';

  -- 12. Jordanian Lamb Mansaf → Turkish Lamb Pilau (lamb and rice dish)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/cr2kyr1763793839.jpg'
  WHERE user_id = v_uid AND title = 'Jordanian Lamb Mansaf';

  -- 13. Saudi Kabsa → Beef Mandi (nearly identical Arabian rice-and-meat dish)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/1nalo51765188375.jpg'
  WHERE user_id = v_uid AND title = 'Saudi Kabsa';

  -- 14. Lebanese Tabbouleh → Falafel Pita (fresh herbs, parsley, Middle Eastern)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/ae6clc1760524712.jpg'
  WHERE user_id = v_uid AND title = 'Lebanese Tabbouleh';

  -- 15. Baked Kibbeh → Turkish-style Lamb (baked spiced lamb dish)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/0p7l6b1763813981.jpg'
  WHERE user_id = v_uid AND title = 'Baked Kibbeh';

  -- 16. Moroccan Chicken Tagine → Tajine de Poulet (exact match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/d8bfyg1764117503.jpg'
  WHERE user_id = v_uid AND title = 'Moroccan Chicken Tagine';

  -- 17. Harira Soup → Chorba Hamra bel Frik (Algerian lamb & tomato soup, essentially harira)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/p9tebp1764118792.jpg'
  WHERE user_id = v_uid AND title = 'Harira Soup';

  -- 18. Moroccan Lamb Couscous → Chicken Couscous (same dish, couscous platter)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/qxytrx1511304021.jpg'
  WHERE user_id = v_uid AND title = 'Moroccan Lamb Couscous';

  -- 19. Chicken Bastilla → Spanish Chicken Pie (chicken pastry pie)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/8ovxf41763253962.jpg'
  WHERE user_id = v_uid AND title = 'Chicken Bastilla';

  -- 20. Iskender Kebab → Imam Bayildi with BBQ Lamb (Turkish lamb with sauce)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/ampz9v1763787134.jpg'
  WHERE user_id = v_uid AND title = 'Iskender Kebab';

  -- 21. Lahmacun → Turkish Lahmacun (exact match)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/tqd3ac1763786065.jpg'
  WHERE user_id = v_uid AND title = 'Lahmacun';

  -- 22. Menemen → Shakshuka (eggs cooked in tomato-pepper sauce, essentially the same dish)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/g373701551450225.jpg'
  WHERE user_id = v_uid AND title = 'Menemen';

  -- 23. West African Jollof Rice → Syrian Rice with Meat (tomato-based spiced rice)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/zg2b9l1760524940.jpg'
  WHERE user_id = v_uid AND title = 'West African Jollof Rice';

  -- 24. Nigerian Suya Skewers → Smoky Chicken Skewers (grilled skewers on charcoal)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/3um6il1763794322.jpg'
  WHERE user_id = v_uid AND title = 'Nigerian Suya Skewers';

  -- 25. Chermoula Grilled Sea Bass → Recheado Masala Fish (spiced whole fish, similar preparation)
  UPDATE recipes SET image_url = 'https://www.themealdb.com/images/media/meals/uwxusv1487344500.jpg'
  WHERE user_id = v_uid AND title = 'Chermoula Grilled Sea Bass';

END $$;
