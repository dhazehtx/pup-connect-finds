import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBreeds = () =>
  useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('breeds' as any)
          .select('id, name')
          .order('name');
        
        if (error || !data) {
          console.error('Error fetching breeds:', error);
          // Return fallback breeds if Supabase table doesn't exist
          return [
          { id: 1, name: 'French Bulldog' },
          { id: 2, name: 'Golden Retriever' },
          { id: 3, name: 'Labrador Retriever' },
          { id: 4, name: 'German Shepherd' },
          { id: 5, name: 'Bulldog' },
          { id: 6, name: 'Poodle' },
          { id: 7, name: 'Beagle' },
          { id: 8, name: 'Rottweiler' },
          { id: 9, name: 'Yorkshire Terrier' },
          { id: 10, name: 'German Shorthaired Pointer' },
          { id: 11, name: 'Siberian Husky' },
          { id: 12, name: 'Dachshund' },
          { id: 13, name: 'Boston Terrier' },
          { id: 14, name: 'Boxer' },
          { id: 15, name: 'Cocker Spaniel' },
          { id: 16, name: 'Border Collie' },
          { id: 17, name: 'Australian Shepherd' },
          { id: 18, name: 'Shih Tzu' },
          { id: 19, name: 'Chihuahua' },
          { id: 20, name: 'Pomeranian' },
          { id: 21, name: 'Maltese' },
          { id: 22, name: 'Cavalier King Charles Spaniel' },
          { id: 23, name: 'Bernese Mountain Dog' },
          { id: 24, name: 'Great Dane' },
          { id: 25, name: 'Mastiff' },
          { id: 26, name: 'Saint Bernard' },
          { id: 27, name: 'Newfoundland' },
          { id: 28, name: 'Bloodhound' },
          { id: 29, name: 'Basset Hound' },
          { id: 30, name: 'Afghan Hound' },
          { id: 31, name: 'Greyhound' },
          { id: 32, name: 'Whippet' },
          { id: 33, name: 'Jack Russell Terrier' },
          { id: 34, name: 'Bull Terrier' },
          { id: 35, name: 'Scottish Terrier' },
          { id: 36, name: 'West Highland White Terrier' },
          { id: 37, name: 'Cairn Terrier' },
          { id: 38, name: 'Wire Fox Terrier' },
          { id: 39, name: 'Smooth Fox Terrier' },
          { id: 40, name: 'Airedale Terrier' },
          { id: 41, name: 'Welsh Terrier' },
          { id: 42, name: 'Lakeland Terrier' },
          { id: 43, name: 'Norfolk Terrier' },
          { id: 44, name: 'Norwich Terrier' },
          { id: 45, name: 'Parson Russell Terrier' },
          { id: 46, name: 'Rat Terrier' },
          { id: 47, name: 'American Staffordshire Terrier' },
          { id: 48, name: 'Staffordshire Bull Terrier' },
          { id: 49, name: 'Pit Bull Terrier' },
          { id: 50, name: 'Akita' }
        ];
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching breeds:', error);
        return [];
      }
    }
  });

export const useColorsByBreed = (breedId: number | null) =>
  useQuery({
    queryKey: ['colors', breedId],
    queryFn: async () => {
      if (!breedId) return [];
      
      try {
        const { data, error } = await supabase
          .from('breed_colors' as any)
          .select('color')
          .eq('breed_id', breedId)
          .order('color');
        
        if (error || !data) {
          console.error('Error fetching colors for breed:', error);
          // Return fallback colors based on breed
          const colorMap: Record<number, string[]> = {
          1: ['Brindle', 'Cream', 'Fawn'], // French Bulldog
          2: ['Golden', 'Light Golden', 'Dark Golden'], // Golden Retriever
          3: ['Yellow', 'Black', 'Chocolate'], // Labrador Retriever
          4: ['Black and Tan', 'Sable', 'All Black'], // German Shepherd
          5: ['White', 'Brindle', 'Fawn'], // Bulldog
          6: ['Black', 'White', 'Brown', 'Apricot'], // Poodle
          7: ['Tri-color', 'Lemon', 'Red and White'], // Beagle
          8: ['Black and Tan'], // Rottweiler
          9: ['Blue and Tan', 'Black and Tan'], // Yorkshire Terrier
          10: ['Liver', 'Black'], // German Shorthaired Pointer
          11: ['Black and White', 'Gray and White', 'Red and White'], // Siberian Husky
          12: ['Black and Tan', 'Red', 'Cream'] // Dachshund
        };
        
        return colorMap[breedId] || ['Black', 'Brown', 'White', 'Golden'];
        }
        
        return data?.map((c: any) => c.color) || [];
      } catch (error) {
        console.error('Error fetching colors for breed:', error);
        return [];
      }
    },
    enabled: !!breedId
  });