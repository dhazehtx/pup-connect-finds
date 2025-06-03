
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BreedingPortfolio {
  id: string;
  breeder_id: string;
  portfolio_name: string;
  description?: string;
  established_year?: number;
  breeding_philosophy?: string;
  health_testing_protocols: string[];
  available_breeds: string[];
  achievements: string[];
  facility_photos: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioAchievement {
  id: string;
  portfolio_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  issuing_organization?: string;
  date_received?: string;
  certificate_url?: string;
  is_featured: boolean;
  created_at: string;
}

export const useBreedingPortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<BreedingPortfolio[]>([]);
  const [achievements, setAchievements] = useState<PortfolioAchievement[]>([]);

  // Fetch breeding portfolios
  const fetchPortfolios = useCallback(async (breederId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase.from('breeding_portfolios').select('*');
      
      if (breederId) {
        query = query.eq('breeder_id', breederId);
      } else if (user) {
        query = query.eq('breeder_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to load breeding portfolios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Create breeding portfolio
  const createPortfolio = useCallback(async (portfolioData: Omit<BreedingPortfolio, 'id' | 'breeder_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('breeding_portfolios')
        .insert({
          ...portfolioData,
          breeder_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setPortfolios(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Breeding portfolio created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to create breeding portfolio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Update breeding portfolio
  const updatePortfolio = useCallback(async (portfolioId: string, updates: Partial<BreedingPortfolio>) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('breeding_portfolios')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;

      setPortfolios(prev => prev.map(p => p.id === portfolioId ? data : p));
      toast({
        title: "Success",
        description: "Portfolio updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to update portfolio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch portfolio achievements
  const fetchAchievements = useCallback(async (portfolioId: string) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_achievements')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('date_received', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Add achievement
  const addAchievement = useCallback(async (portfolioId: string, achievementData: Omit<PortfolioAchievement, 'id' | 'portfolio_id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('portfolio_achievements')
        .insert({
          ...achievementData,
          portfolio_id: portfolioId
        })
        .select()
        .single();

      if (error) throw error;

      setAchievements(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Achievement added successfully",
      });

      return data;
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast({
        title: "Error",
        description: "Failed to add achievement",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Initialize data
  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user, fetchPortfolios]);

  return {
    portfolios,
    achievements,
    loading,
    fetchPortfolios,
    createPortfolio,
    updatePortfolio,
    fetchAchievements,
    addAchievement
  };
};
