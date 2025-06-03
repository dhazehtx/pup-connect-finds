
import React from 'react';
import RealTimeChatInterface from './RealTimeChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ConversationViewProps {
  conversation: {
    id: string;
    other_user?: {
      full_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
    listing?: {
      dog_name: string;
      breed: string;
      image_url: string | null;
    };
  };
  onBack: () => void;
}

const ConversationView = ({ conversation, onBack }: ConversationViewProps) => {
  const otherUser = {
    id: 'temp-id', // This would come from the conversation data
    name: conversation.other_user?.full_name || conversation.other_user?.username || 'Unknown User',
    avatar: conversation.other_user?.avatar_url || undefined
  };

  const listingInfo = conversation.listing ? {
    name: conversation.listing.dog_name,
    breed: conversation.listing.breed,
    price: 0, // This would come from the listing data
    image: conversation.listing.image_url || undefined
  } : undefined;

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button */}
      <div className="flex items-center gap-2 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <RealTimeChatInterface
          conversationId={conversation.id}
          otherUser={otherUser}
          listingInfo={listingInfo}
        />
      </div>
    </div>
  );
};

export default ConversationView;
