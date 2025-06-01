
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MatchingCriteria {
  preferredBreeds: string[];
  maxPrice: number;
  maxDistance: number;
  ageRange: { min: number; max: number };
  temperamentPreferences: string[];
  activityLevel: 'low' | 'medium' | 'high';
  livingSpace: 'apartment' | 'house' | 'farm';
  experience: 'beginner' | 'intermediate' | 'expert';
}

interface MatchScore {
  listingId: string;
  score: number;
  reasons: string[];
  compatibility: {
    breed: number;
    price: number;
    location: number;
    temperament: number;
    lifestyle: number;
  };
}

export const useAdvancedMatching = () => {
  const [criteria, setCriteria] = useState<MatchingCriteria | null>(null);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const calculateMatchScore = (listing: any, userCriteria: MatchingCriteria): MatchScore => {
    let score = 0;
    const reasons: string[] = [];
    const compatibility = {
      breed: 0,
      price: 0,
      location: 0,
      temperament: 0,
      lifestyle: 0
    };

    // Breed matching (30% weight)
    if (userCriteria.preferredBreeds.includes(listing.breed)) {
      const breedScore = 30;
      score += breedScore;
      compatibility.breed = 100;
      reasons.push(`Perfect breed match: ${listing.breed}`);
    } else if (userCriteria.preferredBreeds.some(breed => 
      listing.breed.toLowerCase().includes(breed.toLowerCase()) ||
      breed.toLowerCase().includes(listing.breed.toLowerCase())
    )) {
      const breedScore = 20;
      score += breedScore;
      compatibility.breed = 70;
      reasons.push(`Similar breed: ${listing.breed}`);
    }

    // Price matching (25% weight)
    if (listing.price <= userCriteria.maxPrice) {
      const priceRatio = 1 - (listing.price / userCriteria.maxPrice);
      const priceScore = 25 * (0.5 + priceRatio * 0.5);
      score += priceScore;
      compatibility.price = Math.round((0.5 + priceRatio * 0.5) * 100);
      if (listing.price <= userCriteria.maxPrice * 0.8) {
        reasons.push(`Great price: $${listing.price}`);
      } else {
        reasons.push(`Within budget: $${listing.price}`);
      }
    }

    // Age matching (15% weight)
    const listingAge = listing.age_months || 0;
    if (listingAge >= userCriteria.ageRange.min && listingAge <= userCriteria.ageRange.max) {
      score += 15;
      compatibility.lifestyle += 15;
      reasons.push(`Perfect age: ${listingAge} months`);
    } else if (Math.abs(listingAge - userCriteria.ageRange.min) <= 2 || 
               Math.abs(listingAge - userCriteria.ageRange.max) <= 2) {
      score += 10;
      compatibility.lifestyle += 10;
      reasons.push(`Good age match: ${listingAge} months`);
    }

    // Temperament matching (20% weight)
    const listingTemperament = listing.temperament || [];
    const temperamentMatches = userCriteria.temperamentPreferences.filter(pref =>
      listingTemperament.some((trait: string) => 
        trait.toLowerCase().includes(pref.toLowerCase())
      )
    );
    if (temperamentMatches.length > 0) {
      const temperamentScore = 20 * (temperamentMatches.length / userCriteria.temperamentPreferences.length);
      score += temperamentScore;
      compatibility.temperament = Math.round((temperamentMatches.length / userCriteria.temperamentPreferences.length) * 100);
      reasons.push(`Temperament match: ${temperamentMatches.join(', ')}`);
    }

    // Activity level matching (10% weight)
    if (listing.activity_level === userCriteria.activityLevel) {
      score += 10;
      compatibility.lifestyle += 25;
      reasons.push(`Perfect activity level: ${userCriteria.activityLevel}`);
    }

    // Normalize lifestyle compatibility
    compatibility.lifestyle = Math.min(100, compatibility.lifestyle);

    return {
      listingId: listing.id,
      score: Math.round(score),
      reasons,
      compatibility
    };
  };

  const findMatches = async (userCriteria: MatchingCriteria) => {
    try {
      setLoading(true);
      setCriteria(userCriteria);

      // Fetch all listings
      const { data: listings, error } = await supabase
        .from('dog_listings')
        .select('*')
        .eq('status', 'available');

      if (error) throw error;

      // Calculate match scores for each listing
      const matchScores = listings
        .map(listing => calculateMatchScore(listing, userCriteria))
        .filter(match => match.score >= 20) // Minimum score threshold
        .sort((a, b) => b.score - a.score);

      setMatches(matchScores);
      return matchScores;
    } catch (error) {
      console.error('Error finding matches:', error);
      setMatches([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async (preferences: MatchingCriteria) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          matching_criteria: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const loadUserPreferences = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('matching_criteria')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.matching_criteria) {
        setCriteria(data.matching_criteria);
        return data.matching_criteria;
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    return null;
  };

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  return {
    criteria,
    matches,
    loading,
    findMatches,
    saveUserPreferences,
    loadUserPreferences
  };
};
