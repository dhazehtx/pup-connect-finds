
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Plus,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import StoryViewer from '@/components/stories/StoryViewer';
import StoryCreator from '@/components/stories/StoryCreator';
import { sampleStories, Story } from '@/data/sampleStories';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, isGuest } = useAuth();
  const { listings, loading } = useDogListings();
  const navigate = useNavigate();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<Story[]>(sampleStories);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  // Enhanced mock feed posts data to ensure content is always visible
  const mockFeedPosts = [
    {
      id: 'post-1',
      username: 'golden_breeder_sf',
      userAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=50&h=50&fit=crop&crop=face',
      location: 'San Francisco, CA',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
      caption: 'Meet Luna! 🐕 This beautiful Golden Retriever puppy is looking for her forever home. She\'s 8 weeks old, health tested, and has the sweetest temperament. AKC registered with champion bloodlines. #goldenretriever #puppylove #akc',
      likes: 142,
      comments: 23,
      timeAgo: '2 hours ago',
      price: '$2,800',
      dogName: 'Luna',
      breed: 'Golden Retriever',
      age: '8 weeks'
    },
    {
      id: 'post-2',
      username: 'frenchie_love_bay',
      userAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=50&h=50&fit=crop&crop=face',
      location: 'Oakland, CA',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
      caption: 'Bella is ready for her new family! 💙 This gorgeous French Bulldog has the most adorable personality. She\'s playful, loves cuddles, and gets along great with kids. Health tested parents. #frenchbulldog #frenchie #puppy',
      likes: 89,
      comments: 15,
      timeAgo: '4 hours ago',
      price: '$4,200',
      dogName: 'Bella',
      breed: 'French Bulldog',
      age: '10 weeks'
    },
    {
      id: 'post-3',
      username: 'shepherd_sanctuary',
      userAvatar: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=50&h=50&fit=crop&crop=face',
      location: 'San Jose, CA',
      image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop',
      caption: 'Charlie is a stunning German Shepherd from champion lines! 🏆 He\'s intelligent, loyal, and has excellent temperament. Perfect for families looking for a protective and loving companion. #germanshepherd #champion #puppy',
      likes: 203,
      comments: 31,
      timeAgo: '6 hours ago',
      price: '$3,500',
      dogName: 'Charlie',
      breed: 'German Shepherd',
      age: '12 weeks'
    },
    {
      id: 'post-4',
      username: 'rescue_hearts_ca',
      userAvatar: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=50&h=50&fit=crop&crop=face',
      location: 'Berkeley, CA',
      image: 'https://images.unsplash.com/photo-1529472119196-cb724127a98e?w=400&h=400&fit=crop',
      caption: 'Meet Max! 🐾 This sweet rescue pup is looking for his forever home. He\'s great with kids, fully vaccinated, and just wants to be loved. Adoption fee helps us save more lives! #rescue #adoption #mixedbreed',
      likes: 67,
      comments: 12,
      timeAgo: '8 hours ago',
      price: '$150',
      dogName: 'Max',
      breed: 'Mixed Breed',
      age: '2 years'
    },
    {
      id: 'post-5',
      username: 'labrador_love_ca',
      userAvatar: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=50&h=50&fit=crop&crop=face',
      location: 'Fremont, CA',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop',
      caption: 'Sweet Labrador puppies ready for new homes! 🥰 These adorable pups are well socialized and love to play. Perfect family dogs with gentle temperaments. #labrador #puppies #familydog',
      likes: 156,
      comments: 28,
      timeAgo: '1 day ago',
      price: '$1,500',
      dogName: 'Buddy & Friends',
      breed: 'Labrador',
      age: '10 weeks'
    },
    {
      id: 'post-6',
      username: 'beagle_breeders_norcal',
      userAvatar: 'https://images.unsplash.com/photo-1544717342-7b6977ea1f8a?w=50&h=50&fit=crop&crop=face',
      location: 'Sacramento, CA',
      image: 'https://images.unsplash.com/photo-1544717342-7b6977ea1f8a?w=400&h=400&fit=crop',
      caption: 'Beagle puppies with amazing hunting lineage! 🦴 These pups are energetic, friendly, and great with children. Health tested parents with excellent temperaments. #beagle #hunting #puppies',
      likes: 94,
      comments: 19,
      timeAgo: '1 day ago',
      price: '$1,200',
      dogName: 'Scout',
      breed: 'Beagle',
      age: '9 weeks'
    }
  ];

  // Always use mock data to ensure content is visible
  const feedPosts = mockFeedPosts;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instagram-like Feed */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header with Progress Button */}
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Home</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/completion-dashboard')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Progress
            </Button>
          </div>
          
          {/* Stories Section */}
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
          {feedPosts.map((post) => (
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
                    <Badge variant="outline" className="text-xs">{post.age}</Badge>
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
          ))}
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
