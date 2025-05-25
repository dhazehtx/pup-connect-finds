
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
    { tailRotation: 15, earRotation: -5, tongueVisible: false },
    { tailRotation: 30, earRotation: 5, tongueVisible: true },
    { tailRotation: 15, earRotation: -2, tongueVisible: false },
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
        {/* Dog Body */}
        <ellipse 
          cx="50" 
          cy="65" 
          rx="25" 
          ry="15" 
          fill="currentColor" 
          opacity="0.8"
        />
        
        {/* Dog Head */}
        <circle 
          cx="50" 
          cy="40" 
          r="18" 
          fill="currentColor"
        />
        
        {/* Dog Snout */}
        <ellipse 
          cx="50" 
          cy="48" 
          rx="8" 
          ry="6" 
          fill="currentColor" 
          opacity="0.9"
        />
        
        {/* Left Ear */}
        <ellipse 
          cx="42" 
          cy="30" 
          rx="6" 
          ry="12" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${-10 + currentFrameData.earRotation} 42 30)`}
        />
        
        {/* Right Ear */}
        <ellipse 
          cx="58" 
          cy="30" 
          rx="6" 
          ry="12" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${10 + currentFrameData.earRotation} 58 30)`}
        />
        
        {/* Eyes */}
        <circle cx="45" cy="38" r="2" fill="white" />
        <circle cx="55" cy="38" r="2" fill="white" />
        <circle cx="45" cy="38" r="1" fill="black" />
        <circle cx="55" cy="38" r="1" fill="black" />
        
        {/* Nose */}
        <ellipse cx="50" cy="46" rx="2" ry="1.5" fill="black" />
        
        {/* Tongue (appears occasionally) */}
        {currentFrameData.tongueVisible && (
          <ellipse 
            cx="50" 
            cy="52" 
            rx="3" 
            ry="2" 
            fill="#ff6b9d" 
            opacity="0.8"
          />
        )}
        
        {/* Tail */}
        <path 
          d="M 75 60 Q 85 50 80 40" 
          stroke="currentColor" 
          strokeWidth="4" 
          fill="none" 
          opacity="0.8"
          transform={`rotate(${currentFrameData.tailRotation} 75 60)`}
        />
        
        {/* Legs */}
        <rect x="38" y="75" width="4" height="12" fill="currentColor" opacity="0.7" />
        <rect x="46" y="75" width="4" height="12" fill="currentColor" opacity="0.7" />
        <rect x="54" y="75" width="4" height="12" fill="currentColor" opacity="0.7" />
        <rect x="62" y="75" width="4" height="12" fill="currentColor" opacity="0.7" />
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
