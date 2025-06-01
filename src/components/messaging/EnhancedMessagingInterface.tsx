
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, Camera, Mic, Check, CheckCheck, Clock, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedMessagingInterfaceProps {
  conversationId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
  listingInfo?: {
    name: string;
    breed: string;
    image?: string;
  };
}

const QUICK_TEMPLATES = [
  "Is this still available?",
  "Can we schedule a viewing?",
  "What's the best time to visit?",
  "Is the puppy vaccinated?",
  "Can you provide health certificates?",
  "What's included in the price?",
];

const EnhancedMessagingInterface: React.FC<EnhancedMessagingInterfaceProps> = ({
  conversationId,
  otherUserName,
  otherUserAvatar,
  listingInfo
}) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead } = useRealtimeMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [messages, conversationId]);

  // Simulate typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    if (newMessage.trim()) {
      setIsTyping(true);
      typingTimeout = setTimeout(() => setIsTyping(false), 2000);
    } else {
      setIsTyping(false);
    }
    return () => clearTimeout(typingTimeout);
  }, [newMessage]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || newMessage.trim();
    if (!textToSend && !selectedFile) return;

    try {
      let imageUrl: string | undefined;
      
      // Simulate file upload for demo
      if (selectedFile) {
        imageUrl = URL.createObjectURL(selectedFile);
        toast({
          title: "Photo uploaded",
          description: "Photo has been attached to your message",
        });
      }

      await sendMessage(
        conversationId,
        textToSend || (selectedFile ? "📷 Photo" : ''),
        selectedFile ? 'image' : 'text',
        imageUrl
      );

      setNewMessage('');
      setSelectedFile(null);
      setShowTemplates(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (template: string) => {
    handleSendMessage(template);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "Photo selected",
        description: `${file.name} ready to send`,
      });
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Recording stopped" : "Recording started",
      description: isRecording ? "Voice message ready to send" : "Speak your message now",
    });
  };

  const getMessageStatusIcon = (message: any) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.read_at) {
      return <CheckCheck size={12} className="text-blue-500" />;
    }
    return <Check size={12} className="text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <CardHeader className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUserAvatar} />
              <AvatarFallback>
                {otherUserName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName || 'Conversation'}</CardTitle>
              {listingInfo && (
                <p className="text-sm text-gray-500">
                  About: {listingInfo.name} ({listingInfo.breed})
                </p>
              )}
              {otherUserTyping && (
                <p className="text-xs text-blue-500">typing...</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
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
                <AvatarImage src={isOwn ? user?.user_metadata?.avatar_url : otherUserAvatar} />
                <AvatarFallback>
                  {isOwn ? (user?.email?.charAt(0) || 'Y') : (otherUserName?.charAt(0) || 'T')}
                </AvatarFallback>
              </Avatar>

              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.message_type === 'image' && message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Shared image"
                      className="rounded mb-2 max-w-full h-auto cursor-pointer"
                      onClick={() => window.open(message.image_url, '_blank')}
                    />
                  )}
                  {message.content && (
                    <p className="text-sm break-words">{message.content}</p>
                  )}
                </div>
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

      {/* Quick Templates */}
      {showTemplates && (
        <div className="border-t p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Quick messages:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleTemplateSelect(template)}
                className="text-xs"
              >
                {template}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-blue-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-blue-500" />
              <span className="text-sm text-blue-700">📷 {selectedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Camera size={16} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceRecord}
            className={`shrink-0 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
          >
            <Mic size={16} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTemplates(!showTemplates)}
            className="shrink-0"
          >
            <MessageSquare size={16} />
          </Button>

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none min-h-[40px] max-h-[100px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <Button 
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() && !selectedFile}
            className="shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessagingInterface;
