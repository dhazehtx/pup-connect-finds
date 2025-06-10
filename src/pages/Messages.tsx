
import React from 'react';
import EnhancedMessagingInterface from '@/components/messaging/EnhancedMessagingInterface';

const Messages = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <EnhancedMessagingInterface />
      </div>
    </div>
  );
};

export default Messages;
