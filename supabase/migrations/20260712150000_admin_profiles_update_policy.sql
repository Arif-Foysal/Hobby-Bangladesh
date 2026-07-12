-- Add admin UPDATE policy for profiles table
-- Fixes role changes and profile edits by admins being silently blocked by RLS

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());
