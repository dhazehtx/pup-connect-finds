
import { useState } from 'react';
import { UserProfile, ProfileComparison } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useProfileComparison = () => {
  const [comparisons, setComparisons] = useState<ProfileComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createComparison = async (
    profiles: UserProfile[], 
    fields: (keyof UserProfile)[]
  ): Promise<ProfileComparison> => {
    try {
      setIsLoading(true);

      if (profiles.length < 2) {
        throw new Error('At least 2 profiles are required for comparison');
      }

      if (profiles.length > 5) {
        throw new Error('Maximum 5 profiles can be compared at once');
      }

      const comparison: ProfileComparison = {
        profiles,
        comparison_fields: fields,
        created_at: new Date().toISOString(),
        comparison_id: generateComparisonId()
      };

      setComparisons(prev => [comparison, ...prev]);

      toast({
        title: "Comparison Created",
        description: `Comparing ${profiles.length} profiles across ${fields.length} fields`,
      });

      return comparison;
    } catch (error) {
      console.error('Error creating comparison:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create comparison",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addProfileToComparison = (comparisonId: string, profile: UserProfile) => {
    setComparisons(prev => prev.map(comp => {
      if (comp.comparison_id === comparisonId) {
        if (comp.profiles.length >= 5) {
          toast({
            title: "Limit Reached",
            description: "Maximum 5 profiles can be compared",
            variant: "destructive",
          });
          return comp;
        }

        if (comp.profiles.some(p => p.id === profile.id)) {
          toast({
            title: "Already Added",
            description: "This profile is already in the comparison",
            variant: "destructive",
          });
          return comp;
        }

        return {
          ...comp,
          profiles: [...comp.profiles, profile]
        };
      }
      return comp;
    }));
  };

  const removeProfileFromComparison = (comparisonId: string, profileId: string) => {
    setComparisons(prev => prev.map(comp => {
      if (comp.comparison_id === comparisonId) {
        const updatedProfiles = comp.profiles.filter(p => p.id !== profileId);
        
        if (updatedProfiles.length < 2) {
          toast({
            title: "Minimum Required",
            description: "At least 2 profiles are required for comparison",
            variant: "destructive",
          });
          return comp;
        }

        return {
          ...comp,
          profiles: updatedProfiles
        };
      }
      return comp;
    }));
  };

  const updateComparisonFields = (comparisonId: string, fields: (keyof UserProfile)[]) => {
    setComparisons(prev => prev.map(comp => 
      comp.comparison_id === comparisonId 
        ? { ...comp, comparison_fields: fields }
        : comp
    ));
  };

  const deleteComparison = (comparisonId: string) => {
    setComparisons(prev => prev.filter(comp => comp.comparison_id !== comparisonId));
    toast({
      title: "Comparison Deleted",
      description: "The comparison has been removed",
    });
  };

  const getComparisonInsights = (comparison: ProfileComparison) => {
    const insights: Record<string, any> = {};
    
    comparison.comparison_fields.forEach(field => {
      const values = comparison.profiles.map(p => p[field]);
      
      if (typeof values[0] === 'number') {
        const numValues = values as number[];
        insights[field] = {
          highest: Math.max(...numValues),
          lowest: Math.min(...numValues),
          average: numValues.reduce((a, b) => a + b, 0) / numValues.length,
          range: Math.max(...numValues) - Math.min(...numValues)
        };
      } else if (typeof values[0] === 'boolean') {
        const boolValues = values as boolean[];
        insights[field] = {
          trueCount: boolValues.filter(v => v).length,
          falseCount: boolValues.filter(v => !v).length,
          percentage: (boolValues.filter(v => v).length / boolValues.length) * 100
        };
      } else {
        insights[field] = {
          uniqueValues: [...new Set(values)].length,
          mostCommon: getMostCommon(values as string[])
        };
      }
    });

    return insights;
  };

  const getMostCommon = (arr: string[]): string => {
    const counts: Record<string, number> = {};
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const generateComparisonId = (): string => {
    return `comp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const exportComparison = (comparison: ProfileComparison, format: 'json' | 'csv' = 'json') => {
    const insights = getComparisonInsights(comparison);
    const exportData = {
      ...comparison,
      insights,
      exported_at: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile_comparison_${comparison.comparison_id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // CSV export logic would go here
      toast({
        title: "CSV Export",
        description: "CSV export is not yet implemented",
      });
    }
  };

  return {
    comparisons,
    isLoading,
    createComparison,
    addProfileToComparison,
    removeProfileFromComparison,
    updateComparisonFields,
    deleteComparison,
    getComparisonInsights,
    exportComparison
  };
};
