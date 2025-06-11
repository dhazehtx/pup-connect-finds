
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import FileMessageDisplay from './FileMessageDisplay';

interface Message {
  id: string;
  content: string;
  message_type: string;
  image_url?: string;
  voice_url?: string;
  created_at: string;
  sender_id: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
}

const MessageBubble = ({ 
  message, 
  isOwn, 
  senderName, 
  senderAvatar, 
  showAvatar = true 
}: MessageBubbleProps) => {
  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'voice':
        if (message.voice_url || message.image_url) {
          // Extract duration from content if available
          const durationMatch = message.content.match(/\((\d+)s\)/);
          const duration = durationMatch ? parseInt(durationMatch[1]) : 30;
          
          return (
            <VoiceMessagePlayer
              audioUrl={message.voice_url || message.image_url || ''}
              duration={duration}
              timestamp={message.created_at}
              isOwn={isOwn}
            />
          );
        }
        break;

      case 'file':
      case 'image':
        if (message.image_url) {
          return (
            <FileMessageDisplay
              fileUrl={message.image_url}
              fileName={message.file_name || extractFileNameFromContent(message.content)}
              fileType={message.file_type || getFileTypeFromUrl(message.image_url)}
              fileSize={message.file_size}
              timestamp={message.created_at}
              isOwn={isOwn}
            />
          );
        }
        break;

      default:
        // Regular text message
        if (message.image_url && message.message_type === 'text') {
          return (
            <div className="space-y-2">
              <img 
                src={message.image_url} 
                alt="Shared image"
                className="rounded-lg max-w-full h-auto"
              />
              {message.content && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          );
        }
        
        return <p className="text-sm">{message.content}</p>;
    }

    // Fallback for unhandled message types
    return <p className="text-sm">{message.content}</p>;
  };

  const extractFileNameFromContent = (content: string): string => {
    const match = content.match(/Shared (?:a file|an image): (.+)/);
    return match ? match[1] : 'Unknown file';
  };

  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  };

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>
            {senderName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs sm:max-w-md`}>
        {!isOwn && senderName && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {senderName}
          </span>
        )}
        
        <div className={`rounded-lg ${
          message.message_type === 'voice' || message.message_type === 'file' || message.message_type === 'image'
            ? 'p-0' // No padding for voice/file messages as they handle their own styling
            : isOwn 
              ? 'bg-primary text-primary-foreground p-3'
              : 'bg-muted p-3'
        }`}>
          {renderMessageContent()}
        </div>

        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
