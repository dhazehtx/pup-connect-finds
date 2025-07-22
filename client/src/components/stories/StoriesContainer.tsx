
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
}

const StoriesContainer = () => {
  const { user } = useAuth();
  const [stories] = useState<Story[]>([
    {
      id: '1',
      user_id: 'user1',
      username: 'goldenretriever_mom',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616c66a92a8?w=50&h=50&fit=crop&crop=face',
      media_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=700&fit=crop',
      media_type: 'image',
      caption: 'Beautiful day at the park! 🐕',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      user_id: 'user2',
      username: 'beagle_adventures',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      media_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=700&fit=crop',
      media_type: 'image',
      caption: 'Playtime with my best friend!',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const handleCreateStory = () => {
    // This would open a story creation modal
    console.log('Create story clicked');
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 p-4 overflow-x-auto">
        {/* Add Story Button - Circular with royal blue styling */}
        {user && (
          <div className="flex-shrink-0 text-center">
            <button
              onClick={handleCreateStory}
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center border-2 border-blue-200 shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-6 h-6" />
            </button>
            <p className="text-xs text-blue-600 mt-1 font-medium">Add Story</p>
          </div>
        )}

        {/* Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={story.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616c66a92a8?w=50&h=50&fit=crop&crop=face'}
                    alt={story.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              {story.media_type === 'video' && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-2 h-2 text-white fill-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1 max-w-16 truncate">
              {story.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesContainer;
