
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ResourceCard } from './ResourceCard';
import { EducationSections } from './EducationSections';
import { EducationLearningPaths } from './EducationLearningPaths';
import { EducationQuickTools } from './EducationQuickTools';
import { EducationResource } from '../../hooks/useEducationSearch';

interface EducationTabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  displayResources: EducationResource[];
  allResources: EducationResource[];
  paginatedData: EducationResource[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  searchTerm: string;
  showBookmarksOnly: boolean;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  handleResourceClick: (resource: EducationResource) => void;
  isBookmarked: (id: number) => boolean;
  onToggleBookmark: (id: number) => void;
  handleDownload: (resource: EducationResource) => void;
  isRead: (id: number) => boolean;
  getProgress: (id: number) => { progress: number };
  markAsRead: (id: number) => void;
}

export const EducationTabsContainer: React.FC<EducationTabsContainerProps> = ({
  activeTab,
  setActiveTab,
  displayResources,
  allResources,
  paginatedData,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  searchTerm,
  showBookmarksOnly,
  hasNextPage,
  hasPrevPage,
  goToPage,
  nextPage,
  prevPage,
  handleResourceClick,
  isBookmarked,
  onToggleBookmark,
  handleDownload,
  isRead,
  getProgress,
  markAsRead
}) => {
  return (
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
                  onToggleBookmark={onToggleBookmark}
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
          resources={allResources}
          onResourceClick={handleResourceClick}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
          isRead={isRead}
          getProgress={getProgress}
        />
      </TabsContent>

      <TabsContent value="guides" className="mt-6">
        <EducationLearningPaths />
      </TabsContent>

      <TabsContent value="tools" className="mt-6">
        <EducationQuickTools />
      </TabsContent>
    </Tabs>
  );
};
