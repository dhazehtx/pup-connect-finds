import React, { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dog, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';
import { FEATURES } from '@/config/features';

const LostAndFoundExploreSection = lazy(() => import('@/components/explore/LostAndFoundExploreSection'));

interface ExploreTabbedPageProps {
  children: React.ReactNode;
  /** When true, the single "Explore" header is shown and tab content may hide their own title. */
  showHeader?: boolean;
}

export default function ExploreTabbedPage({ children, showHeader = true }: ExploreTabbedPageProps) {
  const [activeTab, setActiveTab] = useState<string>('puppies');
  const lostAndFoundEnabled = FEATURES.lostAndFound;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {showHeader && (
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Explore</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
              {lostAndFoundEnabled
                ? 'Discover puppies, breeds, services, and help reunite lost pets'
                : 'Discover puppies, breeds, and services'}
            </p>
          </div>
        )}

        {lostAndFoundEnabled ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-2 h-auto gap-1 p-1">
              <TabsTrigger value="puppies" className="gap-2 py-2.5">
                <Dog className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Puppies</span>
              </TabsTrigger>
              <TabsTrigger value="lost-and-found" className="gap-2 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Lost &amp; Found</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="puppies" className="mt-6 focus-visible:outline-none">
              {children}
            </TabsContent>

            <TabsContent value="lost-and-found" className="mt-6 focus-visible:outline-none">
              <ErrorBoundaryWrapper fallbackMessage="Lost & Found failed to load">
                <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner /></div>}>
                  <LostAndFoundExploreSection />
                </Suspense>
              </ErrorBoundaryWrapper>
            </TabsContent>
          </Tabs>
        ) : (
          // Lost & Found gated for closed beta: render the puppies content directly.
          <div className="focus-visible:outline-none">{children}</div>
        )}
      </div>
    </div>
  );
}
