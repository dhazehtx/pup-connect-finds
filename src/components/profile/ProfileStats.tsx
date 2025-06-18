
import React from 'react';

interface ProfileStatsProps {
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const ProfileStats = ({ stats, onFollowersClick, onFollowingClick }: ProfileStatsProps) => {
  return (
    <div className="flex items-center justify-center space-x-8 py-6 mb-4">
      <div className="text-center">
        <div className="font-bold text-xl text-gray-900">{stats.posts}</div>
        <div className="text-sm text-gray-600 mt-1">Posts</div>
      </div>
      <div 
        className="text-center cursor-pointer hover:opacity-75 transition-opacity"
        onClick={onFollowersClick}
      >
        <div className="font-bold text-xl text-gray-900">{stats.followers.toLocaleString()}</div>
        <div className="text-sm text-gray-600 mt-1">Followers</div>
      </div>
      <div 
        className="text-center cursor-pointer hover:opacity-75 transition-opacity"
        onClick={onFollowingClick}
      >
        <div className="font-bold text-xl text-gray-900">{stats.following}</div>
        <div className="text-sm text-gray-600 mt-1">Following</div>
      </div>
    </div>
  );
};

export default ProfileStats;
