-- Storage policies for provider ID documents bucket
-- This allows authenticated users to upload ID documents for verification

-- Create the bucket if it doesn't exist (it should already exist from ensureProviderIdBucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'provider-id-docs',
  'provider-id-docs',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];

-- Storage policies for provider ID documents
-- Allow anyone to view ID documents (public bucket)
CREATE POLICY "Anyone can view provider ID documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'provider-id-docs');

-- Allow authenticated users to upload their own ID documents
CREATE POLICY "Authenticated users can upload provider ID documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'provider-id-docs' 
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[2] -- Ensure user uploads to their own folder (users/{user_id}/...)
  );

-- Allow users to update their own ID documents
CREATE POLICY "Users can update their own provider ID documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'provider-id-docs' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to delete their own ID documents
CREATE POLICY "Users can delete their own provider ID documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'provider-id-docs' 
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
