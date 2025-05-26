
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for paw prints
  const frames = [
    { activePaw: 0 },
    { activePaw: 1 },
    { activePaw: 2 },
    { activePaw: 3 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];

  // Paw print positions in a walking pattern
  const pawPositions = [
    { x: 30, y: 60, rotation: 15 },   // Back left
    { x: 50, y: 40, rotation: -10 },  // Front left
    { x: 70, y: 60, rotation: -15 },  // Back right
    { x: 50, y: 70, rotation: 10 },   // Front right
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-primary"
      >
        {pawPositions.map((paw, index) => (
          <g 
            key={index}
            transform={`translate(${paw.x}, ${paw.y}) rotate(${paw.rotation})`}
            opacity={currentFrameData.activePaw === index ? 1 : 0.3}
            className="transition-opacity duration-200"
          >
            {/* Main paw pad */}
            <ellipse 
              cx="0" 
              cy="0" 
              rx="8" 
              ry="6" 
              fill="currentColor"
            />
            
            {/* Toe pads */}
            <circle cx="-6" cy="-8" r="3" fill="currentColor" />
            <circle cx="0" cy="-10" r="3" fill="currentColor" />
            <circle cx="6" cy="-8" r="3" fill="currentColor" />
            <circle cx="0" cy="-5" r="2" fill="currentColor" />
          </g>
        ))}
        
        {/* Optional: Add a subtle trail effect */}
        <defs>
          <radialGradient id="pawGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Glow effect around active paw */}
        {pawPositions.map((paw, index) => (
          currentFrameData.activePaw === index && (
            <circle
              key={`glow-${index}`}
              cx={paw.x}
              cy={paw.y}
              r="15"
              fill="url(#pawGlow)"
              className="animate-pulse"
            />
          )
        ))}
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
