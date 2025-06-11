
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  timestamp: string;
  isOwn?: boolean;
}

const VoiceMessagePlayer = ({ audioUrl, duration, timestamp, isOwn = false }: VoiceMessagePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-message-${Date.now()}.webm`;
    link.click();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg max-w-xs ${
      isOwn ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
    }`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        className="rounded-full w-8 h-8 p-0"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1 bg-muted-foreground/20 rounded-full flex-1 overflow-hidden">
            <div 
              className="h-full bg-current transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs opacity-70">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="text-xs opacity-70">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="rounded-full w-6 h-6 p-0"
      >
        <Download size={12} />
      </Button>
    </div>
  );
};

export default VoiceMessagePlayer;
