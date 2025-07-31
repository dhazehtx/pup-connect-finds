import React from 'react';
import PostCard from '@/components/feed/PostCard';

// Sample featured posts data
const featuredPosts = [
  {
    id: 'featured-1',
    user_id: '1',
    title: "Golden Retriever Training Tips",
    caption: "Just adopted this beautiful Golden Retriever puppy! 🐕 Any training tips for first-time owners? #GoldenRetriever #PuppyTraining #DogLover",
    content: "Just adopted this beautiful Golden Retriever puppy! 🐕 Any training tips for first-time owners?",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop"],
    video_url: undefined,
    hashtags: ["GoldenRetriever", "PuppyTraining", "DogLover"],
    post_type: 'photo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    likes_count: 24,
    comments_count: 8,
    shares_count: 3,
    profiles: {
      id: '1',
      full_name: 'Sarah Johnson',
      username: 'sarahj_dogs',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b96f?w=150&h=150&fit=crop&crop=face',
      verified: true
    }
  },
  {
    id: 'featured-2',
    user_id: '2',
    title: "Beagle Adventures in the Park",
    caption: "Max loves his morning walks in the park! 🌳 Nothing beats seeing him this happy and energetic. #BeagleLife #DogPark #MorningWalk",
    content: "Max loves his morning walks in the park! 🌳 Nothing beats seeing him this happy and energetic.",
    image_url: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop"],
    video_url: undefined,
    hashtags: ["BeagleLife", "DogPark", "MorningWalk"],
    post_type: 'photo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    likes_count: 18,
    comments_count: 5,
    shares_count: 2,
    profiles: {
      id: '2',
      full_name: 'Mike Chen',
      username: 'mike_and_max',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      verified: false
    }
  }
];

const FeaturedPosts = () => {
  const handleLike = (postId: string) => {
    console.log('Featured post liked:', postId);
  };

  const handleComment = (postId: string) => {
    console.log('Featured post comment:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Featured post shared:', postId);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {featuredPosts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      ))}
    </div>
  );
};

export default FeaturedPosts;