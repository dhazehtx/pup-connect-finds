
-- Create the breed_colors table
CREATE TABLE public.breed_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  breed TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to allow public read access
ALTER TABLE public.breed_colors ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to view breed colors
CREATE POLICY "Anyone can view breed colors" 
  ON public.breed_colors 
  FOR SELECT 
  USING (true);

-- Insert the breed color data
INSERT INTO public.breed_colors (breed, color) VALUES
  ('French Bulldog', 'Fawn'),
  ('French Bulldog', 'Brindle'),
  ('French Bulldog', 'Cream'),
  ('French Bulldog', 'Pied'),
  ('French Bulldog', 'Blue'),
  ('French Bulldog', 'Lilac'),
  ('French Bulldog', 'Merle'),
  ('Labrador Retriever', 'Yellow'),
  ('Labrador Retriever', 'Black'),
  ('Labrador Retriever', 'Chocolate'),
  ('Labrador Retriever', 'Fox Red'),
  ('Golden Retriever', 'Light Golden'),
  ('Golden Retriever', 'Golden'),
  ('Golden Retriever', 'Dark Golden'),
  ('Poodle', 'White'),
  ('Poodle', 'Black'),
  ('Poodle', 'Apricot'),
  ('Poodle', 'Red'),
  ('Poodle', 'Blue'),
  ('Poodle', 'Cream'),
  ('Poodle', 'Silver'),
  ('German Shepherd', 'Black & Tan'),
  ('German Shepherd', 'Sable'),
  ('German Shepherd', 'Black'),
  ('German Shepherd', 'White'),
  ('German Shepherd', 'Red & Black'),
  ('Yorkshire Terrier', 'Blue & Tan'),
  ('Yorkshire Terrier', 'Black & Tan'),
  ('Yorkshire Terrier', 'Gold & Black'),
  ('Shih Tzu', 'Gold & White'),
  ('Shih Tzu', 'Black & White'),
  ('Shih Tzu', 'Liver'),
  ('Shih Tzu', 'Brindle'),
  ('Shih Tzu', 'Solid Black'),
  ('Dachshund', 'Black & Tan'),
  ('Dachshund', 'Chocolate'),
  ('Dachshund', 'Cream'),
  ('Dachshund', 'Blue'),
  ('Dachshund', 'Red'),
  ('Chihuahua', 'Fawn'),
  ('Chihuahua', 'Black'),
  ('Chihuahua', 'White'),
  ('Chihuahua', 'Chocolate'),
  ('Chihuahua', 'Cream'),
  ('Chihuahua', 'Blue'),
  ('Maltese', 'White'),
  ('Maltese', 'Cream'),
  ('Maltese', 'Tan'),
  ('Maltese', 'Champagne'),
  ('English Bulldog', 'Brindle'),
  ('English Bulldog', 'Fawn'),
  ('English Bulldog', 'White'),
  ('English Bulldog', 'Red'),
  ('English Bulldog', 'Piebald'),
  ('Beagle', 'Tri-color'),
  ('Beagle', 'Lemon'),
  ('Beagle', 'Red & White'),
  ('Beagle', 'Chocolate Tri'),
  ('Pomeranian', 'Orange'),
  ('Pomeranian', 'Cream'),
  ('Pomeranian', 'Black'),
  ('Pomeranian', 'Blue'),
  ('Pomeranian', 'Sable'),
  ('Pomeranian', 'Tan'),
  ('Husky', 'Black & White'),
  ('Husky', 'Red & White'),
  ('Husky', 'Agouti'),
  ('Husky', 'Gray'),
  ('Husky', 'Pure White');
