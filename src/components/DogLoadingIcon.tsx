
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
        className="text-black"
      >
        {pawPositions.map((paw, index) => (
          <g 
            key={index}
            transform={`translate(${paw.x}, ${paw.y}) rotate(${paw.rotation})`}
            opacity={currentFrameData.activePaw === index ? 1 : 0.3}
            className="transition-opacity duration-200"
          >
            {/* Main paw pad - larger and more oval like iPhone emoji */}
            <ellipse 
              cx="0" 
              cy="2" 
              rx="7" 
              ry="9" 
              fill="currentColor"
            />
            
            {/* Four toe pads arranged like iPhone paw emoji */}
            <circle cx="-5" cy="-7" r="2.5" fill="currentColor" />
            <circle cx="-1.5" cy="-9" r="2.5" fill="currentColor" />
            <circle cx="1.5" cy="-9" r="2.5" fill="currentColor" />
            <circle cx="5" cy="-7" r="2.5" fill="currentColor" />
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
