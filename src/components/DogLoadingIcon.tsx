
import React, { useState, useEffect } from 'react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames for bouncing ball
  const frames = [
    { y: 20, scale: 1 },     // Top position
    { y: 35, scale: 1.1 },   // Mid-fall, slight stretch
    { y: 60, scale: 1.3 },   // Bottom position, squashed
    { y: 45, scale: 1.1 },   // Mid-bounce, slight stretch
    { y: 30, scale: 1 },     // Rising
    { y: 20, scale: 1 },     // Back to top
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const currentFrameData = frames[currentFrame];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="text-red-500"
      >
        {/* Ball */}
        <circle
          cx="50"
          cy={currentFrameData.y}
          r="8"
          fill="currentColor"
          transform={`scale(${currentFrameData.scale})`}
          style={{ transformOrigin: '50px 50px' }}
          className="transition-all duration-150 ease-out"
        />
        
        {/* Shadow that changes size based on ball height */}
        <ellipse
          cx="50"
          cy="75"
          rx={12 - (currentFrameData.y - 20) * 0.1}
          ry={3 - (currentFrameData.y - 20) * 0.03}
          fill="currentColor"
          opacity={0.2}
          className="transition-all duration-150 ease-out"
        />
        
        {/* Optional: Add bounce lines for emphasis */}
        {currentFrameData.y > 55 && (
          <>
            <path
              d="M 35 70 Q 40 65 45 70"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              className="animate-pulse"
            />
            <path
              d="M 55 70 Q 60 65 65 70"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              className="animate-pulse"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default DogLoadingIcon;
