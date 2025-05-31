
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, MessageSquare, BarChart3 } from 'lucide-react';
import StarRating from '@/components/reviews/StarRating';

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
}

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  posts: string[];
  reviews: Review[];
  analyticsComponent?: React.ReactNode;
}

const ProfileTabs = ({ activeTab, setActiveTab, posts, reviews, analyticsComponent }: ProfileTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-0 ${
            activeTab === 'posts'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ borderRadius: '0px', border: 'none', outline: 'none' }}
        >
          <Grid size={14} />
          Posts
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-0 ${
            activeTab === 'reviews'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ borderRadius: '0px', border: 'none', outline: 'none' }}
        >
          <MessageSquare size={14} />
          Reviews
        </button>
        {analyticsComponent && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-0 ${
              activeTab === 'analytics'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            style={{ borderRadius: '0px', border: 'none', outline: 'none' }}
          >
            <BarChart3 size={14} />
            Analytics
          </button>
        )}
      </div>

      <TabsContent value="posts" className="mt-4">
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post, index) => (
            <div key={index} className="aspect-square">
              <img
                src={post}
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover rounded-sm"
              />
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-4">
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.author}</span>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              <p className="text-sm text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      {analyticsComponent && (
        <TabsContent value="analytics" className="mt-4">
          {analyticsComponent}
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProfileTabs;
