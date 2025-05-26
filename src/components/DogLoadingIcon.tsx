
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for rotating paws (now 4 paws)
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

  // Circular positions for rotating paws (4 paws at 90-degree intervals)
  const circularPawPositions = [
    { x: 50, y: 25, angle: 0 },    // Top (0°)
    { x: 75, y: 50, angle: 90 },   // Right (90°)
    { x: 50, y: 75, angle: 180 },  // Bottom (180°)
    { x: 25, y: 50, angle: 270 },  // Left (270°)
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
            scale={1}
            opacity={currentFrameData.activePaw === index ? 1 : 0.3}
          />
        ))}
        
        {/* Central pulsating paw */}
        <g className="animate-pulse">
          <PawPrint
            x={50}
            y={50}
            scale={1.3}
            opacity={1}
          />
        </g>
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
