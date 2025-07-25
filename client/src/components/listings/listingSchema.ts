
import { z } from 'zod';

export const listingFormSchema = z.object({
  dog_name: z.string().min(1, 'Dog name is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().min(0, 'Age must be a positive number'),
  price: z.number().min(0, 'Price must be a positive number'),
  description: z.string().optional(),
  location: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Unknown']).optional(),
  size: z.enum(['Small', 'Medium', 'Large']).optional(),
  color: z.string().optional(),
  vaccinated: z.boolean().default(false),
  neutered_spayed: z.boolean().default(false),
  good_with_kids: z.boolean().default(false),
  good_with_dogs: z.boolean().default(false),
  special_needs: z.boolean().default(false),
  rehoming: z.boolean().default(false),
  delivery_available: z.boolean().default(false),
  listing_status: z.string().default('active'),
  images: z.array(z.string()).min(1, 'At least one photo is required'),
  video_url: z.string().optional(),
});

export type ListingFormData = z.infer<typeof listingFormSchema>;

export const popularBreeds = [
  'Australian Shepherd',
  'Beagle',
  'Belgian Malinois',
  'Bernese Mountain Dog',
  'Border Collie',
  'Boston Terrier',
  'Bulldog',
  'Chihuahua',
  'Cocker Spaniel',
  'Dachshund',
  'French Bulldog',
  'German Shepherd',
  'German Shorthaired Pointer',
  'Golden Retriever',
  'Labrador Retriever',
  'Mixed Breed',
  'Other',
  'Pembroke Welsh Corgi',
  'Poodle',
  'Rottweiler',
  'Shih Tzu',
  'Siberian Husky',
  'Yorkshire Terrier'
];
