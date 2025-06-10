
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Image, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import MessageStatusIndicator from './MessageStatusIndicator';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  listingId?: string;
}

const EnhancedChatInterface = ({ conversationId, otherUserId, listingId }: EnhancedChatInterfaceProps) => {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessages();
  const { uploadFile, uploading } = useEnhancedFileUpload();

  console.log('EnhancedChatInterface loaded for conversation:', conversationId);
  console.log('Current messages:', messages);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      console.log('Loading messages for conversation:', conversationId);
      fetchMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId, fetchMessages, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user || sendingMessage) return;

    console.log('Sending message:', { content: newMessage, hasFile: !!selectedFile });
    setSendingMessage(true);

    try {
      let imageUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        imageUrl = await uploadFile(selectedFile, {
          bucket: 'dog-images',
          folder: 'messages',
          maxSize: 10,
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        }) || undefined;
      }

      // Send message
      const result = await sendMessage(
        conversationId,
        newMessage.trim() || (selectedFile ? t('messaging.imageMessage') || 'Image' : ''),
        selectedFile ? 'image' : 'text',
        imageUrl
      );

      if (result) {
        console.log('Message sent successfully:', result.id);
        // Clear inputs
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      setSelectedFile(file);
    }
  };

  // Handle key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatus = (message: any) => {
    if (message.sender_id !== user?.id) return null;
    
    if (message.read_at) return 'read';
    // For now, assume messages are delivered when created
    return 'delivered';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Smile className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">
                    {isOwn ? 'Me' : 'U'}
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
                        className="rounded mb-2 max-w-full h-auto"
                        onError={(e) => {
                          console.log('Image failed to load:', message.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {message.content && (
                      <p className="text-sm break-words">{message.content}</p>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">{messageTime}</span>
                    {isOwn && (
                      <MessageStatusIndicator 
                        status={getMessageStatus(message) || 'sent'} 
                        size={12}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 flex-1 truncate">
              Selected: {selectedFile.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="h-6 px-2 text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2 items-end">
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
            disabled={uploading || sendingMessage}
            className="flex-shrink-0"
          >
            <Image size={16} />
          </Button>

          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('messaging.typeMessage') || 'Type your message...'}
              disabled={uploading || sendingMessage}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || uploading || sendingMessage}
            className="flex-shrink-0"
          >
            {sendingMessage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
