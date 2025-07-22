
import React from 'react';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import OptimizedMessagingInterface from './OptimizedMessagingInterface';

const RealtimeMessagingWrapper = () => {
  return (
    <RealtimeProvider>
      <OptimizedMessagingInterface />
    </RealtimeProvider>
  );
};

export default RealtimeMessagingWrapper;
