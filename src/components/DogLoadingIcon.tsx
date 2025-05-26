
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for the French Bulldog
  const frames = [
    { earTwitch: 0, tongueVisible: false },
    { earTwitch: 1, tongueVisible: false },
    { earTwitch: -1, tongueVisible: true },
    { earTwitch: 0, tongueVisible: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 700);

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
        {/* Head outline - wider and flatter for French Bulldog */}
        <path 
          d="M 25 45 Q 25 30 35 25 Q 50 20 65 25 Q 75 30 75 45 Q 75 65 65 70 Q 50 75 35 70 Q 25 65 25 45 Z"
          fill="currentColor"
          opacity="0.9"
        />
        
        {/* Left Bat Ear - very distinctive French Bulldog feature */}
        <path 
          d="M 30 35 Q 25 20 20 25 Q 15 30 18 40 Q 22 45 30 42 Z"
          fill="currentColor"
          opacity="0.8"
          transform={`translate(${currentFrameData.earTwitch} 0)`}
        />
        
        {/* Right Bat Ear - very distinctive French Bulldog feature */}
        <path 
          d="M 70 35 Q 75 20 80 25 Q 85 30 82 40 Q 78 45 70 42 Z"
          fill="currentColor"
          opacity="0.8"
          transform={`translate(${-currentFrameData.earTwitch} 0)`}
        />
        
        {/* Inner ear details */}
        <ellipse cx="24" cy="32" rx="3" ry="6" fill="currentColor" opacity="0.4" />
        <ellipse cx="76" cy="32" rx="3" ry="6" fill="currentColor" opacity="0.4" />
        
        {/* Very flat muzzle - key French Bulldog characteristic */}
        <rect 
          x="42" 
          y="50" 
          width="16" 
          height="12" 
          rx="3" 
          fill="currentColor" 
          opacity="0.7"
        />
        
        {/* Eyes - wide set and prominent */}
        <circle cx="40" cy="42" r="4" fill="white" />
        <circle cx="60" cy="42" r="4" fill="white" />
        <circle cx="40" cy="42" r="2.5" fill="black" />
        <circle cx="60" cy="42" r="2.5" fill="black" />
        <circle cx="41" cy="41" r="0.8" fill="white" opacity="0.8" />
        <circle cx="61" cy="41" r="0.8" fill="white" opacity="0.8" />
        
        {/* Nose - wide and flat */}
        <ellipse cx="50" cy="53" rx="4" ry="2" fill="black" />
        <ellipse cx="48" cy="52" rx="0.8" ry="1" fill="black" opacity="0.6" />
        <ellipse cx="52" cy="52" rx="0.8" ry="1" fill="black" opacity="0.6" />
        
        {/* Mouth line */}
        <path 
          d="M 45 58 Q 50 60 55 58"
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.6"
        />
        
        {/* Characteristic French Bulldog wrinkles */}
        <path 
          d="M 35 38 Q 40 36 45 38"
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.4"
        />
        <path 
          d="M 55 38 Q 60 36 65 38"
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.4"
        />
        <path 
          d="M 42 48 Q 50 46 58 48"
          stroke="currentColor" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.3"
        />
        
        {/* Tongue (appears occasionally) */}
        {currentFrameData.tongueVisible && (
          <ellipse 
            cx="50" 
            cy="63" 
            rx="5" 
            ry="3" 
            fill="#ff6b9d" 
            opacity="0.9"
          />
        )}
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
