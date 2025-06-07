
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import CustomerReviewsHeader from '@/components/reviews/CustomerReviewsHeader';
import CustomerReviewsStats from '@/components/reviews/CustomerReviewsStats';
import CustomerReviewsList from '@/components/reviews/CustomerReviewsList';
import CustomerReviewsJoinCTA from '@/components/reviews/CustomerReviewsJoinCTA';

interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_profile: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  reviewed_user_profile: {
    full_name: string | null;
    user_type: string | null;
    verified: boolean;
  } | null;
}

interface StatsData {
  verifiedBreeders: number;
  successfulAdoptions: number;
  averageRating: number;
  totalReviews: number;
}

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    verifiedBreeders: 0,
    successfulAdoptions: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReviewData = async () => {
    try {
      setLoading(true);

      // Fetch reviews with profile data
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          comment,
          created_at,
          reviewer_id,
          reviewed_user_id
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (reviewsError) throw reviewsError;

      // Fetch profile data for reviewers and reviewed users
      const reviewerIds = reviewsData?.map(r => r.reviewer_id) || [];
      const reviewedUserIds = reviewsData?.map(r => r.reviewed_user_id) || [];
      const allUserIds = [...new Set([...reviewerIds, ...reviewedUserIds])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, user_type, verified')
        .in('id', allUserIds);

      // Combine reviews with profile data
      const enrichedReviews = reviewsData?.map(review => ({
        ...review,
        reviewer_profile: profilesData?.find(p => p.id === review.reviewer_id) || null,
        reviewed_user_profile: profilesData?.find(p => p.id === review.reviewed_user_id) || null
      })) || [];

      setReviews(enrichedReviews);

      // Calculate statistics
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating');

      const { data: verifiedBreedersData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_type', 'breeder')
        .eq('verified', true);

      const { data: adoptionsData } = await supabase
        .from('dog_listings')
        .select('id')
        .eq('status', 'sold');

      const totalReviews = allReviews?.length || 0;
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      setStats({
        verifiedBreeders: verifiedBreedersData?.length || 0,
        successfulAdoptions: adoptionsData?.length || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews
      });

    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, []);

  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'breeders':
        navigate('/explore');
        break;
      case 'adoptions':
        navigate('/explore');
        break;
      case 'rating':
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CustomerReviewsHeader />
      <CustomerReviewsStats 
        stats={stats} 
        loading={loading} 
        onStatClick={handleStatClick} 
      />
      <CustomerReviewsList reviews={reviews} loading={loading} />
      <CustomerReviewsJoinCTA />
    </div>
  );
};

export default CustomerReviews;
