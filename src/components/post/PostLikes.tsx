
import React from 'react';

interface PostLikesProps {
  likesCount: number;
  showLikes: boolean;
  onLikesClick: () => void;
}

const PostLikes = ({ likesCount, showLikes, onLikesClick }: PostLikesProps) => {
  if (!showLikes) {
    return (
      <p className="font-medium text-sm mb-2">
        Likes hidden
      </p>
    );
  }

  return (
    <p 
      className="font-medium text-sm mb-2 cursor-pointer hover:underline"
      onClick={onLikesClick}
    >
      {likesCount.toLocaleString()} likes
    </p>
  );
};

export default PostLikes;
