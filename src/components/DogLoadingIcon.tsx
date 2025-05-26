
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Sequential loading pattern - one paw at a time
  const frames = [
    { visiblePaws: [0], opacity: [1, 0.2, 0.2, 0.2] },        // Front left
    { visiblePaws: [0, 1], opacity: [0.6, 1, 0.2, 0.2] },     // Front left + Front right
    { visiblePaws: [0, 1, 2], opacity: [0.4, 0.6, 1, 0.2] },  // Front left + Front right + Back left
    { visiblePaws: [0, 1, 2, 3], opacity: [0.3, 0.4, 0.6, 1] }, // All paws
    { visiblePaws: [1, 2, 3], opacity: [0.2, 0.6, 0.8, 1] },  // Fade out front left
    { visiblePaws: [2, 3], opacity: [0.2, 0.2, 1, 0.8] },     // Fade out front right
    { visiblePaws: [3], opacity: [0.2, 0.2, 0.2, 1] },        // Only back right
    { visiblePaws: [], opacity: [0.2, 0.2, 0.2, 0.4] },       // All fading
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 500); // Slower timing for loading effect

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
          const isVisible = currentFrameData.visiblePaws.includes(index);
          const opacity = currentFrameData.opacity[index];
          
          return (
            <g key={index}>
              {/* Paw pad (main part) */}
              <ellipse
                cx={paw.x}
                cy={paw.y}
                rx="8"
                ry="10"
                fill="currentColor"
                opacity={opacity}
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Paw toes */}
              <ellipse
                cx={paw.x - 4}
                cy={paw.y - 8}
                rx="2.5"
                ry="4"
                fill="currentColor"
                opacity={opacity * 0.9}
                className="transition-all duration-300 ease-in-out"
              />
              <ellipse
                cx={paw.x}
                cy={paw.y - 9}
                rx="2.5"
                ry="4"
                fill="currentColor"
                opacity={opacity * 0.9}
                className="transition-all duration-300 ease-in-out"
              />
              <ellipse
                cx={paw.x + 4}
                cy={paw.y - 8}
                rx="2.5"
                ry="4"
                fill="currentColor"
                opacity={opacity * 0.9}
                className="transition-all duration-300 ease-in-out"
              />
              
              {/* Loading dot effect for visible paws */}
              {isVisible && (
                <circle
                  cx={paw.x}
                  cy={paw.y}
                  r="2"
                  fill="currentColor"
                  opacity="0.8"
                  className="animate-pulse"
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
