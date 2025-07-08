
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

  useEffect(() => {
    if (!selectedBreed || selectedBreed === 'Other' || selectedBreed === 'Mixed Breed') {
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

        setColors(data?.map(item => item.color) || []);
      } catch (err) {
        console.error('Error fetching breed colors:', err);
        setError('Failed to load colors');
        setColors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, [selectedBreed]);

  return { colors, loading, error };
};
