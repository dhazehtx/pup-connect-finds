import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  MoreHorizontal 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface VideoPostProps {
  post: {
    id: string;
    user_id: string;
    video_url: string;
    caption?: string;
    hashtags?: string[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    views_count: number;
    duration?: number;
    created_at: string;
    profiles?: {
      full_name: string;
      username: string;
      avatar_url?: string;
      verified?: boolean;
    };
  };
  isVisible: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const VideoPost: React.FC<VideoPostProps> = ({
  post,
  isVisible,
  onLike,
  onComment,
  onShare
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  // Auto-play when visible
  useEffect(() => {
    if (!videoRef.current) return;

    if (isVisible) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVisible]);

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    setIsLiked(prev => !prev);
    onLike(post.id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseHashtags = (text: string) => {
    return text.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-400 font-medium">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlayPause}
      >
        <source src={post.video_url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20"
          onClick={togglePlayPause}
        >
          <Play className="w-16 h-16 text-white" />
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            Reels
          </Badge>
          {post.duration && (
            <Badge variant="secondary" className="bg-black/50 text-white">
              {formatDuration(post.duration)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User info and caption overlay */}
      <div className="absolute bottom-20 left-4 right-20 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>
              {post.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                @{post.profiles?.username || 'user'}
              </span>
              {post.profiles?.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <span className="text-xs text-white/70">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Caption and hashtags */}
        {post.caption && (
          <p className="text-sm mb-2 leading-relaxed">
            {parseHashtags(post.caption)}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-white/70">
          <span>{post.views_count} views</span>
          <span>{post.likes_count} likes</span>
          <span>{post.comments_count} comments</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`bg-black/50 hover:bg-black/70 p-3 ${
            isLiked ? 'text-red-500' : 'text-white'
          }`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        <div className="text-center">
          <span className="text-xs text-white block">{post.likes_count}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComment(post.id)}
          className="bg-black/50 text-white hover:bg-black/70 p-3"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <span className="text-xs text-white block">{post.comments_count}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(post.id)}
          className="bg-black/50 text-white hover:bg-black/70 p-3"
        >
          <Share className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <span className="text-xs text-white block">{post.shares_count}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPost;