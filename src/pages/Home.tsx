
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import StoryViewer from '@/components/stories/StoryViewer';
import StoryCreator from '@/components/stories/StoryCreator';
import { sampleStories, Story } from '@/data/sampleStories';

const Home = () => {
  const { user, isGuest } = useAuth();
  const { listings, loading } = useDogListings();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<Story[]>(sampleStories);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  // Convert listings to posts format for the feed
  const feedPosts = listings.slice(0, 6).map((listing) => ({
    id: listing.id,
    username: listing.profiles?.username || 'Unknown User',
    userAvatar: listing.profiles?.avatar_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50&h=50&fit=crop&crop=face',
    location: listing.location || 'Location not specified',
    image: listing.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    caption: `Meet ${listing.dog_name}! 🐕 This beautiful ${listing.breed} is looking for a forever home. ${listing.description || ''} #${listing.breed.toLowerCase().replace(/\s+/g, '')} #puppylove`,
    likes: Math.floor(Math.random() * 200) + 50, // Random likes for demo
    comments: Math.floor(Math.random() * 50) + 5, // Random comments for demo
    timeAgo: new Date(listing.created_at).toLocaleDateString(),
    price: `$${listing.price}`,
    dogName: listing.dog_name,
    breed: listing.breed,
    age: listing.age
  }));

  const handleStoryClick = (index: number) => {
    const story = stories[index];
    if (story.isAddStory) {
      if (user && !isGuest) {
        setShowStoryCreator(true);
      } else {
        console.log('Please sign in to create stories');
        return;
      }
      return;
    }
    setSelectedStoryIndex(index);
  };

  const handleStoryCreated = (newStory: Story) => {
    setStories(prev => {
      const filteredStories = prev.filter(s => s.username !== newStory.username || s.isAddStory);
      filteredStories.splice(1, 0, newStory);
      return filteredStories;
    });
    setShowStoryCreator(false);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  const handleNextStory = () => {
    if (selectedStoryIndex !== null) {
      const nextIndex = (selectedStoryIndex + 1) % stories.filter(s => !s.isAddStory).length;
      const adjustedIndex = nextIndex === 0 ? 1 : nextIndex + 1;
      setSelectedStoryIndex(adjustedIndex);
    }
  };

  const handlePreviousStory = () => {
    if (selectedStoryIndex !== null) {
      const prevIndex = selectedStoryIndex - 1;
      const adjustedIndex = prevIndex < 1 ? stories.length - 1 : prevIndex;
      setSelectedStoryIndex(adjustedIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instagram-like Feed */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Stories Section */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {stories.map((story, index) => (
              <div 
                key={story.id} 
                className="flex flex-col items-center space-y-1 min-w-[60px] cursor-pointer"
                onClick={() => handleStoryClick(index)}
              >
                <div className={`w-14 h-14 rounded-full p-0.5 ${story.isAddStory ? 'bg-gray-200' : 'bg-gradient-to-tr from-yellow-400 to-pink-600'}`}>
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {story.isAddStory ? (
                      <Plus className="w-6 h-6 text-gray-600" />
                    ) : (
                      <img 
                        src={story.avatar!} 
                        alt={story.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 text-center max-w-[60px] truncate">
                  {story.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-0">
          {feedPosts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500">No listings available yet. Be the first to post!</p>
            </div>
          ) : (
            feedPosts.map((post) => (
              <Card key={post.id} className="rounded-none border-x-0 border-t-0 border-b border-gray-200 shadow-none">
                {/* Post Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={post.userAvatar} 
                        alt={post.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{post.username}</p>
                      <p className="text-xs text-gray-500">{post.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.price}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Post Image */}
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={post.image} 
                    alt="Post content"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Post Actions */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Heart className="w-6 h-6" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <Share2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold">{post.likes.toLocaleString()} likes</span>
                    </p>
                    <div className="flex flex-wrap gap-1 text-xs text-gray-600 mb-2">
                      <Badge variant="outline" className="text-xs">{post.breed}</Badge>
                      <Badge variant="outline" className="text-xs">{post.age} months</Badge>
                    </div>
                    <p className="text-sm">
                      <span className="font-semibold">{post.username}</span> {post.caption}
                    </p>
                    {post.comments > 0 && (
                      <p className="text-sm text-gray-500">
                        View all {post.comments} comments
                      </p>
                    )}
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {post.timeAgo}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Story Creator */}
      {showStoryCreator && (
        <StoryCreator
          onClose={() => setShowStoryCreator(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories.filter(s => !s.isAddStory)}
          currentStoryIndex={selectedStoryIndex - 1}
          onClose={handleCloseStory}
          onNext={handleNextStory}
          onPrevious={handlePreviousStory}
        />
      )}
    </div>
  );
};

export default Home;
