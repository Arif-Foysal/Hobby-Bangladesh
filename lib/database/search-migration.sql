-- Migration: Full-Text Search for Products
-- Run this in Supabase SQL Editor after the base migration.
-- Adds a tsvector column for ranked full-text search across name, short_desc, description.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(short_desc, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS products_search_idx
ON public.products USING GIN(search_vector);
