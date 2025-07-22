
import { useState, useEffect, useCallback } from 'react';
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

  // Mock data for demonstration
  const mockPortfolios: BreedingPortfolio[] = [
    {
      id: '1',
      breeder_id: user?.id || 'mock-breeder-id',
      portfolio_name: 'Golden Paws Breeding Program',
      description: 'Specializing in Golden Retrievers with champion bloodlines',
      established_year: 2010,
      breeding_philosophy: 'Health, temperament, and conformation excellence',
      health_testing_protocols: ['Hip Dysplasia', 'Elbow Dysplasia', 'Heart Clearance', 'Eye Clearance'],
      available_breeds: ['Golden Retriever', 'Labrador Retriever'],
      achievements: ['AKC Breeder of Merit', 'Best in Show Winner 2023'],
      facility_photos: [],
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Fetch breeding portfolios (using mock data)
  const fetchPortfolios = useCallback(async (breederId?: string) => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter portfolios by breeder ID if provided
      const filteredPortfolios = breederId 
        ? mockPortfolios.filter(p => p.breeder_id === breederId)
        : mockPortfolios.filter(p => p.breeder_id === (user?.id || 'mock-breeder-id'));

      setPortfolios(filteredPortfolios);
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

  // Create breeding portfolio (mock implementation)
  const createPortfolio = useCallback(async (portfolioData: Omit<BreedingPortfolio, 'id' | 'breeder_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      setLoading(true);

      const newPortfolio: BreedingPortfolio = {
        ...portfolioData,
        id: Math.random().toString(36).substr(2, 9),
        breeder_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPortfolios(prev => [newPortfolio, ...prev]);
      toast({
        title: "Success",
        description: "Breeding portfolio created successfully",
      });

      return newPortfolio;
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

  // Update breeding portfolio (mock implementation)
  const updatePortfolio = useCallback(async (portfolioId: string, updates: Partial<BreedingPortfolio>) => {
    try {
      setLoading(true);

      const updatedPortfolio = {
        ...portfolios.find(p => p.id === portfolioId),
        ...updates,
        updated_at: new Date().toISOString()
      } as BreedingPortfolio;

      setPortfolios(prev => prev.map(p => p.id === portfolioId ? updatedPortfolio : p));
      toast({
        title: "Success",
        description: "Portfolio updated successfully",
      });

      return updatedPortfolio;
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
  }, [portfolios, toast]);

  // Fetch portfolio achievements (mock implementation)
  const fetchAchievements = useCallback(async (portfolioId: string) => {
    try {
      const mockAchievements: PortfolioAchievement[] = [
        {
          id: '1',
          portfolio_id: portfolioId,
          achievement_type: 'Award',
          title: 'AKC Breeder of Merit',
          description: 'Recognized for excellence in breeding practices',
          issuing_organization: 'American Kennel Club',
          date_received: '2023-01-15',
          certificate_url: '',
          is_featured: true,
          created_at: new Date().toISOString()
        }
      ];

      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Add achievement (mock implementation)
  const addAchievement = useCallback(async (portfolioId: string, achievementData: Omit<PortfolioAchievement, 'id' | 'portfolio_id' | 'created_at'>) => {
    try {
      const newAchievement: PortfolioAchievement = {
        ...achievementData,
        id: Math.random().toString(36).substr(2, 9),
        portfolio_id: portfolioId,
        created_at: new Date().toISOString()
      };

      setAchievements(prev => [newAchievement, ...prev]);
      toast({
        title: "Success",
        description: "Achievement added successfully",
      });

      return newAchievement;
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
