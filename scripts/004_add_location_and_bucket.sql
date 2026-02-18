-- Migration: Add location column to issues table and create storage bucket

-- 1. Add location (address text) column to issues table if it doesn't exist
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS location text;

-- 2. Create the issue-images storage bucket
-- Run this in the Supabase SQL editor (storage schema)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'issue-images',
  'issue-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS policies for issue-images bucket

-- Allow authenticated users to upload images
CREATE POLICY "issue_images_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'issue-images');

-- Allow public read access to issue images
CREATE POLICY "issue_images_select" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'issue-images');

-- Allow users to delete their own images
CREATE POLICY "issue_images_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'issue-images' AND auth.uid()::text = (storage.foldername(name))[1]);
