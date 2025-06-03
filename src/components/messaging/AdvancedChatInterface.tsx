
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Check, CheckCheck, Clock, User, Camera, Mic, Video, Search, Shield, ShieldOff, Paperclip } from 'lucide-react';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useEncryptedMessaging } from '@/hooks/useEncryptedMessaging';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import MediaMessage from './MediaMessage';
import MediaUploadDialog from './MediaUploadDialog';

interface AdvancedChatInterfaceProps {
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

const AdvancedChatInterface = ({ conversationId, otherUser, listingInfo }: AdvancedChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, markAsRead, sendTypingIndicator, searchMessages } = useRealtimeMessaging();
  const { 
    sendEncryptedMessage, 
    decryptReceivedMessage, 
    isEncryptionReady 
  } = useEncryptedMessaging();
  const { 
    isRecording, 
    audioBlob, 
    duration, 
    formatDuration,
    startRecording, 
    stopRecording, 
    cancelRecording 
  } = useVoiceRecording();
  const { uploadFile } = useEnhancedFileUpload();
  const { 
    isCallActive, 
    initializeConnection, 
    endCall, 
    toggleMute, 
    toggleVideo,
    isMuted,
    isVideoOff
  } = useWebRTC();

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [messages, conversationId]);

  // Handle typing indicators
  const handleTyping = () => {
    sendTypingIndicator(conversationId, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(conversationId, false);
    }, 1000);
  };

  // Decrypt messages
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
        const { sendMessage } = useRealtimeMessaging();
        await sendMessage(conversationId, newMessage.trim(), 'text');
      }
      setNewMessage('');
      sendTypingIndicator(conversationId, false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleVoiceMessage = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (audioBlob) {
        // Send the voice message
        const voiceUrl = await uploadFile(
          new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' }),
          { bucket: 'messages', folder: 'voice' }
        );
        
        if (voiceUrl) {
          if (encryptionEnabled && isEncryptionReady) {
            await sendEncryptedMessage(conversationId, 'Voice message', 'voice', voiceUrl, otherUser.id);
          } else {
            const { sendMessage } = useRealtimeMessaging();
            await sendMessage(conversationId, 'Voice message', 'voice', voiceUrl);
          }
        }
      } else {
        startRecording();
      }
    }
  };

  const handleVideoCall = async () => {
    if (isCallActive) {
      endCall();
    } else {
      try {
        await initializeConnection(`call-${conversationId}`);
      } catch (error) {
        console.error('Failed to start video call:', error);
      }
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

  const filteredMessages = searchQuery 
    ? messages.filter(m => getMessageContent(m).toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

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
                  <Shield className="w-4 h-4 text-green-500" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-gray-400" />
                )}
              </CardTitle>
              {listingInfo && (
                <p className="text-sm text-gray-500">
                  About: {listingInfo.name} - ${listingInfo.price}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-32"
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVideoCall}
              className={isCallActive ? 'bg-red-100 text-red-600' : ''}
            >
              <Video className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              disabled={!isEncryptionReady}
            >
              {encryptionEnabled ? (
                <Shield className="w-4 h-4 text-green-500" />
              ) : (
                <ShieldOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            
            {listingInfo && (
              <Badge variant="outline">{listingInfo.breed}</Badge>
            )}
          </div>
        </div>
        
        {/* Video Call Controls */}
        {isCallActive && (
          <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={toggleMute}>
              <Mic className={`w-4 h-4 ${isMuted ? 'text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleVideo}>
              <Video className={`w-4 h-4 ${isVideoOff ? 'text-red-500' : ''}`} />
            </Button>
            <Button variant="destructive" size="sm" onClick={endCall}>
              End Call
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => {
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
                
                {/* Voice Messages */}
                {message.message_type === 'voice' && message.image_url && (
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <audio controls className="w-full">
                      <source src={message.image_url} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
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
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="border-t p-3 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700">Recording: {formatDuration(duration)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={cancelRecording}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={stopRecording}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

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
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleVoiceMessage}
            className={isRecording ? 'bg-red-100 text-red-600' : ''}
          >
            <Mic size={16} />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={encryptionEnabled ? "Type your encrypted message..." : "Type your message..."}
            className="flex-1"
            disabled={isRecording}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isRecording}
            size="icon"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChatInterface;
