
import React, { useState, useEffect } from 'react';
import { Dog } from 'lucide-react';

interface DogLoadingIconProps {
  size?: number;
  className?: string;
}

const DogLoadingIcon = ({ size = 48, className = "" }: DogLoadingIconProps) => {
  const [currentDog, setCurrentDog] = useState(0);
  
  // Different dog variations using transform and opacity
  const dogVariations = [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.1) rotate(5deg)', opacity: 0.8 },
    { transform: 'scale(0.9) rotate(-5deg)', opacity: 0.9 },
    { transform: 'scale(1.05)', opacity: 0.7 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDog((prev) => (prev + 1) % dogVariations.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Dog 
        size={size} 
        className="text-primary animate-pulse transition-all duration-300" 
        style={dogVariations[currentDog]}
      />
    </div>
  );
};

export default DogLoadingIcon;
