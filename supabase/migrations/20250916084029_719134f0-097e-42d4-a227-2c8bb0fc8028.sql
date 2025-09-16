-- Create storage buckets for character images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('character-faces', 'character-faces', true),
  ('character-full', 'character-full', true);

-- Create RLS policies for character face images
CREATE POLICY "Anyone can view character faces" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'character-faces');

CREATE POLICY "Admins can upload character faces" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'character-faces' 
  AND COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) = true
);

CREATE POLICY "Admins can update character faces" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'character-faces' 
  AND COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) = true
);

CREATE POLICY "Admins can delete character faces" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'character-faces' 
  AND COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) = true
);

-- Create RLS policies for character full body images
CREATE POLICY "Anyone can view character full images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'character-full');

CREATE POLICY "Admins can upload character full images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'character-full' 
  AND COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) = true
);

CREATE POLICY "Admins can update character full images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'character-full' 
  AND COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) = true
);

CREATE POLICY "Admins can delete character full images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'character-full' 
  AND COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false) = true
);

-- Update characters table to store image URLs
ALTER TABLE characters 
ADD COLUMN face_image_url TEXT,
ADD COLUMN full_image_url TEXT;