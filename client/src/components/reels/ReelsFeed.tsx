import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Home } from 'lucide-react';
import VideoPost from './VideoPost';
import { useToast } from '@/hooks/use-toast';

interface ReelsPost {
  id: string;
  user_id: string;
  video_url: string;
  caption?: string;
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  duration?: number;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
}

interface ReelsFeedProps {
  onClose?: () => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({ onClose }) => {
  const [posts, setPosts] = useState<ReelsPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockReelsPosts: ReelsPost[] = [
    {
      id: '1',
      user_id: 'user1',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      caption: 'Meet Luna! 🐕 This beautiful Golden Retriever loves playing fetch in the park. #GoldenRetriever #DogLife #PlayfulPups',
      hashtags: ['GoldenRetriever', 'DogLife', 'PlayfulPups'],
      likes_count: 1245,
      comments_count: 89,
      shares_count: 34,
      views_count: 12400,
      duration: 15,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: 'Sarah Johnson',
        username: 'sarahlovesdogs',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true
      }
    },
    {
      id: '2',
      user_id: 'user2',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      caption: 'Training session with Max! 🎯 Teaching him new tricks with positive reinforcement. #DogTraining #PositiveReinforcement #Puppy',
      hashtags: ['DogTraining', 'PositiveReinforcement', 'Puppy'],
      likes_count: 892,
      comments_count: 56,
      shares_count: 21,
      views_count: 8750,
      duration: 22,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profiles: {
        full_name: 'Mike Wilson',
        username: 'dogtrainer_mike',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false
      }
    },
    {
      id: '3',
      user_id: 'user3',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      caption: 'Rescue story! 💕 From scared shelter pup to confident family dog. Adoption saves lives! #RescueDog #AdoptDontShop #Transformation',
      hashtags: ['RescueDog', 'AdoptDontShop', 'Transformation'],
      likes_count: 2156,
      comments_count: 134,
      shares_count: 78,
      views_count: 18900,
      duration: 30,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profiles: {
        full_name: 'Emma Davis',
        username: 'rescuepupslove',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        verified: true
      }
    }
  ];

  useEffect(() => {
    // Load reels posts (using mock data for now)
    setTimeout(() => {
      setPosts(mockReelsPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (direction === 'down' && currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, posts.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleScroll('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleScroll('up');
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [handleScroll, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: post.likes_count + 1 }
        : post
    ));
    toast({
      title: "Liked!",
      description: "You liked this reel",
    });
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Comments",
      description: "Comments feature coming soon!",
    });
  };

  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this reel!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Reel link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading reels...</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center">
          <p className="text-lg mb-4">No reels available</p>
          <Button onClick={onClose} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-hidden"
    >
      {/* Navigation buttons */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScroll('up')}
            disabled={currentIndex === 0}
            className="bg-black/50 text-white hover:bg-black/70 p-2 rounded-full"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleScroll('down')}
            disabled={currentIndex === posts.length - 1}
            className="bg-black/50 text-white hover:bg-black/70 p-2 rounded-full"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      )}

      {/* Current video */}
      <div 
        className="flex transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`,
          height: `${posts.length * 100}vh`
        }}
      >
        {posts.map((post, index) => (
          <div key={post.id} className="w-full h-screen flex-shrink-0">
            <VideoPost
              post={post}
              isVisible={index === currentIndex}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
            />
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {posts.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-6 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ReelsFeed;