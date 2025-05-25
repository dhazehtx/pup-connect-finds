
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for the French Bulldog
  const frames = [
    { earRotation: 0, tongueVisible: false },
    { earRotation: -3, tongueVisible: false },
    { earRotation: 3, tongueVisible: true },
    { earRotation: -2, tongueVisible: false },
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
        {/* French Bulldog Head - rounder and wider */}
        <circle 
          cx="50" 
          cy="50" 
          r="25" 
          fill="currentColor"
        />
        
        {/* Flat Face/Muzzle - very short for French Bulldog */}
        <ellipse 
          cx="50" 
          cy="58" 
          rx="8" 
          ry="6" 
          fill="currentColor" 
          opacity="0.9"
        />
        
        {/* Left Bat Ear - distinctive French Bulldog feature */}
        <ellipse 
          cx="35" 
          cy="32" 
          rx="8" 
          ry="12" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${-15 + currentFrameData.earRotation} 35 32)`}
        />
        
        {/* Right Bat Ear - distinctive French Bulldog feature */}
        <ellipse 
          cx="65" 
          cy="32" 
          rx="8" 
          ry="12" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${15 + currentFrameData.earRotation} 65 32)`}
        />
        
        {/* Inner ear details for bat ears */}
        <ellipse 
          cx="35" 
          cy="34" 
          rx="4" 
          ry="8" 
          fill="currentColor" 
          opacity="0.4"
          transform={`rotate(${-15 + currentFrameData.earRotation} 35 34)`}
        />
        <ellipse 
          cx="65" 
          cy="34" 
          rx="4" 
          ry="8" 
          fill="currentColor" 
          opacity="0.4"
          transform={`rotate(${15 + currentFrameData.earRotation} 65 34)`}
        />
        
        {/* Eyes - slightly larger and more prominent */}
        <circle cx="42" cy="46" r="3" fill="white" />
        <circle cx="58" cy="46" r="3" fill="white" />
        <circle cx="42" cy="46" r="2" fill="black" />
        <circle cx="58" cy="46" r="2" fill="black" />
        
        {/* Nose - wider and flatter */}
        <ellipse cx="50" cy="55" rx="4" ry="2" fill="black" />
        
        {/* Tongue (appears occasionally) */}
        {currentFrameData.tongueVisible && (
          <ellipse 
            cx="50" 
            cy="65" 
            rx="4" 
            ry="3" 
            fill="#ff6b9d" 
            opacity="0.8"
          />
        )}
        
        {/* Facial wrinkles - characteristic of French Bulldogs */}
        <path 
          d="M 38 42 Q 42 40 46 42" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.3"
        />
        <path 
          d="M 54 42 Q 58 40 62 42" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.3"
        />
        
        {/* Mouth line */}
        <path 
          d="M 46 60 Q 50 62 54 60" 
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.5"
        />
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
