-- =============================================================================
-- 007_travel.sql
-- travel_searches, price_alerts, city_guides
-- =============================================================================

-- =============================================================================
-- travel_searches  (recent + saved searches)
-- params shape varies by search_type:
--   flight: {origin, destination, departDate, returnDate, passengers, cabinClass}
--   hotel:  {destination, checkIn, checkOut, guests, rooms}
--   car:    {pickupLocation, dropoffLocation, pickupDate, dropoffDate}
-- =============================================================================
CREATE TABLE travel_searches (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  search_type  TEXT NOT NULL CHECK (search_type IN ('flight', 'hotel', 'car')),
  params       JSONB NOT NULL,
  label        TEXT,
  is_saved     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- price_alerts
-- =============================================================================
CREATE TABLE price_alerts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  search_type    TEXT NOT NULL CHECK (search_type IN ('flight', 'hotel', 'car')),
  params         JSONB NOT NULL,
  target_price   NUMERIC(10,2) NOT NULL CHECK (target_price > 0),
  current_price  NUMERIC(10,2),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  triggered_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- city_guides  (CMS-managed)
-- halal_info shape: {
--   mosques_count: number,
--   halal_restaurants_count: string,
--   prayer_facilities_available: boolean,
--   muslim_population_percent: number,
--   tips: string[]
-- }
-- =============================================================================
CREATE TABLE city_guides (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  country             TEXT NOT NULL,
  hero_image_url      TEXT,
  description         TEXT,
  halal_score         SMALLINT CHECK (halal_score BETWEEN 1 AND 5),
  overview            TEXT,
  best_time_to_visit  TEXT,
  language            TEXT,
  currency            TEXT,
  timezone            TEXT,
  halal_info          JSONB,
  attractions         JSONB,
  mosques             JSONB,
  halal_restaurants   JSONB,
  travel_tips         TEXT[],
  flight_price_from   NUMERIC(8,2),
  hotel_price_from    NUMERIC(8,2),
  is_published        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER city_guides_updated_at
  BEFORE UPDATE ON city_guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS: travel_searches
-- =============================================================================
ALTER TABLE travel_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own searches"
  ON travel_searches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS: price_alerts
-- =============================================================================
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own price alerts"
  ON price_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS: city_guides
-- =============================================================================
ALTER TABLE city_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published city guides are public"
  ON city_guides FOR SELECT USING (is_published = true);

CREATE POLICY "Admins manage city guides"
  ON city_guides FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
