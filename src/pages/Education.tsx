
import React, { useState } from 'react';
import { BookOpen, Heart, MapPin, Scale, Search, ChevronRight, Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Education = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'breeds', name: 'Breed Guides', icon: <Heart className="w-4 h-4" /> },
    { id: 'firsttime', name: 'First-Time Owners', icon: <User className="w-4 h-4" /> },
    { id: 'vetcare', name: 'Vet & Care', icon: <MapPin className="w-4 h-4" /> },
    { id: 'legal', name: 'Legal Guide', icon: <Scale className="w-4 h-4" /> }
  ];

  const resources = [
    {
      id: 1,
      category: 'breeds',
      title: 'Golden Retriever Complete Guide',
      description: 'Everything you need to know about Golden Retrievers - temperament, care, and training tips.',
      readTime: '12 min read',
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      category: 'firsttime',
      title: 'Puppy-Proofing Your Home',
      description: 'Essential checklist for preparing your home for a new puppy arrival.',
      readTime: '8 min read',
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      category: 'legal',
      title: 'California Dog Sale Laws',
      description: 'State-specific regulations for buying and selling dogs in California.',
      readTime: '15 min read',
      rating: 4.6,
      reviews: 34,
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      category: 'vetcare',
      title: 'Finding the Right Veterinarian',
      description: 'How to choose a veterinarian and what to expect during your first visit.',
      readTime: '10 min read',
      rating: 4.7,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      category: 'breeds',
      title: 'French Bulldog Health Guide',
      description: 'Common health issues in French Bulldogs and prevention strategies.',
      readTime: '14 min read',
      rating: 4.8,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop'
    },
    {
      id: 6,
      category: 'firsttime',
      title: 'Puppy Training Basics',
      description: 'Foundation training techniques for new puppy owners.',
      readTime: '18 min read',
      rating: 4.9,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop'
    }
  ];

  const filteredResources = activeCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Resources</h1>
        <p className="text-gray-600">Learn everything you need to know about dog ownership and care</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search resources..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Featured Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">New Owner Starter Pack</h2>
              <p className="text-gray-600 mb-4">Complete guide for first-time dog owners</p>
              <Button>Get Started</Button>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=150&fit=crop"
                alt="Puppy care"
                className="rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <img
                src={resource.image}
                alt={resource.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge 
                variant="secondary" 
                className="absolute top-3 left-3 capitalize"
              >
                {resource.category === 'firsttime' ? 'First-Time Owner' : 
                 resource.category === 'vetcare' ? 'Vet Care' : 
                 resource.category}
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{resource.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{resource.readTime}</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-current" />
                  <span>{resource.rating}</span>
                  <span>({resource.reviews})</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full group">
                Read Article
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vet Directory Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Local Vet Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Find trusted veterinarians in your area</p>
          <div className="flex gap-4">
            <Input placeholder="Enter your ZIP code" className="max-w-xs" />
            <Button>Find Vets</Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal Guide Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-green-500" />
            State-by-State Legal Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">Understand dog sale and adoption laws in your state</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              California Laws
            </Button>
            <Button variant="outline" className="justify-start">
              Texas Laws
            </Button>
            <Button variant="outline" className="justify-start">
              New York Laws
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Education;
