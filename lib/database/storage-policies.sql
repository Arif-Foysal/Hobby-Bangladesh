-- Storage bucket policies for hobby-bangladesh bucket
-- Run this in Supabase SQL Editor

-- Policy: Anyone can read product images
CREATE POLICY "Public read hobby-bangladesh images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hobby-bangladesh');

-- Policy: Only admins can upload product images
CREATE POLICY "Admin upload hobby-bangladesh images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hobby-bangladesh'
  AND public.is_admin()
);

-- Policy: Only admins can update product images
CREATE POLICY "Admin update hobby-bangladesh images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hobby-bangladesh'
  AND public.is_admin()
);

-- Policy: Only admins can delete product images
CREATE POLICY "Admin delete hobby-bangladesh images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hobby-bangladesh'
  AND public.is_admin()
);
