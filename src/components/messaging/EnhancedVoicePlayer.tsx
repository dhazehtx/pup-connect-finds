
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Download, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedVoicePlayerProps {
  audioUrl: string;
  duration: number;
  timestamp: string;
  isOwn?: boolean;
  onDownload?: () => void;
}

const EnhancedVoicePlayer = ({ 
  audioUrl, 
  duration, 
  timestamp, 
  isOwn = false,
  onDownload 
}: EnhancedVoicePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateWaveform();
  }, [audioUrl]);

  const generateWaveform = async () => {
    // Mock waveform data - in production, you'd analyze the actual audio
    const mockData = Array.from({ length: 50 }, () => Math.random() * 100);
    setWaveformData(mockData);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((value, index) => {
      const barHeight = (value / 100) * height;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = index / waveformData.length <= progress 
        ? (isOwn ? '#3b82f6' : '#10b981') 
        : '#e5e7eb';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  };

  useEffect(() => {
    drawWaveform();
  }, [currentTime, waveformData, isOwn]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `voice-message-${Date.now()}.webm`;
      link.click();
    }
  };

  return (
    <Card className={`max-w-xs ${isOwn ? 'ml-auto' : ''}`}>
      <CardContent className="p-3">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />

        <div className="space-y-3">
          {/* Waveform */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={280}
              height={40}
              className="w-full h-10 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const progress = (x / rect.width) * 100;
                handleSeek([progress]);
              }}
            />
          </div>

          {/* Progress Slider */}
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="w-full"
          />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="rounded-full w-8 h-8 p-0"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>

              <span className="text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={changePlaybackRate}
                className="text-xs h-6 px-2"
              >
                {playbackRate}x
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="rounded-full w-6 h-6 p-0"
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="rounded-full w-6 h-6 p-0"
              >
                <Download size={12} />
              </Button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <VolumeX size={12} className="text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 size={12} className="text-muted-foreground" />
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground text-right">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedVoicePlayer;
