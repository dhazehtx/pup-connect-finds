
import React, { useState } from 'react';
import { BookOpen, Heart, MapPin, Scale, Search, Filter, Download, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResourceCard } from '../components/education/ResourceCard';
import { useEducationSearch } from '../hooks/useEducationSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import { educationResources, categories } from '../data/educationResources';
import { useToast } from '../hooks/use-toast';

const Education = () => {
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const { toast } = useToast();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredResources
  } = useEducationSearch(educationResources);

  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();

  const displayResources = showBookmarksOnly 
    ? filteredResources.filter(resource => isBookmarked(resource.id))
    : filteredResources;

  const handleDownload = (resource: any) => {
    // Simulate download
    toast({
      title: "Download Started",
      description: `Downloading "${resource.title}" PDF guide...`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Resources</h1>
        <p className="text-gray-600">Learn everything you need to know about dog ownership and care</p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search resources, tags, authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showBookmarksOnly ? "default" : "outline"}
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className="flex items-center gap-2"
          >
            <Bookmark size={16} />
            Bookmarked ({bookmarkedIds.length})
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {displayResources.length} of {educationResources.length} resources
          {searchTerm && ` for "${searchTerm}"`}
          {showBookmarksOnly && " (bookmarked only)"}
        </p>
      </div>

      {/* Featured Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">New Owner Starter Pack</h2>
              <p className="text-gray-600 mb-4">Complete guide for first-time dog owners with downloadable checklists</p>
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            isBookmarked={isBookmarked(resource.id)}
            onToggleBookmark={toggleBookmark}
            onDownload={handleDownload}
          />
        ))}
      </div>

      {displayResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

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
