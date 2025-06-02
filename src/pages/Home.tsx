
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
import StoryViewer from '@/components/stories/StoryViewer';
import { sampleStories, Story } from '@/data/sampleStories';

// Sample posts data
const samplePosts = [
  {
    id: 1,
    username: 'goldenbreeder',
    userAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50&h=50&fit=crop&crop=face',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    caption: 'Meet Luna! 🐕 This beautiful Golden Retriever puppy is looking for her forever home. She loves playing fetch and cuddles! #goldenretriever #puppylove',
    likes: 127,
    comments: 23,
    timeAgo: '2h'
  },
  {
    id: 2,
    username: 'puppylover',
    userAvatar: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=50&h=50&fit=crop&crop=face',
    location: 'Denver, CO',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
    caption: 'Max is the sweetest chocolate lab! He\'s great with kids and loves swimming 🏊‍♂️ #labrador #chocolate #goodboy',
    likes: 89,
    comments: 15,
    timeAgo: '4h'
  },
  {
    id: 3,
    username: 'dogrescue',
    userAvatar: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=50&h=50&fit=crop&crop=face',
    location: 'Portland, OR',
    image: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=400&h=400&fit=crop',
    caption: 'Buddy found his forever home today! 🏠❤️ Thank you to everyone who shared his story. #rescue #adopted #happiness',
    likes: 234,
    comments: 41,
    timeAgo: '6h'
  },
  {
    id: 4,
    username: 'frenchbulldog',
    userAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=50&h=50&fit=crop&crop=face',
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
    caption: 'Bella\'s first day at the park! She made so many new friends 🐾 #frenchie #parkday #socializing',
    likes: 156,
    comments: 28,
    timeAgo: '8h'
  }
];

const Home = () => {
  const { user, isGuest } = useAuth();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<Story[]>(sampleStories);

  const handleStoryClick = (index: number) => {
    const story = stories[index];
    if (story.isAddStory) {
      // Handle add story functionality
      console.log('Add new story');
      return;
    }
    setSelectedStoryIndex(index);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
  };

  const handleNextStory = () => {
    if (selectedStoryIndex !== null) {
      const nextIndex = (selectedStoryIndex + 1) % stories.filter(s => !s.isAddStory).length;
      const adjustedIndex = nextIndex === 0 ? 1 : nextIndex + 1; // Skip "add story"
      setSelectedStoryIndex(adjustedIndex);
    }
  };

  const handlePreviousStory = () => {
    if (selectedStoryIndex !== null) {
      const prevIndex = selectedStoryIndex - 1;
      const adjustedIndex = prevIndex < 1 ? stories.length - 1 : prevIndex; // Skip "add story"
      setSelectedStoryIndex(adjustedIndex);
    }
  };

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
          {samplePosts.map((post) => (
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
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
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
                  <p className="text-sm">
                    <span className="font-semibold">{post.username}</span> {post.caption}
                  </p>
                  {post.comments > 0 && (
                    <p className="text-sm text-gray-500">
                      View all {post.comments} comments
                    </p>
                  )}
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {post.timeAgo} ago
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories.filter(s => !s.isAddStory)}
          currentStoryIndex={selectedStoryIndex - 1} // Adjust for filtered array
          onClose={handleCloseStory}
          onNext={handleNextStory}
          onPrevious={handlePreviousStory}
        />
      )}
    </div>
  );
};

export default Home;
