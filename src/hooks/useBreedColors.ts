
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BreedColor {
  id: string;
  breed: string;
  color: string;
  created_at: string;
}

export const useBreedColors = (selectedBreed?: string) => {
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master color list for Mixed Breed and fallback
  const masterColorList = [
    'Black',
    'White',
    'Brown',
    'Tan',
    'Brindle',
    'Merle',
    'Cream',
    'Gray',
    'Fawn',
    'Red',
    'Blue',
    'Silver',
    'Chocolate',
    'Liver',
    'Sable',
    'Parti-color',
    'Tri-color',
    'Dapple',
    'Mixed'
  ];

  useEffect(() => {
    // Handle Mixed Breed - show all colors
    if (selectedBreed === 'Mixed Breed') {
      setColors(masterColorList);
      return;
    }

    // Handle no breed selected or empty breed
    if (!selectedBreed || selectedBreed === '' || selectedBreed === 'Other') {
      setColors([]);
      return;
    }

    const fetchColors = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('breed_colors')
          .select('color')
          .eq('breed', selectedBreed)
          .order('color');

        if (error) {
          throw error;
        }

        // If no breed-specific colors found, use master list as fallback
        if (!data || data.length === 0) {
          console.log(`No specific colors found for ${selectedBreed}, using master list`);
          setColors(masterColorList);
        } else {
          const uniqueColors = [...new Set(data.map(item => item.color))];
          setColors(uniqueColors);
        }
      } catch (err) {
        console.error('Error fetching breed colors:', err);
        setError('Failed to load colors');
        // Fallback to master color list on error
        setColors(masterColorList);
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, [selectedBreed]);

  return { colors, loading, error };
};
