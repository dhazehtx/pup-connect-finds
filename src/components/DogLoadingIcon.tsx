
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for the French Bulldog
  const frames = [
    { tailRotation: 0, earRotation: 0, tongueVisible: false },
    { tailRotation: 8, earRotation: -3, tongueVisible: false },
    { tailRotation: 15, earRotation: 3, tongueVisible: true },
    { tailRotation: 8, earRotation: -2, tongueVisible: false },
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
        {/* French Bulldog Body - stockier and broader */}
        <ellipse 
          cx="50" 
          cy="68" 
          rx="26" 
          ry="14" 
          fill="currentColor" 
          opacity="0.8"
        />
        
        {/* French Bulldog Head - rounder and wider */}
        <circle 
          cx="50" 
          cy="42" 
          r="18" 
          fill="currentColor"
        />
        
        {/* Flat Face/Muzzle - very short for French Bulldog */}
        <ellipse 
          cx="50" 
          cy="48" 
          rx="6" 
          ry="4" 
          fill="currentColor" 
          opacity="0.9"
        />
        
        {/* Left Bat Ear - distinctive French Bulldog feature */}
        <ellipse 
          cx="40" 
          cy="30" 
          rx="6" 
          ry="10" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${-15 + currentFrameData.earRotation} 40 30)`}
        />
        
        {/* Right Bat Ear - distinctive French Bulldog feature */}
        <ellipse 
          cx="60" 
          cy="30" 
          rx="6" 
          ry="10" 
          fill="currentColor" 
          opacity="0.7"
          transform={`rotate(${15 + currentFrameData.earRotation} 60 30)`}
        />
        
        {/* Inner ear details for bat ears */}
        <ellipse 
          cx="40" 
          cy="32" 
          rx="3" 
          ry="6" 
          fill="currentColor" 
          opacity="0.4"
          transform={`rotate(${-15 + currentFrameData.earRotation} 40 32)`}
        />
        <ellipse 
          cx="60" 
          cy="32" 
          rx="3" 
          ry="6" 
          fill="currentColor" 
          opacity="0.4"
          transform={`rotate(${15 + currentFrameData.earRotation} 60 32)`}
        />
        
        {/* Eyes - slightly larger and more prominent */}
        <circle cx="44" cy="40" r="2.5" fill="white" />
        <circle cx="56" cy="40" r="2.5" fill="white" />
        <circle cx="44" cy="40" r="1.5" fill="black" />
        <circle cx="56" cy="40" r="1.5" fill="black" />
        
        {/* Nose - wider and flatter */}
        <ellipse cx="50" cy="46" rx="3" ry="1.5" fill="black" />
        
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
        
        {/* Short tail - typical of French Bulldogs */}
        <ellipse 
          cx="74" 
          cy="65" 
          rx="4" 
          ry="6" 
          fill="currentColor" 
          opacity="0.8"
          transform={`rotate(${currentFrameData.tailRotation} 74 65)`}
        />
        
        {/* Legs - shorter and sturdier for French Bulldog */}
        <rect x="38" y="78" width="5" height="12" fill="currentColor" opacity="0.7" />
        <rect x="46" y="78" width="5" height="12" fill="currentColor" opacity="0.7" />
        <rect x="54" y="78" width="5" height="12" fill="currentColor" opacity="0.7" />
        <rect x="62" y="78" width="5" height="12" fill="currentColor" opacity="0.7" />
        
        {/* Chest marking */}
        <ellipse 
          cx="50" 
          cy="62" 
          rx="6" 
          ry="3" 
          fill="currentColor" 
          opacity="0.5"
        />
        
        {/* Facial wrinkles - characteristic of French Bulldogs */}
        <path 
          d="M 42 38 Q 45 36 48 38" 
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.3"
        />
        <path 
          d="M 52 38 Q 55 36 58 38" 
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.3"
        />
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
