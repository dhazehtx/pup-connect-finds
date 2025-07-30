import React from 'react';
import { useLocation } from 'wouter';

interface HashtagParserProps {
  text: string;
  className?: string;
  onHashtagClick?: (hashtag: string) => void;
}

export const HashtagParser: React.FC<HashtagParserProps> = ({
  text,
  className = '',
  onHashtagClick
}) => {
  const [, setLocation] = useLocation();

  const handleHashtagClick = (hashtag: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    } else {
      // Navigate to filtered feed page
      setLocation(`/explore?tag=${encodeURIComponent(hashtag)}`);
    }
  };

  const parseTextWithHashtags = (inputText: string) => {
    // Split text by hashtags while preserving whitespace
    const parts = inputText.split(/(#[\w]+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const hashtag = part.substring(1); // Remove the # symbol
        return (
          <span
            key={index}
            onClick={() => handleHashtagClick(hashtag)}
            className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <span className={className}>
      {parseTextWithHashtags(text)}
    </span>
  );
};

export default HashtagParser;