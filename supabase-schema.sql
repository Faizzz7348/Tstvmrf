-- Supabase Schema for Delivery Routes Management
-- Run this in your Supabase SQL Editor

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  location TEXT NOT NULL,
  delivery TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('AM', 'PM')),
  region TEXT NOT NULL CHECK (region IN ('kuala-lumpur', 'selangor')),
  delivery_mode TEXT CHECK (delivery_mode IN ('daily', 'alt1', 'alt2', 'weekday', 'weekend')),
  last_update_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  no INTEGER NOT NULL,
  code TEXT NOT NULL,
  location TEXT NOT NULL,
  delivery TEXT NOT NULL,
  delivery_mode TEXT CHECK (delivery_mode IN ('daily', 'alt1', 'alt2', 'weekday', 'weekend')),
  lat TEXT,
  lng TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routes_region ON routes(region);
CREATE INDEX IF NOT EXISTS idx_routes_code ON routes(code);
CREATE INDEX IF NOT EXISTS idx_locations_route_id ON locations(route_id);
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);

-- Enable Row Level Security (RLS)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth needs)
CREATE POLICY "Allow all operations on routes" ON routes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on locations" ON locations
  FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
