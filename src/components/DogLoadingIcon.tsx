
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for bones
  const frames = [
    { activeBone: 0 },
    { activeBone: 1 },
    { activeBone: 2 },
    { activeBone: 3 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];

  // Bone positions in a scattered pattern
  const bonePositions = [
    { x: 20, y: 30, rotation: 45 },   // Top left
    { x: 70, y: 25, rotation: -30 },  // Top right
    { x: 25, y: 70, rotation: -15 },  // Bottom left
    { x: 75, y: 65, rotation: 60 },   // Bottom right
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-black"
      >
        {bonePositions.map((bone, index) => (
          <g 
            key={index}
            transform={`translate(${bone.x}, ${bone.y}) rotate(${bone.rotation})`}
            opacity={currentFrameData.activeBone === index ? 1 : 0.3}
            className="transition-opacity duration-200"
          >
            {/* Bone shape */}
            <g fill="currentColor">
              {/* Main bone shaft */}
              <rect x="-12" y="-2" width="24" height="4" rx="2" />
              
              {/* Left bone end */}
              <circle cx="-12" cy="-3" r="4" />
              <circle cx="-12" cy="3" r="4" />
              
              {/* Right bone end */}
              <circle cx="12" cy="-3" r="4" />
              <circle cx="12" cy="3" r="4" />
            </g>
          </g>
        ))}
        
        {/* Optional: Add a subtle glow effect */}
        <defs>
          <radialGradient id="boneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Glow effect around active bone */}
        {bonePositions.map((bone, index) => (
          currentFrameData.activeBone === index && (
            <circle
              key={`glow-${index}`}
              cx={bone.x}
              cy={bone.y}
              r="20"
              fill="url(#boneGlow)"
              className="animate-pulse"
            />
          )
        ))}
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
