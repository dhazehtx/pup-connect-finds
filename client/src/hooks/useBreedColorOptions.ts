import { useQuery } from '@tanstack/react-query';

const BREEDS = [
  { id: 1, name: 'Afghan Hound' },
  { id: 2, name: 'Airedale Terrier' },
  { id: 3, name: 'Akita' },
  { id: 4, name: 'American Staffordshire Terrier' },
  { id: 5, name: 'Australian Shepherd' },
  { id: 6, name: 'Basset Hound' },
  { id: 7, name: 'Beagle' },
  { id: 8, name: 'Bernese Mountain Dog' },
  { id: 9, name: 'Bloodhound' },
  { id: 10, name: 'Border Collie' },
  { id: 11, name: 'Boston Terrier' },
  { id: 12, name: 'Boxer' },
  { id: 13, name: 'Bull Terrier' },
  { id: 14, name: 'Bulldog' },
  { id: 15, name: 'Cairn Terrier' },
  { id: 16, name: 'Cavalier King Charles Spaniel' },
  { id: 17, name: 'Chihuahua' },
  { id: 18, name: 'Cocker Spaniel' },
  { id: 19, name: 'Dachshund' },
  { id: 20, name: 'French Bulldog' },
  { id: 21, name: 'German Shepherd' },
  { id: 22, name: 'German Shorthaired Pointer' },
  { id: 23, name: 'Golden Retriever' },
  { id: 24, name: 'Great Dane' },
  { id: 25, name: 'Greyhound' },
  { id: 26, name: 'Jack Russell Terrier' },
  { id: 27, name: 'Labrador Retriever' },
  { id: 28, name: 'Lakeland Terrier' },
  { id: 29, name: 'Maltese' },
  { id: 30, name: 'Mastiff' },
  { id: 31, name: 'Newfoundland' },
  { id: 32, name: 'Norfolk Terrier' },
  { id: 33, name: 'Norwich Terrier' },
  { id: 34, name: 'Parson Russell Terrier' },
  { id: 35, name: 'Pit Bull Terrier' },
  { id: 36, name: 'Pomeranian' },
  { id: 37, name: 'Poodle' },
  { id: 38, name: 'Rat Terrier' },
  { id: 39, name: 'Rottweiler' },
  { id: 40, name: 'Saint Bernard' },
  { id: 41, name: 'Scottish Terrier' },
  { id: 42, name: 'Shih Tzu' },
  { id: 43, name: 'Siberian Husky' },
  { id: 44, name: 'Smooth Fox Terrier' },
  { id: 45, name: 'Staffordshire Bull Terrier' },
  { id: 46, name: 'Welsh Terrier' },
  { id: 47, name: 'West Highland White Terrier' },
  { id: 48, name: 'Whippet' },
  { id: 49, name: 'Wire Fox Terrier' },
  { id: 50, name: 'Yorkshire Terrier' },
];

const COLOR_MAP: Record<number, string[]> = {
  20: ['Brindle', 'Cream', 'Fawn'],
  23: ['Golden', 'Light Golden', 'Dark Golden'],
  27: ['Yellow', 'Black', 'Chocolate'],
  21: ['Black and Tan', 'Sable', 'All Black'],
  14: ['White', 'Brindle', 'Fawn'],
  37: ['Black', 'White', 'Brown', 'Apricot'],
  7: ['Tri-color', 'Lemon', 'Red and White'],
  39: ['Black and Tan'],
  50: ['Blue and Tan', 'Black and Tan'],
  22: ['Liver', 'Black'],
  43: ['Black and White', 'Gray and White', 'Red and White'],
  19: ['Black and Tan', 'Red', 'Cream'],
};

export const getBreedNameById = (id: number): string | undefined =>
  BREEDS.find(b => b.id === id)?.name;

export const useBreeds = () =>
  useQuery({
    queryKey: ['breeds'],
    queryFn: async () => BREEDS,
    staleTime: Infinity,
  });

export const useColorsByBreed = (breedId: number | null) =>
  useQuery({
    queryKey: ['colors', breedId],
    queryFn: async () => {
      if (!breedId) return [];
      return COLOR_MAP[breedId] || ['Black', 'Brown', 'White', 'Golden'];
    },
    enabled: !!breedId,
    staleTime: Infinity,
  });
