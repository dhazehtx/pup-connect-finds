import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ModernPostCreator from '@/components/home/ModernPostCreator';
import { useAuth } from '@/contexts/AuthContext';

const Post = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Create Social Post</h1>
          <div className="w-6" />
        </div>
        <div className="p-4 text-center">
          <p className="text-gray-600">Please sign in to create social posts.</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ModernPostCreator
      onClose={() => navigate(-1)}
      onPostCreated={() => navigate('/profile')}
    />
  );
};

export default Post;
