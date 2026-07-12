-- Fix: Orders RLS - drop all existing policies, recreate cleanly
-- Also drop user_id NOT NULL for guest checkout support

-- 1. Make user_id nullable for guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop ALL existing policies on orders
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full order access" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;

-- 3. Recreate orders policies
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full order access" ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Drop ALL existing policies on order_items
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full order item access" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;

-- 5. Recreate order_items policies
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()
  ));

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full order item access" ON public.order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Verify policies exist
SELECT tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;