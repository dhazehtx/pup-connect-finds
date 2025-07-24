import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  className
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

interface SlideInProps extends FadeInProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  direction = 'up',
  distance = 20,
  className
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      default: return { y: distance };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...getInitialPosition() }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 0.1,
  className
}) => (
  <motion.div className={className}>
    {children.map((child, index) => (
      <SlideIn key={index} delay={index * staggerDelay}>
        {child}
      </SlideIn>
    ))}
  </motion.div>
);

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);