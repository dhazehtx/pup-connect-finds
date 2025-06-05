
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PostCaptionProps {
  username: string;
  caption: string;
  onProfileClick: (userId: string) => void;
  userId: string;
}

const PostCaption = ({ username, caption, onProfileClick, userId }: PostCaptionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/?search=${encodeURIComponent(hashtag)}`);
    toast({
      title: "Hashtag Search",
      description: `Searching for posts with ${hashtag}`,
    });
  };

  const renderCaptionWithHashtags = (caption: string) => {
    const parts = caption.split(/(#\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
            onClick={() => handleHashtagClick(part)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="mb-3">
      <span 
        className="font-medium text-sm mr-2 cursor-pointer hover:underline"
        onClick={() => onProfileClick(userId)}
      >
        {username}
      </span>
      <span className="text-sm">{renderCaptionWithHashtags(caption)}</span>
    </div>
  );
};

export default PostCaption;
