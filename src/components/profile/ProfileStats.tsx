
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
    <div className="flex justify-around py-4 border-y border-border/40">
      <div className="text-center">
        <div className="font-semibold text-lg text-foreground">{stats.posts}</div>
        <div className="text-sm text-muted-foreground">Posts</div>
      </div>
      <div 
        className="text-center cursor-pointer hover:opacity-75 transition-opacity"
        onClick={onFollowersClick}
      >
        <div className="font-semibold text-lg text-foreground">{stats.followers.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Followers</div>
      </div>
      <div 
        className="text-center cursor-pointer hover:opacity-75 transition-opacity"
        onClick={onFollowingClick}
      >
        <div className="font-semibold text-lg text-foreground">{stats.following}</div>
        <div className="text-sm text-muted-foreground">Following</div>
      </div>
    </div>
  );
};

export default ProfileStats;
