import React from 'react';
import ReelsFeed from '@/components/reels/ReelsFeed';
import { useLocation } from 'wouter';

const ReelsPage = () => {
  const [, setLocation] = useLocation();

  const handleClose = () => {
    setLocation('/explore');
  };

  return <ReelsFeed onClose={handleClose} />;
};

export default ReelsPage;