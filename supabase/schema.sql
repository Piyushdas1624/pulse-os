-- PulseOS Normalized Relational PostgreSQL Database Schema
-- Run in Supabase SQL Editor

-- 1. Tables
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status VARCHAR(30) NOT NULL DEFAULT 'available',
  x_pos INT NOT NULL,
  y_pos INT NOT NULL,
  active_order_id UUID,
  bill_amount NUMERIC(10, 2) DEFAULT 0.00,
  seated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  prep_time_mins INT NOT NULL DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE,
  stock_qty INT DEFAULT 50,
  description TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  table_number INT NOT NULL,
  customer_name VARCHAR(100) DEFAULT 'Guest',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10, 2) DEFAULT 0.00,
  wait_time_est INT DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  status VARCHAR(30) DEFAULT 'pending',
  special_instructions TEXT
);

-- 5. Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  current_stock NUMERIC(10, 2) NOT NULL,
  min_threshold NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_cost NUMERIC(10, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Kitchen Queue
CREATE TABLE IF NOT EXISTS kitchen_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  dish_name VARCHAR(100) NOT NULL,
  qty INT DEFAULT 1,
  table_numbers JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(30) DEFAULT 'pending',
  station VARCHAR(50) DEFAULT 'Station A (Grill)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Live Events
CREATE TABLE IF NOT EXISTS live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info',
  table_number INT
);

-- 8. AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  problem TEXT,
  cause TEXT,
  recommendation TEXT,
  business_impact JSONB,
  confidence INT DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime Subscriptions Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE kitchen_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE live_events;
