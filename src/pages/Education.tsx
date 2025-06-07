
import React, { useState, useEffect } from 'react';
import { RelatedArticles } from '../components/education/RelatedArticles';
import { EducationHeader } from '../components/education/EducationHeader';
import { EducationSearchFilters } from '../components/education/EducationSearchFilters';
import { EducationFeaturedSection } from '../components/education/EducationFeaturedSection';
import { EducationTabsContainer } from '../components/education/EducationTabsContainer';
import { EducationLegalGuide } from '../components/education/EducationLegalGuide';
import { useEducationSearch } from '../hooks/useEducationSearch';
import { useBookmarks } from '../hooks/useBookmarks';
import { usePagination } from '../hooks/usePagination';
import { educationResources, categories } from '../data/educationResources';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Education = () => {
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  // Simple reading progress implementation
  const markAsRead = (id: string) => {
    setReadItems(prev => new Set([...prev, id]));
  };

  const isRead = (id: string) => readItems.has(id);
  const getReadCount = () => readItems.size;
  const getProgress = (id: string) => isRead(id) ? 100 : 0;

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

  const handleRegulationClick = (category: string) => {
    navigate(`/legal?category=${category}`);
  };

  const readCount = getReadCount();
  const totalResourcesCount = educationResources.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <EducationHeader 
        readCount={readCount}
        totalResourcesCount={totalResourcesCount}
        bookmarkedCount={bookmarkedIds.length}
      />

      <EducationSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        showBookmarksOnly={showBookmarksOnly}
        setShowBookmarksOnly={setShowBookmarksOnly}
        bookmarkedCount={bookmarkedIds.length}
        categories={categories}
      />

      <EducationFeaturedSection />

      <EducationTabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayResources={displayResources}
        allResources={educationResources}
        paginatedData={paginatedData}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        searchTerm={searchTerm}
        showBookmarksOnly={showBookmarksOnly}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        goToPage={goToPage}
        nextPage={nextPage}
        prevPage={prevPage}
        handleResourceClick={handleResourceClick}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        handleDownload={handleDownload}
        isRead={isRead}
        getProgress={getProgress}
        markAsRead={markAsRead}
      />

      {/* Related Articles - Show when a resource is selected */}
      {selectedResource && (
        <RelatedArticles
          currentResource={selectedResource}
          allResources={educationResources}
          onResourceClick={handleResourceClick}
        />
      )}

      <EducationLegalGuide onRegulationClick={handleRegulationClick} />
    </div>
  );
};

export default Education;
