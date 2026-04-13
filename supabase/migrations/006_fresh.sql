-- =============================================================================
-- 006_fresh.sql
-- meals, orders
-- Note: order items kept as JSONB for now (MVP). Future: order_items table.
-- =============================================================================

-- =============================================================================
-- meals  (admin-managed catalog)
-- =============================================================================
CREATE TABLE meals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT NOT NULL,
  long_description TEXT,
  price            NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  image_url        TEXT,
  category         TEXT NOT NULL,
  calories         INTEGER,
  protein          NUMERIC(5,1),
  carbs            NUMERIC(5,1),
  fat              NUMERIC(5,1),
  prep_time        TEXT,
  servings         INTEGER,
  ingredients      TEXT[] DEFAULT '{}',
  allergens        TEXT[] DEFAULT '{}',
  is_popular       BOOLEAN NOT NULL DEFAULT FALSE,
  is_new           BOOLEAN NOT NULL DEFAULT FALSE,
  is_available     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- orders
-- items JSONB shape: [{meal_id, meal_name, quantity, unit_price, image_url}]
-- delivery_address shape: {street, city, postcode, country, notes}
-- =============================================================================
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items               JSONB NOT NULL,
  total_amount        NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_address    JSONB NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                          'pending', 'confirmed', 'preparing',
                          'out_for_delivery', 'delivered', 'cancelled'
                        )),
  payment_ref         TEXT,
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                        CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes               TEXT,
  estimated_delivery  TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RLS: meals
-- =============================================================================
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Available meals are publicly readable"
  ON meals FOR SELECT USING (is_available = true);

CREATE POLICY "Admins manage meals"
  ON meals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- RLS: orders
-- =============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can place orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Status updates done via service role (delivery webhook)
CREATE POLICY "Admins manage all orders"
  ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
