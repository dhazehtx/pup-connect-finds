import React from 'react';
import ReelsFeed from '@/components/reels/ReelsFeed';
import { useNavigate } from 'react-router-dom';

const ReelsPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/explore');
  };

  return <ReelsFeed onClose={handleClose} />;
};

export default ReelsPage;