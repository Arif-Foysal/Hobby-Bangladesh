-- Add landing page fields to products table
ALTER TABLE products
  ADD COLUMN features JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN landing_page_enabled BOOLEAN DEFAULT false,
  ADD COLUMN landing_page_sections JSONB DEFAULT '[]'::jsonb;
