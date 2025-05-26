
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

  // Circular positions for rotating paws (4 paws at diagonal compass positions)
  const circularPawPositions = [
    { x: 65, y: 35, angle: 45 },   // Northeast
    { x: 65, y: 65, angle: 135 },  // Southeast
    { x: 35, y: 65, angle: 225 },  // Southwest
    { x: 35, y: 35, angle: 315 },  // Northwest
  ];

  const PawPrint = ({ x, y, scale = 1, opacity = 1, rotation = 0 }: { x: number; y: number; scale?: number; opacity?: number; rotation?: number }) => (
    <g 
      transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`} 
      opacity={opacity}
      style={{
        transformOrigin: '0 0',
        transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out'
      }}
    >
      {/* Main paw pad - increased size */}
      <ellipse 
        cx="0" 
        cy="0" 
        rx="6" 
        ry="4.5" 
        fill="currentColor"
      />
      
      {/* Four toe pads - increased size */}
      <circle cx="-4.5" cy="-6" r="2.2" fill="currentColor" />
      <circle cx="-1.5" cy="-7.5" r="2.2" fill="currentColor" />
      <circle cx="1.5" cy="-7.5" r="2.2" fill="currentColor" />
      <circle cx="4.5" cy="-6" r="2.2" fill="currentColor" />
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
        {/* Rotating paws around the circle with disappearing/reappearing effect */}
        {circularPawPositions.map((paw, index) => (
          <PawPrint
            key={index}
            x={paw.x}
            y={paw.y}
            scale={1.2}
            opacity={currentFrameData.activePaw === index ? 1 : 0}
            rotation={paw.angle + (currentFrame * 15)} // Curved rotation effect
          />
        ))}
        
        {/* Central pulsating paw - increased size */}
        <g className="animate-pulse">
          <PawPrint
            x={50}
            y={50}
            scale={1.8}
            opacity={1}
          />
        </g>
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
