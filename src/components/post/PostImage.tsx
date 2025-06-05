
import React from 'react';

interface PostImageProps {
  src: string;
  alt: string;
}

const PostImage = ({ src, alt }: PostImageProps) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full aspect-square object-cover"
    />
  );
};

export default PostImage;
