
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Check, CheckCheck, Clock, User, Camera, Shield, ShieldOff } from 'lucide-react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useEncryptedMessaging } from '@/hooks/useEncryptedMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import MediaMessage from './MediaMessage';
import MediaUploadDialog from './MediaUploadDialog';

interface RealTimeChatInterfaceProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  listingInfo?: {
    name: string;
    breed: string;
    price: number;
    image?: string;
  };
}

const RealTimeChatInterface = ({ conversationId, otherUser, listingInfo }: RealTimeChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, markAsRead } = useRealtimeMessaging();
  const { 
    sendEncryptedMessage, 
    decryptReceivedMessage, 
    isEncryptionReady 
  } = useEncryptedMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [messages, conversationId]);

  // Decrypt messages when they arrive
  useEffect(() => {
    const decryptMessages = async () => {
      const newDecrypted = new Map(decryptedMessages);
      
      for (const message of messages) {
        if (message.is_encrypted && !newDecrypted.has(message.id)) {
          try {
            const decryptedContent = await decryptReceivedMessage(message);
            newDecrypted.set(message.id, decryptedContent);
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            newDecrypted.set(message.id, '[Encrypted message - unable to decrypt]');
          }
        }
      }
      
      setDecryptedMessages(newDecrypted);
    };

    if (isEncryptionReady && messages.length > 0) {
      decryptMessages();
    }
  }, [messages, isEncryptionReady, decryptReceivedMessage, decryptedMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      if (encryptionEnabled && isEncryptionReady) {
        await sendEncryptedMessage(conversationId, newMessage.trim(), 'text', undefined, otherUser.id);
      } else {
        // Fallback to regular messaging if encryption is disabled
        const { sendMessage } = useRealtimeMessaging();
        await sendMessage(conversationId, newMessage.trim(), 'text');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMediaUpload = async (url: string, type: 'image' | 'video', caption?: string) => {
    if (!user) return;

    try {
      const messageContent = caption || (type === 'image' ? 'Shared an image' : 'Shared a video');
      
      if (encryptionEnabled && isEncryptionReady) {
        await sendEncryptedMessage(conversationId, messageContent, type, url, otherUser.id);
      } else {
        const { sendMessage } = useRealtimeMessaging();
        await sendMessage(conversationId, messageContent, type, url);
      }
    } catch (error) {
      console.error('Error sending media message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatusIcon = (message: any) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.read_at) {
      return <CheckCheck size={14} className="text-blue-500" />;
    }
    if (message.created_at) {
      return <Check size={14} className="text-gray-400" />;
    }
    return <Clock size={14} className="text-gray-300" />;
  };

  const getMessageContent = (message: any) => {
    if (message.is_encrypted) {
      return decryptedMessages.get(message.id) || 'Decrypting...';
    }
    return message.content || '';
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <CardHeader className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {otherUser.name}
                {isEncryptionReady && encryptionEnabled ? (
                  <Shield className="w-4 h-4 text-green-500" title="End-to-end encrypted" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-gray-400" title="Not encrypted" />
                )}
              </CardTitle>
              {listingInfo && (
                <p className="text-sm text-gray-500">
                  About: {listingInfo.name} - ${listingInfo.price}
                </p>
              )}
              {otherUserTyping && (
                <p className="text-xs text-blue-500">typing...</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {listingInfo && (
              <Badge variant="outline">{listingInfo.breed}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              disabled={!isEncryptionReady}
              title={encryptionEnabled ? "Disable encryption" : "Enable encryption"}
            >
              {encryptionEnabled ? (
                <Shield className="w-4 h-4 text-green-500" />
              ) : (
                <ShieldOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : otherUser.avatar} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>

              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                {/* Media Messages */}
                {(message.message_type === 'image' || message.message_type === 'video') && message.image_url && (
                  <MediaMessage
                    imageUrl={message.message_type === 'image' ? message.image_url : undefined}
                    videoUrl={message.message_type === 'video' ? message.image_url : undefined}
                    caption={(() => {
                      const content = getMessageContent(message);
                      return content !== 'Shared an image' && content !== 'Shared a video' ? content : undefined;
                    })()}
                    isOwn={isOwn}
                  />
                )}
                
                {/* Text Messages */}
                {message.message_type === 'text' && (
                  <div
                    className={`rounded-lg px-3 py-2 relative ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{getMessageContent(message)}</p>
                    {message.is_encrypted && (
                      <Shield className="w-3 h-3 absolute top-1 right-1 opacity-60" />
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-1 gap-2">
                  <span className="text-xs text-gray-500">{messageTime}</span>
                  {getMessageStatusIcon(message)}
                </div>
              </div>
            </div>
          );
        })}
        
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs ml-2">typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        {!isEncryptionReady && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            Setting up encryption... Messages will be encrypted once ready.
          </div>
        )}
        <div className="flex gap-2">
          <MediaUploadDialog onMediaUpload={handleMediaUpload}>
            <Button variant="outline" size="icon">
              <Camera size={16} />
            </Button>
          </MediaUploadDialog>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={encryptionEnabled ? "Type your encrypted message..." : "Type your message..."}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChatInterface;
