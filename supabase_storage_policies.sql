-- ==========================================
-- Vaulta Expense Tracker - Supabase Storage Bucket & RLS Policies
-- ==========================================

-- 1. Create Private Storage Bucket 'vaulta-backups'
INSERT INTO storage.buckets (id, name, public)
VALUES ('vaulta-backups', 'vaulta-backups', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies on storage.objects

-- Allow users to SELECT (read) only their own backup file inside vaulta-backups/<user-id>/
DROP POLICY IF EXISTS "Users can read own backup file" ON storage.objects;
CREATE POLICY "Users can read own backup file"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vaulta-backups' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to INSERT (upload) backup file inside vaulta-backups/<user-id>/
DROP POLICY IF EXISTS "Users can insert own backup file" ON storage.objects;
CREATE POLICY "Users can insert own backup file"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vaulta-backups' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to UPDATE (overwrite/upsert) backup file inside vaulta-backups/<user-id>/
DROP POLICY IF EXISTS "Users can update own backup file" ON storage.objects;
CREATE POLICY "Users can update own backup file"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vaulta-backups' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vaulta-backups' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to DELETE backup file inside vaulta-backups/<user-id>/
DROP POLICY IF EXISTS "Users can delete own backup file" ON storage.objects;
CREATE POLICY "Users can delete own backup file"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vaulta-backups' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
