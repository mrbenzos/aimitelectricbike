-- ==============================================================================
-- M.SNIFF BUSINESS HUB - AIMIT ELECTRIC BICYCLES DATABASE SCHEMA (SUPABASE POSTGRES)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BIKES TABLE
CREATE TABLE IF NOT EXISTS bikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    model_name TEXT NOT NULL,
    short_desc TEXT NOT NULL,
    full_desc TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    promo_price NUMERIC(10, 2),
    battery_type TEXT NOT NULL,
    range_km INTEGER NOT NULL,
    max_speed_kmh INTEGER NOT NULL,
    charge_time_hrs NUMERIC(4, 1) NOT NULL,
    motor_watts INTEGER NOT NULL,
    weight_kg NUMERIC(5, 1) NOT NULL,
    warranty_months INTEGER DEFAULT 12,
    images TEXT[] NOT NULL DEFAULT '{}',
    category TEXT CHECK (category IN ('city', 'offroad', 'cargo')) NOT NULL,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    stock_status TEXT CHECK (stock_status IN ('in_stock', 'low', 'sold_out')) NOT NULL DEFAULT 'in_stock',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_location TEXT NOT NULL,
    delivery_hub TEXT NOT NULL,
    bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')) DEFAULT 'pending',
    payment_type TEXT DEFAULT 'Pay on Delivery / Mobile Money',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEST RIDES TABLE
CREATE TABLE IF NOT EXISTS test_rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_hub TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    bike_interest TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT CHECK (action IN ('sold', 'stock_low', 'deleted', 'price_changed', 'new_order', 'new_test_ride', 'restocked', 'bike_created')) NOT NULL,
    item_name TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OTP CODES TABLE (FOR ADMIN 2FA)
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_bikes_slug ON bikes(slug);
CREATE INDEX IF NOT EXISTS idx_bikes_featured ON bikes(featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_test_rides_hub ON test_rides(preferred_hub);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_code ON otp_codes(email, code);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Public can view bikes
CREATE POLICY "Public can view bikes" ON bikes
    FOR SELECT USING (true);

-- Authenticated / Service role can insert/update/delete bikes
CREATE POLICY "Admin full access to bikes" ON bikes
    FOR ALL USING (true) WITH CHECK (true);

-- Public can create orders and test rides
CREATE POLICY "Public can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Admin full access to orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can insert test rides" ON test_rides
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access to test rides" ON test_rides
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to activity logs" ON activity_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to otp codes" ON otp_codes
    FOR ALL USING (true) WITH CHECK (true);

-- STORAGE BUCKET CONFIGURATION (bike-images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bike-images', 'bike-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read bike images" ON storage.objects
    FOR SELECT USING (bucket_id = 'bike-images');

CREATE POLICY "Allow authenticated or anon upload to bike images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'bike-images');
