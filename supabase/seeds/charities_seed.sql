-- HalalMe Rewards - Real Charity Seed
-- Replaces dummy charities with verified real UK Islamic organisations
-- Run in Supabase SQL Editor

-- Deactivate previous dummy charities (can't DELETE - existing donations reference them)
UPDATE charities
SET is_active = FALSE, is_featured = FALSE
WHERE slug IN (
  'water-for-all', 'feed-the-hungry', 'education-hope',
  'medical-aid', 'orphan-care', 'refugee-support',
  'masjid-building', 'disaster-relief'
);

INSERT INTO charities (
  slug, name, legal_name, description, long_description,
  category, image_url,
  registration_number, country, charity_type,
  contact_email, website_url,
  goal_amount, raised_amount, donor_count,
  minimum_donation, platform_fee_pct, currency,
  verification_status, is_active, is_featured,
  is_zakat_eligible
) VALUES

-- ─── 1. Islamic Relief Worldwide ────────────────────────────────────────────
(
  'islamic-relief',
  'Islamic Relief Worldwide',
  'Islamic Relief Worldwide',
  'One of the world''s largest Muslim charities delivering humanitarian aid and sustainable development across 40+ countries.',
  'Founded in 1984 by Dr Hany El Banna in Birmingham, UK, Islamic Relief Worldwide is one of the most trusted Muslim charities in the world. We deliver emergency relief during disasters and run long-term development programmes in over 40 countries across Africa, Asia, the Middle East, and beyond.

Our work spans water and sanitation, food security, livelihood programmes, education, healthcare, and orphan sponsorship - all guided by Islamic values of compassion, justice, and human dignity. We ensure aid reaches the most vulnerable people regardless of race, religion, or gender.

Your support helps us respond to crises around the world, from earthquake relief to building schools and sinking water wells in remote communities. Registered charity number 328158 (England & Wales).',
  'Humanitarian Aid',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/islamic_relief.jpg',
  '328158', 'GB', 'ngo',
  'info@islamic-relief.org', 'https://www.islamic-relief.org',
  50000.00, 23400.00, 487,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  TRUE
),

-- ─── 2. Penny Appeal ────────────────────────────────────────────────────────
(
  'penny-appeal',
  'Penny Appeal',
  'Penny Appeal',
  'Making charity affordable for everyone - from feeding hungry families to building life-saving wells, every penny counts.',
  'Founded in 2009, Penny Appeal believes that charity should be affordable and accessible to all. Starting from just £1, our campaigns have helped millions of people around the world access food, clean water, shelter, and education.

We are best known for our "Feed a Family" programme that provides nutritious food parcels to vulnerable families, our water well projects in sub-Saharan Africa, and our orphan care sponsorship scheme. We also run domestic programmes helping homeless people right here in the UK.

Penny Appeal is built on the Islamic principle that even a single penny given with good intention can transform lives. Whether you give a little or a lot, your generosity changes the world. Registered charity number 1128341 (England & Wales).',
  'Food Security',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/penny_appeal.png',
  '1128341', 'GB', 'humanitarian',
  'info@pennyappeal.org', 'https://pennyappeal.org',
  25000.00, 14800.00, 324,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  TRUE
),

-- ─── 3. Human Appeal ────────────────────────────────────────────────────────
(
  'human-appeal',
  'Human Appeal',
  'Human Appeal',
  'Delivering life-saving emergency aid and sustainable development to communities affected by conflict and disaster.',
  'Human Appeal is a UK-based international humanitarian and development organisation with a presence in over 25 countries. Established in 1991, we have been at the forefront of delivering aid in some of the world''s most challenging environments - from Syria and Gaza to Yemen and Somalia.

Our programmes address the root causes of poverty and suffering through emergency relief, clean water access, food security, healthcare, education, and shelter. We operate to the highest standards of accountability and hold Disasters Emergency Committee (DEC) membership.

Every donation to Human Appeal goes directly to people in need. We are committed to transparency, efficiency, and ensuring your generosity creates maximum impact for the world''s most vulnerable. Registered charity number 1154288 (England & Wales).',
  'Emergency Response',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/Human_appeal_logo18.png',
  '1154288', 'GB', 'humanitarian',
  'info@humanappeal.org.uk', 'https://humanappeal.org.uk',
  35000.00, 19200.00, 412,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  TRUE
),

-- ─── 4. Muslim Aid ──────────────────────────────────────────────────────────
(
  'muslim-aid',
  'Muslim Aid',
  'Muslim Aid',
  'Providing clean water, emergency relief, and sustainable development to communities in need across 70+ countries worldwide.',
  'Established in 1985 in response to the African famine, Muslim Aid is a UK-based international development charity working in over 70 countries. We are motivated by the Islamic principles of compassion, social justice, and the belief that every human being has the right to live with dignity.

Our water and sanitation programmes have helped millions of people access safe drinking water, preventing disease and saving countless lives. We also deliver emergency food relief, education support, livelihood programmes, and healthcare - addressing immediate needs while building long-term resilience.

Muslim Aid works with local partners to ensure our programmes are culturally appropriate and community-led. Every pound you donate helps us extend our reach and deepen our impact. Registered charity number 295224 (England & Wales).',
  'Water & Sanitation',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/muslim_aid.jpg',
  '295224', 'GB', 'ngo',
  'info@muslimaid.org', 'https://www.muslimaid.org',
  30000.00, 12750.00, 218,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  TRUE
),

-- ─── 5. National Zakat Foundation ───────────────────────────────────────────
(
  'national-zakat-foundation',
  'National Zakat Foundation',
  'National Zakat Foundation',
  'The UK''s leading Zakat institution - ensuring your Zakat reaches Muslims in need right here in Britain.',
  'The National Zakat Foundation (NZF) is the UK''s leading Zakat institution, established in 2011 to connect Zakat payers with Muslims in financial hardship across Britain. We collect Zakat and distribute it to eligible recipients - Muslims struggling with poverty, debt, unemployment, or housing insecurity - right here in the UK.

Paying Zakat through NZF fulfils your Islamic obligation while supporting the local Muslim community. Our rigorous assessment process ensures that Zakat reaches only those who are truly eligible, in line with Islamic scholarship, and we work with recognised scholars to maintain the highest standards of Sharia compliance.

Zakat is one of the five pillars of Islam - a spiritual duty and a means of purifying wealth. By fulfilling your Zakat obligation through NZF, you help build a stronger, more self-sufficient Muslim community in the UK. Registered charity number 1153719 (England & Wales).',
  'Islamic Projects',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/zakat.png',
  '1153719', 'GB', 'foundation',
  'info@nzf.org.uk', 'https://nzf.org.uk',
  40000.00, 31200.00, 673,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  TRUE
),

-- ─── 6. Ummah Welfare Trust ─────────────────────────────────────────────────
(
  'ummah-welfare-trust',
  'Ummah Welfare Trust',
  'Ummah Welfare Trust',
  'Caring for orphans, widows, and the most vulnerable through dignified, impactful charity that transforms lives.',
  'Established in 2001, Ummah Welfare Trust (UWT) is a UK-based charity operating in some of the world''s most deprived regions including Pakistan, Bangladesh, Syria, Yemen, Palestine, and Gaza. We pride ourselves on one of the lowest administration cost ratios in the sector, ensuring maximum impact for every donation.

Our programmes focus on orphan sponsorship - providing food, shelter, education, and emotional care to children who have lost parents - as well as water well construction, emergency food relief, medical care, and winter aid. We also support widows and elderly people who have no one to care for them.

UWT is guided by Islamic values and run by people who are themselves from the communities we serve. We believe in grassroots, community-based delivery that respects the dignity of those we help. Registered charity number 1100438 (England & Wales).',
  'Children & Youth',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/ummah.jpg',
  '1100438', 'GB', 'ngo',
  'info@uwt.org', 'https://www.uwt.org',
  20000.00, 8900.00, 156,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  TRUE
),

-- ─── 7. Read Foundation ─────────────────────────────────────────────────────
(
  'read-foundation',
  'Read Foundation',
  'Read Foundation',
  'Building schools and empowering communities through quality education in some of the world''s most underserved regions.',
  'The Read Foundation is a UK-based charity dedicated to providing quality education to disadvantaged children in Pakistan and beyond. Since our founding, we have established over 800 schools, educated more than 200,000 students, and trained thousands of teachers - making us one of the most impactful education charities operating in the region.

We believe that education is the single most powerful tool for breaking the cycle of poverty. Our work includes constructing school buildings in remote areas, providing scholarships and learning materials, running adult literacy programmes, and training local teachers to deliver quality instruction.

Education is an Islamic right and duty - the first word revealed in the Quran is "Iqra" (Read). At Read Foundation, we put that command into practice every day, ensuring every child, regardless of their circumstances, has the chance to learn and grow. Registered charity number 1135752 (England & Wales).',
  'Education',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/read_foundation.jpg',
  '1135752', 'GB', 'foundation',
  'info@readfoundation.org', 'https://www.readfoundation.org',
  28000.00, 11600.00, 203,
  5.00, 5.00, 'GBP',
  'approved', TRUE, FALSE,
  FALSE
),

-- ─── 8. Medical Aid for Palestinians ────────────────────────────────────────
(
  'medical-aid-for-palestinians',
  'Medical Aid for Palestinians',
  'Medical Aid for Palestinians',
  'Providing healthcare and relief to Palestinians living under occupation, siege, and in refugee camps across the Middle East.',
  'Medical Aid for Palestinians (MAP) works for the health and dignity of Palestinians living under occupation and as refugees. Founded in 1984, MAP delivers health and medical care to the most vulnerable Palestinians in Gaza, the West Bank, Lebanon, and Jordan - often in the most challenging and dangerous conditions imaginable.

Our work includes primary healthcare, maternal and child health, mental health and psychosocial support, and emergency medical assistance during periods of escalation. We also train Palestinian health workers and strengthen local health systems to build long-term resilience.

MAP advocates internationally for Palestinian rights and the right to healthcare as protected under international law. Every donation helps us reach people who have no other access to medical care, providing not just treatment but hope. Registered charity number 1045315 (England & Wales).',
  'Healthcare',
  'https://eajtmdqnepiqjpadplwo.supabase.co/storage/v1/object/public/charity-images/MAP.png',
  '1045315', 'GB', 'ngo',
  'info@map.org.uk', 'https://map.org.uk',
  45000.00, 28700.00, 634,
  5.00, 5.00, 'GBP',
  'approved', TRUE, TRUE,
  FALSE
)

ON CONFLICT (slug) DO UPDATE SET
  name                = EXCLUDED.name,
  legal_name          = EXCLUDED.legal_name,
  description         = EXCLUDED.description,
  long_description    = EXCLUDED.long_description,
  category            = EXCLUDED.category,
  image_url           = EXCLUDED.image_url,
  registration_number = EXCLUDED.registration_number,
  country             = EXCLUDED.country,
  charity_type        = EXCLUDED.charity_type,
  contact_email       = EXCLUDED.contact_email,
  website_url         = EXCLUDED.website_url,
  goal_amount         = EXCLUDED.goal_amount,
  raised_amount       = EXCLUDED.raised_amount,
  donor_count         = EXCLUDED.donor_count,
  minimum_donation    = EXCLUDED.minimum_donation,
  platform_fee_pct    = EXCLUDED.platform_fee_pct,
  currency            = EXCLUDED.currency,
  verification_status = EXCLUDED.verification_status,
  is_active           = EXCLUDED.is_active,
  is_featured         = EXCLUDED.is_featured,
  is_zakat_eligible   = EXCLUDED.is_zakat_eligible;
