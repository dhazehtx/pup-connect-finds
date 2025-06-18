
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
    <div className="flex justify-around py-4 mb-4">
      <div className="text-center px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm min-w-[80px]">
        <div className="font-bold text-xl text-gray-800">{stats.posts}</div>
        <div className="text-sm text-gray-600 font-medium">Posts</div>
      </div>
      <div 
        className="text-center px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm min-w-[80px] cursor-pointer hover:opacity-75 transition-all duration-300 transform hover:scale-105"
        onClick={onFollowersClick}
      >
        <div className="font-bold text-xl text-gray-800">{stats.followers.toLocaleString()}</div>
        <div className="text-sm text-gray-600 font-medium">Followers</div>
      </div>
      <div 
        className="text-center px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm min-w-[80px] cursor-pointer hover:opacity-75 transition-all duration-300 transform hover:scale-105"
        onClick={onFollowingClick}
      >
        <div className="font-bold text-xl text-gray-800">{stats.following}</div>
        <div className="text-sm text-gray-600 font-medium">Following</div>
      </div>
    </div>
  );
};

export default ProfileStats;
