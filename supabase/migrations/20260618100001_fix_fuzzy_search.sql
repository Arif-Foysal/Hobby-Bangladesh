-- Fix fuzzy search RPC: use explicit word_similarity() threshold instead of <%
-- Supabase doesn't allow SET pg_trgm.word_similarity_threshold on functions,
-- so we compare word_similarity() directly against a 0.3 threshold in WHERE.

DROP FUNCTION IF EXISTS public.search_products_fuzzy(query text);

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
