
import React, { useState } from 'react';
import { ArrowLeft, Camera, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SocialPostCreator from '@/components/posts/SocialPostCreator';
import { useAuth } from '@/contexts/AuthContext';

const Post = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 flex items-center justify-between bg-white border-b">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Create Social Post</h1>
          <div></div>
        </div>
        
        <div className="p-4">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">Please sign in to create social posts.</p>
              <Button 
                onClick={() => navigate('/auth')} 
                className="mt-4"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      <div className="p-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Create Social Post</h1>
        <div></div>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Share Your Story
            </CardTitle>
            <p className="text-sm text-gray-600">
              Create posts that will appear on your profile and in your followers' feeds
            </p>
          </CardHeader>
          <CardContent>
            <SocialPostCreator />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Photo Post</h3>
              <p className="text-sm text-gray-600">Share a photo with caption</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Video Post</h3>
              <p className="text-sm text-gray-600">Share a video moment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Post;
