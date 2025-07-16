
import React from 'react';
import { useParams } from 'react-router-dom';

const ConversationThread = () => {
  const { threadId } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Conversation</h1>
      <p>Thread ID: {threadId}</p>
    </div>
  );
};

export default ConversationThread;
