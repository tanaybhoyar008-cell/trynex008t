
-- Restrict public storage reads: rely on signed URLs (app already uses them)
DROP POLICY IF EXISTS "Public read media" ON storage.objects;

-- Owners may read their own files directly (signed URLs still work for everyone else)
CREATE POLICY "Owners read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = ANY (ARRAY['videos','thumbnails','avatars'])
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Prevent user_id reassignment on comment edits
DROP POLICY IF EXISTS "users edit own comment" ON public.comments;
CREATE POLICY "users edit own comment" ON public.comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
