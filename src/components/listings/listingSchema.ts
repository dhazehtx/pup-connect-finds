
import { z } from 'zod';

export const listingSchema = z.object({
  dog_name: z.string().min(2, 'Dog name must be at least 2 characters'),
  breed: z.string().min(2, 'Breed is required'),
  age: z.number().min(0, 'Age must be a positive number').max(25, 'Age must be realistic'),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
});

export type ListingFormData = z.infer<typeof listingSchema>;

export const popularBreeds = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Siberian Husky', 'Great Dane', 'Chihuahua', 'Border Collie', 'Boxer'
];
