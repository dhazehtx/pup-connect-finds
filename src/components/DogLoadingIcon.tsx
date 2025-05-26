
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Walking pattern animation frames - alternating paws like a real dog walk
  const frames = [
    { activePaws: [0, 3], scale: [1.2, 1, 1, 1.2], opacity: [1, 0.3, 0.3, 1] },     // Front left + Back right
    { activePaws: [0, 1, 3], scale: [1.1, 1.1, 1, 1.1], opacity: [0.8, 0.8, 0.3, 0.8] }, // Transition
    { activePaws: [1, 2], scale: [1, 1.2, 1.2, 1], opacity: [0.3, 1, 1, 0.3] },     // Front right + Back left
    { activePaws: [1, 2, 3], scale: [1, 1.1, 1.1, 1.1], opacity: [0.3, 0.8, 0.8, 0.8] }, // Transition
    { activePaws: [0, 3], scale: [1.2, 1, 1, 1.2], opacity: [1, 0.3, 0.3, 1] },     // Back to start
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 400); // Slower, more natural walking rhythm

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];
  
  // Paw positions - arranged like a dog's feet
  const pawPositions = [
    { x: 35, y: 35, label: "front-left" },   // Front left
    { x: 65, y: 35, label: "front-right" },  // Front right  
    { x: 35, y: 65, label: "back-left" },    // Back left
    { x: 65, y: 65, label: "back-right" },   // Back right
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-red-500"
      >
        {pawPositions.map((paw, index) => {
          const isActive = currentFrameData.activePaws.includes(index);
          const scale = currentFrameData.scale[index];
          const opacity = currentFrameData.opacity[index];
          
          return (
            <g key={index}>
              {/* Paw pad (main part) - made bigger */}
              <ellipse
                cx={paw.x}
                cy={paw.y}
                rx="8"
                ry="10"
                fill="currentColor"
                opacity={opacity}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${paw.x}px ${paw.y}px` }}
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Paw toes - made bigger and more defined */}
              <ellipse
                cx={paw.x - 4}
                cy={paw.y - 8}
                rx="2.5"
                ry="4"
                fill="currentColor"
                opacity={opacity * 0.9}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${paw.x}px ${paw.y}px` }}
                className="transition-all duration-300 ease-in-out"
              />
              <ellipse
                cx={paw.x}
                cy={paw.y - 9}
                rx="2.5"
                ry="4"
                fill="currentColor"
                opacity={opacity * 0.9}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${paw.x}px ${paw.y}px` }}
                className="transition-all duration-300 ease-in-out"
              />
              <ellipse
                cx={paw.x + 4}
                cy={paw.y - 8}
                rx="2.5"
                ry="4"
                fill="currentColor"
                opacity={opacity * 0.9}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${paw.x}px ${paw.y}px` }}
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Ripple effect for active paws */}
              {isActive && (
                <circle
                  cx={paw.x}
                  cy={paw.y}
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.4"
                  className="animate-ping"
                />
              )}
            </g>
          );
        })}
        
        {/* Central connecting element - subtle body indicator */}
        <ellipse
          cx="50"
          cy="50"
          rx="12"
          ry="8"
          fill="currentColor"
          opacity="0.1"
          className="transition-opacity duration-500"
        />
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
