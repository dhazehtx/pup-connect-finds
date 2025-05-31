
import { Database } from '@/integrations/supabase/types';

type DogListing = Database['public']['Tables']['dog_listings']['Insert'];

// Sample dog listings for testing
export const sampleDogListings: DogListing[] = [
  {
    id: 'listing-1111-1111-1111-111111111111',
    dog_name: 'Luna',
    breed: 'Golden Retriever',
    age: 10, // in weeks
    price: 2800,
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
    description: 'Beautiful Golden Retriever puppy with excellent temperament. Health tested parents, AKC registered.',
    location: 'Austin, TX',
    user_id: '11111111-1111-1111-1111-111111111111',
    status: 'active',
    created_at: '2024-02-15T08:00:00Z',
    updated_at: '2024-02-15T08:00:00Z'
  },
  {
    id: 'listing-2222-2222-2222-222222222222',
    dog_name: 'Max',
    breed: 'Labrador Retriever',
    age: 12,
    price: 2400,
    image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop',
    description: 'Chocolate Labrador Retriever puppy. Family-raised with excellent temperament.',
    location: 'Denver, CO',
    user_id: '22222222-2222-2222-2222-222222222222',
    status: 'active',
    created_at: '2024-02-12T08:00:00Z',
    updated_at: '2024-02-12T08:00:00Z'
  },
  {
    id: 'listing-3333-3333-3333-333333333333',
    dog_name: 'Buddy',
    breed: 'Mixed Breed',
    age: 96, // 2 years in months
    price: 150,
    image_url: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=400&h=300&fit=crop',
    description: 'Sweet rescue dog looking for a loving home. Great with kids and other pets.',
    location: 'Portland, OR',
    user_id: '33333333-3333-3333-3333-333333333333',
    status: 'active',
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-02-10T08:00:00Z'
  },
  {
    id: 'listing-4444-4444-4444-444444444444',
    dog_name: 'Bella',
    breed: 'French Bulldog',
    age: 8,
    price: 4200,
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
    description: 'Beautiful French Bulldog puppy with blue fawn coloring. Champion bloodlines.',
    location: 'Austin, TX',
    user_id: '11111111-1111-1111-1111-111111111111',
    status: 'active',
    created_at: '2024-02-08T08:00:00Z',
    updated_at: '2024-02-08T08:00:00Z'
  },
  {
    id: 'listing-5555-5555-5555-555555555555',
    dog_name: 'Charlie',
    breed: 'German Shepherd',
    age: 14,
    price: 3500,
    image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop',
    description: 'German Shepherd puppy from champion lines. Well-socialized and healthy.',
    location: 'Denver, CO',
    user_id: '22222222-2222-2222-2222-222222222222',
    status: 'active',
    created_at: '2024-02-05T08:00:00Z',
    updated_at: '2024-02-05T08:00:00Z'
  },
  {
    id: 'listing-6666-6666-6666-666666666666',
    dog_name: 'Daisy',
    breed: 'Beagle',
    age: 36, // 3 years in months
    price: 75,
    image_url: 'https://images.unsplash.com/photo-1544717342-7b6977ea1f8a?w=400&h=300&fit=crop',
    description: 'Sweet Beagle looking for a loving family. Great with children.',
    location: 'Portland, OR',
    user_id: '33333333-3333-3333-3333-333333333333',
    status: 'active',
    created_at: '2024-02-03T08:00:00Z',
    updated_at: '2024-02-03T08:00:00Z'
  }
];
