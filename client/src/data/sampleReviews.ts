
import { Database } from '@/integrations/supabase/types';

type Review = Database['public']['Tables']['reviews']['Insert'];

// Sample reviews for testing
export const sampleReviews: Review[] = [
  {
    id: 'review-1111-1111-1111-111111111111',
    reviewer_id: '44444444-4444-4444-4444-444444444444',
    reviewed_user_id: '11111111-1111-1111-1111-111111111111',
    listing_id: 'listing-1111-1111-1111-111111111111',
    rating: 5,
    title: 'Amazing breeder, perfect puppy!',
    comment: 'Sarah was incredibly helpful throughout the entire process. Luna is exactly as described - healthy, well-socialized, and absolutely adorable. The pickup experience was professional and educational.',
    helpful_count: 12,
    created_at: '2024-02-20T08:00:00Z',
    updated_at: '2024-02-20T08:00:00Z'
  },
  {
    id: 'review-2222-2222-2222-222222222222',
    reviewer_id: '44444444-4444-4444-4444-444444444444',
    reviewed_user_id: '22222222-2222-2222-2222-222222222222',
    listing_id: 'listing-2222-2222-2222-222222222222',
    rating: 4,
    title: 'Great Lab puppy',
    comment: 'Max is a wonderful addition to our family. Mike provided all health records and was very responsive to questions. Only minor issue was pickup timing, but overall excellent experience.',
    helpful_count: 8,
    created_at: '2024-02-18T08:00:00Z',
    updated_at: '2024-02-18T08:00:00Z'
  },
  {
    id: 'review-3333-3333-3333-333333333333',
    reviewer_id: '11111111-1111-1111-1111-111111111111',
    reviewed_user_id: '33333333-3333-3333-3333-333333333333',
    rating: 5,
    title: 'Outstanding rescue organization',
    comment: 'Happy Tails Rescue does incredible work. Their adoption process is thorough but fair, and they clearly care about both the dogs and the families. Highly recommend supporting them.',
    helpful_count: 15,
    created_at: '2024-02-16T08:00:00Z',
    updated_at: '2024-02-16T08:00:00Z'
  },
  {
    id: 'review-4444-4444-4444-444444444444',
    reviewer_id: '22222222-2222-2222-2222-222222222222',
    reviewed_user_id: '11111111-1111-1111-1111-111111111111',
    rating: 5,
    title: 'Professional and caring breeder',
    comment: 'Sarah really knows her stuff. Great communication, beautiful facility, and healthy puppies. You can tell she genuinely cares about her dogs and the families they go to.',
    helpful_count: 9,
    created_at: '2024-02-14T08:00:00Z',
    updated_at: '2024-02-14T08:00:00Z'
  }
];
