
import React from 'react';
import { Grid, Star, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

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
}

const ProfileTabs = ({ activeTab, setActiveTab, posts, reviews }: ProfileTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t border-gray-200">
      <TabsList className="grid w-full grid-cols-3 bg-blue-50">
        <TabsTrigger value="posts" className="flex items-center gap-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          <Grid size={16} />
          <span className="text-xs font-medium">POSTS</span>
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex items-center gap-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          <Star size={16} />
          <span className="text-xs font-medium">REVIEWS</span>
        </TabsTrigger>
        <TabsTrigger value="saved" className="flex items-center gap-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
          <Heart size={16} />
          <span className="text-xs font-medium">SAVED</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-0">
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.map((post, index) => (
            <div key={index} className="aspect-square relative group">
              <img
                src={post}
                alt="Post"
                className="w-full h-full object-cover rounded-sm"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-sm" />
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="reviews" className="mt-0">
        <div className="space-y-4 p-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{review.author}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                <span className="text-xs text-gray-500">{review.date}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="saved" className="mt-0">
        <div className="p-4 text-center text-gray-500">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p>No saved posts yet</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
