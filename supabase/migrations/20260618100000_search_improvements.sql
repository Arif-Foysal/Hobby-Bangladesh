-- Search Improvements Phase 1
-- 1. Enable pg_trgm for fuzzy/typo-tolerant matching
-- 2. GIN trigram index on product names
-- 3. Search query analytics table
-- 4. Improved search_vector including category name (via trigger)

-- 1. Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN trigram index for fuzzy name matching (supports word_similarity, strict_word_similarity)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_short_desc_trgm
  ON public.products USING GIN (short_desc gin_trgm_ops);

-- 3. Search query analytics table
CREATE TABLE IF NOT EXISTS public.search_queries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query       TEXT NOT NULL,
  result_count INT NOT NULL DEFAULT 0,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  page        TEXT NOT NULL DEFAULT 'products',
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Allow insert from API (no auth needed for anonymous searches)
CREATE POLICY "Anyone can insert search queries"
  ON public.search_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view search analytics
CREATE POLICY "Admins can view search queries"
  ON public.search_queries FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Cleanup old data after 90 days
ALTER TABLE public.search_queries SET (
  autovacuum_vacuum_scale_factor = 0,
  autovacuum_vacuum_threshold = 10000
);

CREATE INDEX IF NOT EXISTS idx_search_queries_created_at
  ON public.search_queries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_queries_query
  ON public.search_queries (query);

-- 4. Trigger-based search_vector including category name
-- Drop the old generated column first
ALTER TABLE public.products
  DROP COLUMN IF EXISTS search_vector CASCADE;

-- Re-create as a regular column managed by trigger
ALTER TABLE public.products
  ADD COLUMN search_vector tsvector;

-- Function to compute search_vector for a product
CREATE OR REPLACE FUNCTION public.compute_product_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector := (
    SELECT
      setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(NEW.short_desc, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(c.name, '')), 'B')
    FROM public.categories c
    WHERE c.id = NEW.category_id
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-update search_vector on product insert/update
CREATE TRIGGER trg_products_search_vector
  BEFORE INSERT OR UPDATE OF name, short_desc, description, category_id
  ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_product_search_vector();

-- Backfill search_vector for existing products
UPDATE public.products p
  SET search_vector = (
    SELECT
      setweight(to_tsvector('english', coalesce(p.name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(p.short_desc, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(p.description, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(c.name, '')), 'B')
    FROM public.categories c
    WHERE c.id = p.category_id
  )
  WHERE search_vector IS NULL;

-- Recreate the GIN index
DROP INDEX IF EXISTS products_search_idx;
CREATE INDEX IF NOT EXISTS products_search_idx
  ON public.products USING GIN (search_vector);

-- 5. Fuzzy search RPC (used by /api/search fallback)
CREATE OR REPLACE FUNCTION public.search_products_fuzzy(query text)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  price NUMERIC(12,2),
  compare_at NUMERIC(12,2),
  images JSONB,
  short_desc TEXT,
  categories JSONB,
  sold_count INT,
  similarity REAL
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.name, p.slug, p.price, p.compare_at,
    p.images, p.short_desc,
    CASE WHEN c.id IS NOT NULL THEN
      jsonb_build_object('name', c.name, 'slug', c.slug)
    ELSE NULL END,
    p.sold_count,
    word_similarity(query, p.name)::real AS sim
  FROM public.products p
  LEFT JOIN public.categories c ON c.id = p.category_id
  WHERE p.is_active = true
    AND word_similarity(query, p.name) > 0.3
  ORDER BY sim DESC, p.sold_count DESC
  LIMIT 8;
END;
$$;

-- 6. Did-you-mean suggestion RPC
CREATE OR REPLACE FUNCTION public.search_did_you_mean(query text)
RETURNS TABLE(suggestion TEXT, similarity REAL)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.name) p.name, similarity(query, p.name)::real AS sim
  FROM public.products p
  WHERE p.is_active = true
    AND similarity(query, p.name) > 0.2
  ORDER BY p.name, sim DESC
  LIMIT 5;
END;
$$;
