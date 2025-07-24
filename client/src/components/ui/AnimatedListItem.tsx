import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
  delay?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  className,
  delay = 0.05
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: index * delay,
        ease: 'easeOut'
      }}
      whileHover={{ y: -2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};