-- Migration: Locations table for admin-managed delivery areas & charges
-- Replaces the hardcoded division list and flat shipping rates with a
-- per-location delivery_charge the admin can CRUD. The store_settings.shipping
-- row is kept for global defaults (inside_dhaka, outside_dhaka, free_shipping_min)
-- used as fallback when a selected division is not in `locations`.

-- ============================================================
-- TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('division','city','area')),
  parent_id       UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique name within a type + parent scope.
-- COALESCE handles NULL parent_id (top-level divisions) for the partial index.
CREATE UNIQUE INDEX IF NOT EXISTS locations_unique
  ON public.locations (lower(name), type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS idx_locations_parent ON public.locations (parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_locations_divisions ON public.locations (type) WHERE type = 'division';

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active locations" ON public.locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage locations" ON public.locations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- UPDATE SHIPPING DEFAULTS
-- ============================================================
-- outside_dhaka seed was 120 in phase1; spec now requires 100.

UPDATE public.store_settings
  SET value = jsonb_set(
    jsonb_set(value, '{outside_dhaka}', '100'::jsonb),
    '{free_shipping_min}', COALESCE(value->'free_shipping_min', '5000'::jsonb)
  )
  WHERE key = 'shipping';

-- ============================================================
-- SEED DEFAULT DIVISIONS
-- ============================================================
-- Idempotent: only seed the 8 default divisions if the table is empty
-- AND none of them already exist. Individual rows are guarded by NOT EXISTS
-- per name so partial re-runs only fill in the missing ones.

INSERT INTO public.locations (name, type, delivery_charge, sort_order, is_active)
SELECT v.name, 'division', v.charge, v.sort_order, true
FROM (VALUES
  ('Dhaka',       60,  1),
  ('Chattogram', 100, 2),
  ('Rajshahi',   100, 3),
  ('Khulna',     100, 4),
  ('Barishal',   100, 5),
  ('Sylhet',     100, 6),
  ('Rangpur',    100, 7),
  ('Mymensingh', 100, 8)
) AS v(name, charge, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.locations l WHERE lower(l.name) = lower(v.name) AND l.type = 'division'
);