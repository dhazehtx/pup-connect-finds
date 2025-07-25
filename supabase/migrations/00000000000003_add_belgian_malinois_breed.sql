-- Add Belgian Malinois breed colors to the breed_colors table if it exists
-- This migration adds breed color data for Belgian Malinois

-- Check if breed_colors table exists and insert Belgian Malinois colors
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'breed_colors') THEN
        INSERT INTO breed_colors (breed, color) VALUES
        ('Belgian Malinois', 'Fawn'),
        ('Belgian Malinois', 'Mahogany'),
        ('Belgian Malinois', 'Red'),
        ('Belgian Malinois', 'Red Sable'),
        ('Belgian Malinois', 'Fawn Sable');
    END IF;
END $$;