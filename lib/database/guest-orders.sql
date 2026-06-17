-- Make user_id nullable for guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS to allow guest order insertion
DROP POLICY IF EXISTS "Admins have full order access" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full order access" ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Update order_items RLS for guest orders
DROP POLICY IF EXISTS "Admins have full order item access" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full order item access" ON public.order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
