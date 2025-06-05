
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostHeaderProps {
  isOwnPost: boolean;
  onPrivacySettingsClick: () => void;
}

const PostHeader = ({ isOwnPost, onPrivacySettingsClick }: PostHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={20} />
      </Button>
      <h1 className="font-medium">Post</h1>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => isOwnPost && onPrivacySettingsClick()}
      >
        {isOwnPost ? <Settings size={20} /> : <MoreHorizontal size={20} />}
      </Button>
    </div>
  );
};

export default PostHeader;
