
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Home = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const posts = [
    {
      id: 1,
      user: {
        name: "Golden Paws Kennel",
        username: "goldenpaws_official",
        avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop&crop=face",
        verified: true
      },
      image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop",
      likes: 234,
      caption: "Meet Luna! 🐕 This adorable 8-week-old Golden Retriever is looking for her forever home. She loves cuddles and playing fetch! #GoldenRetriever #PuppyLove #AdoptDontShop",
      timeAgo: "2h",
      location: "San Francisco, CA"
    },
    {
      id: 2,
      user: {
        name: "Noble German Shepherds",
        username: "noble_shepherds",
        avatar: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&h=100&fit=crop&crop=face",
        verified: true
      },
      image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600&h=600&fit=crop",
      likes: 189,
      caption: "Training session with Max! 🎾 Our German Shepherds are not only beautiful but incredibly intelligent. This 10-week-old pup is already showing amazing potential! #GermanShepherd #Training #SmartPups",
      timeAgo: "4h",
      location: "Austin, TX"
    },
    {
      id: 3,
      user: {
        name: "Labrador Love",
        username: "lab_love_kennel",
        avatar: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop&crop=face",
        verified: false
      },
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=600&fit=crop",
      likes: 156,
      caption: "Sleepy Sunday vibes 😴 This little chocolate Lab knows how to relax! Available for adoption next week. #LabradorRetriever #SundayVibes #ChocolateLab",
      timeAgo: "6h",
      location: "Denver, CO"
    },
    {
      id: 4,
      user: {
        name: "Poodle Paradise",
        username: "poodle_paradise",
        avatar: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face",
        verified: true
      },
      image: "https://images.unsplash.com/photo-1616190264687-b7ebf7fd683d?w=600&h=600&fit=crop",
      likes: 298,
      caption: "Fluffy Friday! ☁️ Our Standard Poodle puppies are ready for their new families. Hypoallergenic and incredibly loving! #Poodle #FluffyFriday #HypoallergenicDogs",
      timeAgo: "8h",
      location: "Seattle, WA"
    }
  ];

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Feed */}
      <div className="space-y-0">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border-b border-gray-100">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.user.avatar} alt={post.user.name} />
                  <AvatarFallback>{post.user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-sm text-gray-900">{post.user.username}</h3>
                    {post.user.verified && (
                      <span className="text-blue-500 text-sm">✓</span>
                    )}
                  </div>
                  {post.location && (
                    <p className="text-xs text-gray-500">{post.location}</p>
                  )}
                </div>
              </div>
              <button className="p-2">
                <MoreHorizontal size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Post Image */}
            <div className="relative">
              <img 
                src={post.image} 
                alt="Post content"
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className="transition-colors"
                  >
                    <Heart 
                      size={24} 
                      className={likedPosts.has(post.id) ? "text-red-500 fill-current" : "text-gray-700"} 
                    />
                  </button>
                  <button>
                    <MessageCircle size={24} className="text-gray-700" />
                  </button>
                  <button>
                    <Share size={24} className="text-gray-700" />
                  </button>
                </div>
                <button>
                  <Bookmark size={24} className="text-gray-700" />
                </button>
              </div>

              {/* Likes */}
              <div>
                <p className="font-semibold text-sm text-gray-900">
                  {post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes
                </p>
              </div>

              {/* Caption */}
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{post.user.username}</span>{' '}
                  {post.caption}
                </p>
                <p className="text-xs text-gray-500 mt-1">{post.timeAgo}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
