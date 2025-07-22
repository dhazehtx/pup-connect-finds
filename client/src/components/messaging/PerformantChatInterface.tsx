
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Video, 
  Phone, 
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import VirtualizedMessagesList from './VirtualizedMessagesList';
import ConnectionStatus from './ConnectionStatus';
import OptimizedImage from '@/components/ui/optimized-image';

interface PerformantChatInterfaceProps {
  conversationId?: string;
  otherUser?: {
    id: string;
    full_name?: string;
    name?: string;
    avatar?: string;
    avatar_url?: string;
    status?: 'online' | 'offline' | 'away';
  };
  onBack?: () => void;
}

const PerformantChatInterface = ({ conversationId, otherUser, onBack }: PerformantChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, loadMessages, sendMessage, loading } = useMessaging();
  const { isOnline, isSlowConnection } = useConnectionStatus();
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !isOnline) return;

    try {
      setIsSending(true);
      await sendMessage(conversationId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetryConnection = () => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!conversationId) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = otherUser?.full_name || otherUser?.name || 'Unknown User';
  const avatarUrl = otherUser?.avatar_url || otherUser?.avatar;

  return (
    <Card className="h-full flex flex-col">
      {/* Connection Status */}
      <ConnectionStatus isConnected={isOnline} onRetry={handleRetryConnection} />

      {/* Chat Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>
              {displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{displayName}</h3>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={otherUser?.status === 'online' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {otherUser?.status || 'offline'}
              </Badge>
              {isSlowConnection && (
                <Badge variant="outline" className="text-xs">
                  Slow connection
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" disabled={!isOnline}>
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" disabled={!isOnline}>
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area - Using Virtualization */}
      <CardContent className="flex-1 p-0 relative">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <VirtualizedMessagesList
            messages={messages}
            currentUserId={user?.id}
            height={400}
            otherUserAvatar={avatarUrl}
            currentUserAvatar={user?.user_metadata?.avatar_url}
          />
        )}
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isOnline}
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isOnline ? "Type a message..." : "Reconnecting..."}
              className="pr-10"
              disabled={!isOnline || isSending}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={isRecording ? 'bg-red-100 text-red-600' : ''}
            disabled={!isOnline}
          >
            <Mic className="w-4 h-4" />
          </Button>

          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || !isOnline || isSending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*,video/*,.pdf,.doc,.docx"
          disabled={!isOnline}
        />
      </div>
    </Card>
  );
};

export default PerformantChatInterface;
