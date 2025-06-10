
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
  console.log('User:', user?.id);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId && user) {
      console.log('Loading messages for conversation:', conversationId);
      fetchMessages(conversationId).then(() => {
        console.log('Messages loaded successfully');
        markAsRead(conversationId);
      }).catch(error => {
        console.error('Failed to load messages:', error);
        toast({
          title: "Error loading messages",
          description: "Please refresh and try again",
          variant: "destructive",
        });
      });
    }
  }, [conversationId, user, fetchMessages, markAsRead, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !user || sendingMessage) {
      console.log('Cannot send message:', { 
        hasContent: !!newMessage.trim(), 
        hasFile: !!selectedFile, 
        hasUser: !!user, 
        sending: sendingMessage 
      });
      return;
    }

    console.log('Sending message:', { content: newMessage, hasFile: !!selectedFile });
    setSendingMessage(true);

    try {
      let imageUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name);
        try {
          imageUrl = await uploadFile(selectedFile, {
            bucket: 'dog-images',
            folder: 'messages',
            maxSize: 10,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
          }) || undefined;
          console.log('File uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Sending text only.",
            variant: "destructive",
          });
        }
      }

      // Send message
      const messageContent = newMessage.trim() || (selectedFile ? t('messaging.imageMessage') || 'Image' : '');
      const messageType = selectedFile ? 'image' : 'text';
      
      console.log('Sending message with:', { messageContent, messageType, imageUrl });
      
      const result = await sendMessage(conversationId, messageContent, messageType, imageUrl);

      if (result) {
        console.log('Message sent successfully:', result.id);
        // Clear inputs
        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast({
          title: "Message sent",
          description: selectedFile ? "Image sent successfully" : "Message sent",
        });
      } else {
        throw new Error('No result returned from sendMessage');
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
      console.log('File selected:', file.name, file.size, file.type);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, or WebP image",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Smile className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
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
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {message.message_type === 'image' && message.image_url && (
                      <img
                        src={message.image_url}
                        alt="Shared image"
                        className="rounded mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.image_url, '_blank')}
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
                    <span className="text-xs text-muted-foreground">{messageTime}</span>
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
        <div className="px-4 py-2 bg-muted/50 border-t">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 truncate">
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
      <div className="p-4 border-t bg-background">
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
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
