import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Hash, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrendingPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/discover/trending-hashtags', 20],
    queryFn: () => apiRequest('/api/discover/trending-hashtags?limit=20'),
  });

  const trending = (data as { trending?: { tag: string; count: number }[] })?.trending ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/explore">
            <Button variant="ghost" size="icon" aria-label="Back to Explore">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Hash className="w-7 h-7 text-blue-600" />
              Trending hashtags
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Popular tags from the last 7 days
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200">
            Failed to load trending hashtags. Try again later.
          </div>
        )}

        {!isLoading && !error && trending.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No trending hashtags yet. Be the first to post with #puppies or #mypup!
          </div>
        )}

        {!isLoading && trending.length > 0 && (
          <div className="grid gap-3">
            {trending.map(({ tag, count }, i) => (
              <Link
                key={tag}
                to={`/explore?tag=${encodeURIComponent(tag)}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400 w-8 font-medium">#{i + 1}</span>
                <span className="flex-1 font-semibold text-gray-900 dark:text-white">#{tag}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{count} post{count !== 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
