
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Star, Users, Heart, MessageCircle, Phone, MoreHorizontal } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock profile data
  const profile = {
    id: userId,
    name: "Golden Paws Kennel",
    location: "San Francisco, CA",
    bio: "Specializing in Golden Retrievers and Labradors for over 15 years. All our puppies are health tested and come with health guarantees.",
    avatar: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=300&fit=crop",
    verified: true,
    followers: 1248,
    following: 342,
    posts: 47,
    rating: 4.9,
    reviews: 127,
    joined: "March 2020"
  };

  const posts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
      caption: "New litter of Golden Retriever puppies! 🐕",
      likes: 124,
      comments: 18,
      time: "2 days ago"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
      caption: "Beautiful Labrador puppies ready for their forever homes ❤️",
      likes: 89,
      comments: 12,
      time: "1 week ago"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
      caption: "Puppy training session with our 10-week-old Goldens",
      likes: 156,
      comments: 24,
      time: "2 weeks ago"
    }
  ];

  const tabs = [
    { id: 'posts', label: 'Posts', count: profile.posts },
    { id: 'reviews', label: 'Reviews', count: profile.reviews },
    { id: 'about', label: 'About', count: null }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Cover Image */}
      <div className="relative mb-6">
        <img
          src={profile.coverImage}
          alt="Cover"
          className="w-full h-48 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
      </div>

      {/* Profile Header */}
      <div className="relative -mt-20 mb-6">
        <div className="flex items-end gap-6">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
          />
          <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {profile.name}
                  {profile.verified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </h1>
                <div className="flex items-center gap-1 text-gray-600 mt-1">
                  <MapPin size={16} />
                  {profile.location}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Star size={16} className="text-amber-500 fill-current" />
                  <span className="font-medium">{profile.rating}</span>
                  <span className="text-gray-500">({profile.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Phone size={18} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MessageCircle size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-xl p-6 border border-amber-100 mb-6">
        <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        <p className="text-sm text-gray-500 mt-3">Joined {profile.joined}</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-6 border border-amber-100 mb-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{profile.posts}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{profile.followers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{profile.following}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div key={post.id} className="space-y-3">
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-700">{post.caption}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart size={14} />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        {post.comments}
                      </span>
                    </div>
                    <span>{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="text-center text-gray-500">
                Reviews section coming soon
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="text-center text-gray-500">
                About section coming soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
