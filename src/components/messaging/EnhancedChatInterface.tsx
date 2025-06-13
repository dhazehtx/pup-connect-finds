
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
  Smile,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedChatInterfaceProps {
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

const EnhancedChatInterface = ({ conversationId, otherUser, onBack }: EnhancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, loadMessages, sendMessage, loading } = useMessaging();
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      await sendMessage(conversationId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle file upload logic here
    console.log('File selected:', file);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
    console.log('Starting voice recording...');
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    // Stop recording and send voice message
    console.log('Stopping voice recording...');
  };

  const startVideoCall = () => {
    // Implement video calling logic
    console.log('Starting video call...');
  };

  const startVoiceCall = () => {
    // Implement voice calling logic
    console.log('Starting voice call...');
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
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={startVoiceCall}>
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={startVideoCall}>
            <Video className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Block User</DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.message_type === 'text' && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    {message.message_type === 'image' && (
                      <div>
                        <img 
                          src={message.file_url} 
                          alt="Shared image"
                          className="rounded max-w-full h-auto"
                        />
                        {message.content && (
                          <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <ImageIcon className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onMouseDown={startVoiceRecording}
            onMouseUp={stopVoiceRecording}
            className={isRecording ? 'bg-red-100 text-red-600' : ''}
          >
            <Mic className="w-4 h-4" />
          </Button>

          <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileUpload}
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
      </div>
    </Card>
  );
};

export default EnhancedChatInterface;
