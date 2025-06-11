
import React, { useRef, useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

const WaveformVisualizer = ({ 
  audioUrl, 
  isPlaying, 
  currentTime, 
  duration, 
  onSeek,
  className = ""
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (audioUrl) {
      generateWaveformData();
    }
  }, [audioUrl]);

  const generateWaveformData = async () => {
    try {
      setIsLoading(true);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const samples = 60; // Number of bars in waveform
      const blockSize = Math.floor(channelData.length / samples);
      const waveform: number[] = [];

      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }

      // Normalize the waveform data
      const maxValue = Math.max(...waveform);
      const normalizedWaveform = waveform.map(value => value / maxValue);
      
      setWaveformData(normalizedWaveform);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating waveform:', error);
      // Fallback to dummy waveform data
      const dummyWaveform = Array.from({ length: 60 }, () => Math.random() * 0.8 + 0.2);
      setWaveformData(dummyWaveform);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    drawWaveform();
  }, [waveformData, currentTime, duration, isPlaying]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Color bars based on progress
      const barProgress = index / waveformData.length;
      ctx.fillStyle = barProgress <= progress ? '#3b82f6' : '#e5e7eb';
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const progress = x / canvas.width;
    const seekTime = progress * duration;
    
    onSeek(seekTime);
  };

  if (isLoading) {
    return (
      <div className={`h-12 bg-muted animate-pulse rounded ${className}`} />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={48}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={handleCanvasClick}
      style={{ width: '100%', height: '48px' }}
    />
  );
};

export default WaveformVisualizer;
