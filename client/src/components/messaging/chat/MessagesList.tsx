
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EnhancedVoicePlayer from '../EnhancedVoicePlayer';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  created_at: string;
  is_encrypted?: boolean;
}

interface MessagesListProps {
  messages: Message[];
}

const MessagesList = ({ messages }: MessagesListProps) => {
  const { user } = useAuth();

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isOwn && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                {message.message_type === 'voice' && message.image_url ? (
                  <EnhancedVoicePlayer
                    audioUrl={message.image_url}
                    duration={60}
                    timestamp={message.created_at}
                    isOwn={isOwn}
                  />
                ) : (
                  <div
                    className={`rounded-lg px-3 py-2 relative ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.is_encrypted && (
                      <Shield className="w-3 h-3 absolute top-1 right-1 text-green-500" />
                    )}
                    
                    {message.message_type === 'image' && message.image_url ? (
                      <img
                        src={message.image_url}
                        alt="Shared content"
                        className="max-w-full h-auto rounded mb-2"
                      />
                    ) : null}
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                )}
                
                {message.message_type !== 'voice' && (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
