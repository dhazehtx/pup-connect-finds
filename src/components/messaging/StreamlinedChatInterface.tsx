
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Send, Paperclip, Mic, User, Phone, Video, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EnhancedVoicePlayer from './EnhancedVoicePlayer';
import AdvancedVideoCall from './AdvancedVideoCall';
import AdvancedVoiceRecorder from './AdvancedVoiceRecorder';

interface StreamlinedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  onBack: () => void;
}

const StreamlinedChatInterface = ({ conversationId, otherUserId, onBack }: StreamlinedChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage } = useRealtimeMessages();
  const { uploadImage, uploading } = useFileUpload();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages(conversationId);
    }
  }, [conversationId, user, fetchMessages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user) return;

    try {
      if (selectedFile) {
        const imageUrl = await uploadImage(selectedFile);
        if (imageUrl) {
          await sendMessage(conversationId, `Shared an image: ${selectedFile.name}`, 'image', imageUrl);
        }
        setSelectedFile(null);
      } else {
        await sendMessage(conversationId, newMessage.trim(), 'text');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendVoiceMessage = async (audioUrl: string, duration: number) => {
    try {
      await sendMessage(conversationId, `Voice message (${duration}s)`, 'voice', audioUrl);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage src="" />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold">Enhanced Chat</h3>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              
              <Popover open={showVideoCall} onOpenChange={setShowVideoCall}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0">
                  <AdvancedVideoCall
                    conversationId={conversationId}
                    otherUserId={otherUserId}
                    isCallActive={isVideoCallActive}
                    onCallStart={() => setIsVideoCallActive(true)}
                    onEndCall={() => {
                      setIsVideoCallActive(false);
                      setShowVideoCall(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
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
                  {message.message_type === 'voice' && message.voice_url ? (
                    <EnhancedVoicePlayer
                      audioUrl={message.voice_url}
                      duration={60} // You'd extract this from the message
                      timestamp={message.created_at}
                      isOwn={isOwn}
                    />
                  ) : (
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
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

      {/* Voice Recorder Modal */}
      <Popover open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <AdvancedVoiceRecorder
            onSendVoiceMessage={handleSendVoiceMessage}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </PopoverContent>
      </Popover>

      {/* Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          {selectedFile && (
            <div className="mb-2 p-2 bg-muted rounded flex items-center justify-between">
              <span className="text-sm">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                ×
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={uploading}
            />
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="ghost" size="sm" asChild>
                <span>
                  <Paperclip className="w-4 h-4" />
                </span>
              </Button>
            </label>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowVoiceRecorder(true)}
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !selectedFile) || uploading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamlinedChatInterface;
