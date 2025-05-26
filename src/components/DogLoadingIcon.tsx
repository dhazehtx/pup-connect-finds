
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for rotating paws
  const frames = [
    { activePaw: 0 },
    { activePaw: 1 },
    { activePaw: 2 },
    { activePaw: 3 },
    { activePaw: 4 },
    { activePaw: 5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];

  // Circular positions for rotating paws (6 paws around the circle)
  const circularPawPositions = [
    { x: 50, y: 20, angle: 0 },    // Top
    { x: 70, y: 30, angle: 60 },   // Top right
    { x: 70, y: 70, angle: 120 },  // Bottom right
    { x: 50, y: 80, angle: 180 },  // Bottom
    { x: 30, y: 70, angle: 240 },  // Bottom left
    { x: 30, y: 30, angle: 300 },  // Top left
  ];

  const PawPrint = ({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) => (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      {/* Main paw pad */}
      <ellipse 
        cx="0" 
        cy="0" 
        rx="4" 
        ry="3" 
        fill="currentColor"
      />
      
      {/* Four toe pads */}
      <circle cx="-3" cy="-4" r="1.5" fill="currentColor" />
      <circle cx="-1" cy="-5" r="1.5" fill="currentColor" />
      <circle cx="1" cy="-5" r="1.5" fill="currentColor" />
      <circle cx="3" cy="-4" r="1.5" fill="currentColor" />
    </g>
  );

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-black"
      >
        {/* Rotating paws around the circle */}
        {circularPawPositions.map((paw, index) => (
          <PawPrint
            key={index}
            x={paw.x}
            y={paw.y}
            scale={0.8}
            opacity={currentFrameData.activePaw === index ? 1 : 0.3}
          />
        ))}
        
        {/* Central pulsating paw */}
        <g className="animate-pulse">
          <PawPrint
            x={50}
            y={50}
            scale={1.2}
            opacity={1}
          />
        </g>
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
