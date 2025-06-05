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
  };

  const readCount = getReadCount();
  const totalResourcesCount = educationResources.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Educational Resources</h1>
        <p className="text-muted-foreground mb-4">Learn everything you need to know about dog ownership and care</p>
        
        {/* Progress Summary */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <span>{readCount} of {totalResourcesCount} articles completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-primary" />
            <span>{bookmarkedIds.length} bookmarked</span>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search resources, tags, authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="hover:bg-muted">
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="hover:bg-muted">All Levels</SelectItem>
              <SelectItem value="Beginner" className="hover:bg-muted">Beginner</SelectItem>
              <SelectItem value="Intermediate" className="hover:bg-muted">Intermediate</SelectItem>
              <SelectItem value="Advanced" className="hover:bg-muted">Advanced</SelectItem>
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
      <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">New Owner Starter Pack</h2>
              <p className="text-muted-foreground mb-4">Complete guide for first-time dog owners with downloadable checklists</p>
              <Button onClick={() => handleResourceClick(educationResources[1])} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All Resources
          </TabsTrigger>
          <TabsTrigger 
            value="sections" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Browse Sections
          </TabsTrigger>
          <TabsTrigger 
            value="guides" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Learning Paths
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Quick Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-muted-foreground">
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
                      className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => goToPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage}
                      className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {displayResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  🐶 First-Time Owner Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Complete journey from preparation to advanced care</p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-muted-foreground">• Puppy-Proofing Your Home</div>
                  <div className="text-sm text-muted-foreground">• Puppy Training Basics</div>
                  <div className="text-sm text-muted-foreground">• Finding the Right Veterinarian</div>
                  <div className="text-sm text-muted-foreground">• Vaccination Schedule Guide</div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Start Learning Path</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  🥗 Nutrition Expert Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Master dog nutrition from puppyhood to senior years</p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-muted-foreground">• Puppy Nutrition Fundamentals</div>
                  <div className="text-sm text-muted-foreground">• Adult Dog Diet Planning</div>
                  <div className="text-sm text-muted-foreground">• Senior Dog Nutrition</div>
                  <div className="text-sm text-muted-foreground">• Special Dietary Needs</div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Start Learning Path</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">🏥 Vet Finder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Find trusted veterinarians in your area</p>
                <div className="flex gap-2">
                  <Input placeholder="ZIP code" className="flex-1 bg-card border-border" />
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Find</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">📋 Health Checker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Quick health assessment tool</p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Start Assessment</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">📅 Care Planner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Create a personalized care schedule</p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Plan</Button>
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
      <Card className="mt-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Scale className="w-5 h-5 text-primary" />
            State-by-State Legal Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Understand dog sale and adoption laws in your state</p>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start border-border hover:bg-muted">
              California Laws
            </Button>
            <Button variant="outline" className="justify-start border-border hover:bg-muted">
              Texas Laws
            </Button>
            <Button variant="outline" className="justify-start border-border hover:bg-muted">
              New York Laws
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Education;
