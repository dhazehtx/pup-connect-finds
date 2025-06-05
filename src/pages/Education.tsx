
import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, MapPin, Scale, Search, Filter, Download, Bookmark, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ResourceCard } from '../components/education/ResourceCard';
import { RelatedArticles } from '../components/education/RelatedArticles';
import { EducationSections } from '../components/education/EducationSections';
import { useEducationSearch } from '../hooks/useEducationSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { usePagination } from '../hooks/usePagination';
import { educationResources, categories } from '../data/educationResources';
import { useToast } from '../hooks/use-toast';

const Education = () => {
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
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
  const { markAsRead, getProgress, isRead, getReadCount } = useReadingProgress();

  const displayResources = showBookmarksOnly 
    ? filteredResources.filter(resource => isBookmarked(resource.id))
    : filteredResources;

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems,
    resetPagination
  } = usePagination({ data: displayResources, itemsPerPage: 9 });

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchTerm, selectedCategory, selectedDifficulty, showBookmarksOnly, activeTab, resetPagination]);

  const handleDownload = (resource: any) => {
    toast({
      title: "Download Started",
      description: `Downloading "${resource.title}" PDF guide...`,
    });
  };

  const handleResourceClick = (resource: any) => {
    setSelectedResource(resource);
    markAsRead(resource.id);
    // Open the actual resource URL
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const readCount = getReadCount();
  const totalResourcesCount = educationResources.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Resources</h1>
        <p className="text-gray-600 mb-4">Learn everything you need to know about dog ownership and care</p>
        
        {/* Progress Summary */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" />
            <span>{readCount} of {totalResourcesCount} articles completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-blue-600" />
            <span>{bookmarkedIds.length} bookmarked</span>
          </div>
        </div>
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

      {/* Featured Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">New Owner Starter Pack</h2>
              <p className="text-gray-600 mb-4">Complete guide for first-time dog owners with downloadable checklists</p>
              <Button 
                onClick={() => window.open('https://www.petfinder.com/dogs/bringing-a-dog-home/dog-proofing-home/', '_blank')}
              >
                Get Started
              </Button>
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

      {/* Tabbed Content Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 bg-blue-50">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">All Resources</TabsTrigger>
          <TabsTrigger value="sections" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Browse Sections</TabsTrigger>
          <TabsTrigger value="guides" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Learning Paths</TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Quick Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {startIndex}-{endIndex} of {totalItems} resources
              {searchTerm && ` for "${searchTerm}"`}
              {showBookmarksOnly && " (bookmarked only)"}
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedData.map((resource) => {
              const progress = getProgress(resource.id);
              return (
                <div key={resource.id} onClick={() => handleResourceClick(resource)}>
                  <ResourceCard
                    resource={resource}
                    isBookmarked={isBookmarked(resource.id)}
                    onToggleBookmark={toggleBookmark}
                    onDownload={handleDownload}
                    isRead={isRead(resource.id)}
                    progress={progress.progress}
                    onMarkAsRead={markAsRead}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mb-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={prevPage}
                      className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => goToPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage}
                      className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {displayResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <EducationSections 
            resources={educationResources}
            onResourceClick={handleResourceClick}
            isBookmarked={isBookmarked}
            onToggleBookmark={toggleBookmark}
            isRead={isRead}
            getProgress={getProgress}
          />
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🐶 First-Time Owner Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Complete journey from preparation to advanced care</p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">• <a href="https://www.petfinder.com/dogs/bringing-a-dog-home/dog-proofing-home/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Puppy-Proofing Your Home</a></div>
                  <div className="text-sm text-gray-600">• <a href="https://www.humanesociety.org/resources/how-train-your-puppy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Puppy Training Basics</a></div>
                  <div className="text-sm text-gray-600">• <a href="https://www.petmd.com/dog/general-health/how-choose-veterinarian-your-dog" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finding the Right Veterinarian</a></div>
                  <div className="text-sm text-gray-600">• <a href="https://www.petmd.com/dog/puppycenter/health/evr_dg_puppy_vaccination_schedule" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AKC Vaccination Schedule Guide</a></div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://www.petfinder.com/dogs/bringing-a-dog-home/dog-proofing-home/', '_blank')}
                >
                  Start Learning Path
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🥗 Nutrition Expert Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Master dog nutrition from puppyhood to senior years</p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">• <a href="https://www.petmd.com/dog/puppycenter/nutrition/evr_dg_feeding-your-puppy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Puppy Nutrition Fundamentals</a></div>
                  <div className="text-sm text-gray-600">• <a href="https://www.petmd.com/dog/nutrition/evr_dg_how_much_food_should_i_feed_my_dog" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Adult Dog Diet Planning</a></div>
                  <div className="text-sm text-gray-600">• <a href="https://www.petmd.com/dog/nutrition/evr_dg_senior_dog_nutrition" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Senior Dog Nutrition</a></div>
                  <div className="text-sm text-gray-600">• <a href="https://www.petmd.com/dog/nutrition/evr_dg_healthy_treats_for_dogs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Healthy Treats and Special Diets</a></div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://www.petmd.com/dog/nutrition', '_blank')}
                >
                  Start Learning Path
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🏥 Vet Finder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Find trusted veterinarians in your area</p>
                <div className="flex gap-2">
                  <Input placeholder="ZIP code" className="flex-1" />
                  <Button onClick={() => window.open('https://www.petfinder.com/animal-shelters-and-rescues/', '_blank')}>
                    Find
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📋 Health Checker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Quick health assessment tool</p>
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://www.petmd.com/dog/conditions', '_blank')}
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📅 Care Planner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create a personalized care schedule</p>
                <Button 
                  className="w-full"
                  onClick={() => window.open('https://www.petmd.com/dog/puppycenter', '_blank')}
                >
                  Create Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Articles - Show when a resource is selected */}
      {selectedResource && (
        <RelatedArticles
          currentResource={selectedResource}
          allResources={educationResources}
          onResourceClick={handleResourceClick}
        />
      )}

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
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.open('https://www.animallaw.info/statute/ca-dog-consolidated-dog-laws', '_blank')}
            >
              California Laws
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.open('https://www.animallaw.info/statute/tx-dog-consolidated-dog-laws', '_blank')}
            >
              Texas Laws
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.open('https://www.animallaw.info/statute/ny-dog-consolidated-dog-laws', '_blank')}
            >
              New York Laws
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Education;
