
import React from 'react';
import RealTimeChatInterface from './RealTimeChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      price?: number;
    };
  };
  onBack: () => void;
}

const ConversationView = ({ conversation, onBack }: ConversationViewProps) => {
  const otherUser = {
    id: 'temp-id',
    name: conversation.other_user?.full_name || conversation.other_user?.username || 'Unknown User',
    avatar: conversation.other_user?.avatar_url || undefined
  };

  const listingInfo = conversation.listing ? {
    id: conversation.id,
    name: conversation.listing.dog_name,
    breed: conversation.listing.breed,
    price: conversation.listing.price || 0,
    image_url: conversation.listing.image_url || undefined,
    dog_name: conversation.listing.dog_name
  } : undefined;

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-2 p-4 border-b bg-white">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" />
          Back to Messages
        </Button>
      </div>

      {/* Listing Preview Banner */}
      {conversation.listing && (
        <Card className="mx-4 mt-4 mb-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {conversation.listing.image_url && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={conversation.listing.image_url} 
                    alt={conversation.listing.dog_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.listing.dog_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {conversation.listing.breed}
                </p>
                {conversation.listing.price && (
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${conversation.listing.price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface */}
      <div className="flex-1 mx-4 mb-4">
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
