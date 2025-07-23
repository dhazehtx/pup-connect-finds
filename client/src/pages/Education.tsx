import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Search, GraduationCap, FileText, ExternalLink, Star, Clock } from 'lucide-react';
import { useEducationSearch, type EducationResource } from '../hooks/useEducationSearch';

const Education = () => {
  // Sample education resources data
  const sampleResources: EducationResource[] = [
    {
      id: 1,
      category: 'Health',
      title: 'Puppy Vaccination Schedule',
      description: 'Complete guide to puppy shots and vaccination timeline',
      readTime: '12 min read',
      rating: 4.9,
      reviews: 245,
      image: '/api/placeholder/300/200',
      author: {
        name: 'Dr. Sarah Johnson',
        credentials: 'DVM, DACVIM'
      },
      difficulty: 'Intermediate',
      tags: ['vaccines', 'health', 'puppies', 'veterinary'],
      url: 'https://www.akc.org/expert-advice/health/puppy-shots-complete-guide/'
    },
    {
      id: 2,
      category: 'Training',
      title: 'Puppy Training Basics',
      description: 'Essential training techniques for new puppy owners',
      readTime: '15 min read',
      rating: 4.8,
      reviews: 189,
      image: '/api/placeholder/300/200',
      author: {
        name: 'Mark Thompson',
        credentials: 'Certified Dog Trainer'
      },
      difficulty: 'Beginner',
      tags: ['training', 'behavior', 'puppies', 'obedience'],
      url: 'https://www.akc.org/expert-advice/training/'
    },
    {
      id: 3,
      category: 'Legal',
      title: 'Dog Ownership Laws by State',
      description: 'Understanding legal requirements for dog ownership across different states',
      readTime: '20 min read',
      rating: 4.7,
      reviews: 156,
      image: '/api/placeholder/300/200',
      author: {
        name: 'Legal Team',
        credentials: 'Pet Law Specialists'
      },
      difficulty: 'Advanced',
      tags: ['legal', 'laws', 'ownership', 'regulations'],
      url: '#'
    },
    {
      id: 4,
      category: 'Nutrition',
      title: 'Puppy Nutrition Guide',
      description: 'Everything you need to know about feeding your puppy',
      readTime: '18 min read',
      rating: 4.9,
      reviews: 312,
      image: '/api/placeholder/300/200',
      author: {
        name: 'Dr. Emily Chen',
        credentials: 'Pet Nutritionist'
      },
      difficulty: 'Intermediate',
      tags: ['nutrition', 'feeding', 'puppies', 'diet'],
      url: 'https://www.akc.org/expert-advice/nutrition/'
    }
  ];

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredResources
  } = useEducationSearch(sampleResources);

  const categories = ['all', 'Health', 'Training', 'Legal', 'Nutrition'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const stateLaws = [
    {
      state: 'California',
      summary: 'Strict breeding regulations, mandatory microchipping, and lemon laws for puppy sales.',
      keyPoints: ['Breeder licensing required', 'Health guarantees mandatory', 'Cooling-off period for purchases']
    },
    {
      state: 'New York',
      summary: 'Comprehensive pet dealer licensing and consumer protection laws.',
      keyPoints: ['Pet dealer permits required', 'Veterinary records disclosure', 'Return/refund policies mandated']
    },
    {
      state: 'Texas',
      summary: 'Commercial breeder regulations and puppy mill prevention laws.',
      keyPoints: ['Inspection requirements', 'Record keeping mandates', 'Facility standards enforced']
    },
    {
      state: 'Florida',
      summary: 'Pet sale regulations and consumer protection measures.',
      keyPoints: ['Health certificates required', 'Warranty provisions', 'Disclosure requirements']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Education Center</h1>
          <p className="text-xl text-green-100">
            Learn everything you need to know about responsible dog ownership, breeding laws, and pet care.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search and Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="resources" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            <TabsTrigger value="laws">State Laws</TabsTrigger>
          </TabsList>

          <TabsContent value="resources">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-200 rounded-t-lg" />
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {resource.category}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {resource.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                    <p className="text-gray-600 text-sm line-clamp-3">{resource.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {resource.rating} ({resource.reviews} reviews)
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        resource.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                        resource.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      By {resource.author.name}, {resource.author.credentials}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => resource.url && window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Read Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="laws">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">State Laws & Regulations</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Understanding the legal requirements for dog ownership and breeding in different states.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {stateLaws.map((law, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        {law.state}
                      </CardTitle>
                      <p className="text-gray-600 text-sm">{law.summary}</p>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2">Key Requirements:</h4>
                      <ul className="space-y-1">
                        {law.keyPoints.map((point, pointIndex) => (
                          <li key={pointIndex} className="text-sm text-gray-600 flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="mt-4">
                        View Full Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2 text-blue-900">Need Legal Guidance?</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Laws vary significantly by state and can change frequently. Always consult with local authorities or legal professionals for the most current information.
                    </p>
                    <Button>Contact Legal Support</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Education;