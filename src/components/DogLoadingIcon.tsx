
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
    }, 300); // Slowed down from 150ms to 300ms

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];

  // Circular positions for rotating paws with adjusted angles for curved symmetry
  const circularPawPositions = [
    { x: 65, y: 35, angle: 30 },   // Northeast - adjusted for symmetry
    { x: 65, y: 65, angle: 150 },  // Southeast - adjusted for symmetry
    { x: 35, y: 65, angle: 210 },  // Southwest - adjusted for symmetry
    { x: 35, y: 35, angle: 330 },  // Northwest - adjusted for symmetry
  ];

  const PawPrint = ({ x, y, scale = 1, opacity = 1, rotation = 0 }: { x: number; y: number; scale?: number; opacity?: number; rotation?: number }) => (
    <g 
      transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`} 
      opacity={opacity}
      style={{
        transformOrigin: '0 0',
        transition: 'opacity 0.15s ease-in-out, transform 0.15s ease-in-out'
      }}
    >
      {/* Main paw pad - same size for all paws */}
      <ellipse 
        cx="0" 
        cy="0" 
        rx="6" 
        ry="4.5" 
        fill="currentColor"
      />
      
      {/* Four toe pads - same size for all paws */}
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
        {/* Rotating paws with tracer effect and following motion */}
        {circularPawPositions.map((paw, index) => {
          const isActive = currentFrameData.activePaw === index;
          const isPrevious = currentFrameData.activePaw === (index + 3) % 4;
          const isPrevious2 = currentFrameData.activePaw === (index + 2) % 4;
          
          let opacity = 0;
          if (isActive) opacity = 1;
          else if (isPrevious) opacity = 0.4;
          else if (isPrevious2) opacity = 0.15;
          
          // Each paw rotates towards the next paw position, creating a following effect
          const followingRotation = paw.angle + (currentFrame * 90); // Each step rotates 90 degrees to follow
          
          return (
            <PawPrint
              key={index}
              x={paw.x}
              y={paw.y}
              scale={1.2}
              opacity={opacity}
              rotation={followingRotation}
            />
          );
        })}
        
        {/* Central paw - same size as rotating paws */}
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
