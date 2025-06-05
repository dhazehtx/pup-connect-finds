
import { useState, useMemo } from 'react';

export interface EducationResource {
  id: number;
  category: string;
  title: string;
  description: string;
  readTime: string;
  rating: number;
  reviews: number;
  image: string;
  author: {
    name: string;
    credentials: string;
    avatar?: string;
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  downloadable?: boolean;
  content?: string;
  relatedArticles?: number[];
}

export const useEducationSearch = (resources: EducationResource[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = searchTerm === '' || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [resources, searchTerm, selectedCategory, selectedDifficulty]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredResources
  };
};
