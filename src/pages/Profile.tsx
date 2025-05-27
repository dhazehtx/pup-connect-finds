
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Settings, Grid, Heart } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');

  const profile = {
    id: userId,
    name: "Golden Paws Kennel",
    username: "@goldenpaws",
    location: "San Francisco, CA",
    bio: "Specializing in Golden Retrievers and Labradors for over 15 years. All our puppies are health tested and come with health guarantees.",
    avatar: "https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face",
    followers: 1248,
    following: 342,
    posts: 47,
    verified: true
  };

  const posts = [
    "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop"
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium">{profile.username}</h1>
          <Settings size={24} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex gap-6 text-center">
              <div>
                <div className="font-semibold">{profile.posts}</div>
                <div className="text-gray-600 text-sm">Posts</div>
              </div>
              <div>
                <div className="font-semibold">{profile.followers.toLocaleString()}</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </div>
              <div>
                <div className="font-semibold">{profile.following}</div>
                <div className="text-gray-600 text-sm">Following</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-sm">{profile.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <MapPin size={12} />
            {profile.location}
          </div>
        </div>

        <button className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium mb-4">
          Edit Profile
        </button>

        <div className="border-t border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-3 flex items-center justify-center gap-1 ${
                activeTab === 'posts' ? 'border-t-2 border-black' : ''
              }`}
            >
              <Grid size={16} />
              <span className="text-xs font-medium">POSTS</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 flex items-center justify-center gap-1 ${
                activeTab === 'saved' ? 'border-t-2 border-black' : ''
              }`}
            >
              <Heart size={16} />
              <span className="text-xs font-medium">SAVED</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1">
        {posts.map((post, index) => (
          <div key={index} className="aspect-square">
            <img
              src={post}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
