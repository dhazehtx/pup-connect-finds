
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for the dog
  const frames = [
    { tailRotation: 0, earRotation: 0, tongueVisible: false },
    { tailRotation: 15, earRotation: -8, tongueVisible: false },
    { tailRotation: 30, earRotation: 8, tongueVisible: true },
    { tailRotation: 15, earRotation: -3, tongueVisible: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-primary"
      >
        {/* Dog Body - slightly larger for Golden Retriever */}
        <ellipse 
          cx="50" 
          cy="65" 
          rx="28" 
          ry="16" 
          fill="currentColor" 
          opacity="0.8"
        />
        
        {/* Dog Head - rounder for Golden Retriever */}
        <circle 
          cx="50" 
          cy="40" 
          r="20" 
          fill="currentColor"
        />
        
        {/* Dog Snout - longer for Golden Retriever */}
        <ellipse 
          cx="50" 
          cy="50" 
          rx="10" 
          ry="8" 
          fill="currentColor" 
          opacity="0.9"
        />
        
        {/* Left Ear - longer and floppier for Golden Retriever */}
        <ellipse 
          cx="38" 
          cy="32" 
          rx="8" 
          ry="16" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${-20 + currentFrameData.earRotation} 38 32)`}
        />
        
        {/* Right Ear - longer and floppier for Golden Retriever */}
        <ellipse 
          cx="62" 
          cy="32" 
          rx="8" 
          ry="16" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${20 + currentFrameData.earRotation} 62 32)`}
        />
        
        {/* Eyes - slightly larger */}
        <circle cx="44" cy="38" r="2.5" fill="white" />
        <circle cx="56" cy="38" r="2.5" fill="white" />
        <circle cx="44" cy="38" r="1.5" fill="black" />
        <circle cx="56" cy="38" r="1.5" fill="black" />
        
        {/* Nose */}
        <ellipse cx="50" cy="48" rx="2.5" ry="2" fill="black" />
        
        {/* Tongue (appears occasionally) */}
        {currentFrameData.tongueVisible && (
          <ellipse 
            cx="50" 
            cy="55" 
            rx="4" 
            ry="3" 
            fill="#ff6b9d" 
            opacity="0.8"
          />
        )}
        
        {/* Tail - fluffier curve for Golden Retriever */}
        <path 
          d="M 78 62 Q 88 48 85 35 Q 83 32 81 35" 
          stroke="currentColor" 
          strokeWidth="5" 
          fill="none" 
          opacity="0.8"
          transform={`rotate(${currentFrameData.tailRotation} 78 62)`}
        />
        
        {/* Legs - slightly sturdier */}
        <rect x="36" y="76" width="5" height="14" fill="currentColor" opacity="0.7" />
        <rect x="45" y="76" width="5" height="14" fill="currentColor" opacity="0.7" />
        <rect x="55" y="76" width="5" height="14" fill="currentColor" opacity="0.7" />
        <rect x="64" y="76" width="5" height="14" fill="currentColor" opacity="0.7" />
        
        {/* Chest marking - typical of Golden Retrievers */}
        <ellipse 
          cx="50" 
          cy="60" 
          rx="8" 
          ry="4" 
          fill="currentColor" 
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
