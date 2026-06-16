
-- Public read for all three buckets
CREATE POLICY "Public read media" ON storage.objects FOR SELECT
USING (bucket_id IN ('videos','thumbnails','avatars'));

-- Authenticated users can write to their own folder: {auth.uid()}/...
CREATE POLICY "Users upload own folder" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('videos','thumbnails','avatars')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users update own folder" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id IN ('videos','thumbnails','avatars')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own folder" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN ('videos','thumbnails','avatars')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
