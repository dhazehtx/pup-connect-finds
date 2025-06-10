
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Image, Paperclip, Smile, MoreHorizontal, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import MessageStatusIndicator from './MessageStatusIndicator';
import MessageReactionsPicker from './MessageReactionsPicker';
import MessageReactionsDisplay from './MessageReactionsDisplay';
import MessageThread from './MessageThread';
import { useMessageThreads } from '@/hooks/useMessageThreads';
import EnhancedMessageInput from './EnhancedMessageInput';

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
  const [reactionPickerState, setReactionPickerState] = useState<{
    isOpen: boolean;
    messageId: string | null;
    position: { x: number; y: number } | null;
  }>({
    isOpen: false,
    messageId: null,
    position: null
  });
  const [threadState, setThreadState] = useState<{
    isOpen: boolean;
    parentMessageId: string | null;
    parentMessage: any | null;
  }>({
    isOpen: false,
    parentMessageId: null,
    parentMessage: null
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessages();
  const { uploadFile, uploading } = useEnhancedFileUpload();
  const { reactions, addReaction, toggleReaction } = useMessageReactions();
  const { getThreadCount } = useMessageThreads();

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

  const handleReactionButtonClick = (event: React.MouseEvent, messageId: string) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setReactionPickerState({
      isOpen: true,
      messageId,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
  };

  const handleReactionAdd = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const handleReactionToggle = (messageId: string, emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const closeReactionPicker = () => {
    setReactionPickerState({ isOpen: false, messageId: null, position: null });
  };

  const handleReplyToMessage = (message: any) => {
    setThreadState({
      isOpen: true,
      parentMessageId: message.id,
      parentMessage: {
        content: message.content,
        sender_name: message.sender_id === user?.id ? 'You' : 'User',
        created_at: message.created_at,
        sender_id: message.sender_id
      }
    });
  };

  const closeThread = () => {
    setThreadState({
      isOpen: false,
      parentMessageId: null,
      parentMessage: null
    });
  };

  // Add voice message handling
  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!user) return;

    console.log('Sending voice message:', { size: audioBlob.size, duration });
    setSendingMessage(true);

    try {
      // Convert Blob to File
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { 
        type: 'audio/webm',
        lastModified: Date.now()
      });

      // Upload voice file
      const voiceUrl = await uploadFile(audioFile, {
        bucket: 'dog-images',
        folder: 'voice-messages',
        maxSize: 50, // 50MB for voice messages
        allowedTypes: ['audio/webm', 'audio/wav', 'audio/mp3']
      });

      if (voiceUrl) {
        const result = await sendMessage(
          conversationId, 
          `Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`, 
          'voice', 
          voiceUrl
        );

        if (result) {
          console.log('Voice message sent successfully:', result.id);
          toast({
            title: "Voice message sent",
            description: "Your voice message was sent successfully",
          });
        }
      } else {
        throw new Error('Failed to upload voice message');
      }
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast({
        title: "Failed to send voice message",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
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
            const messageReactions = reactions[message.id] || [];
            const threadCount = getThreadCount(message.id);

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">
                    {isOwn ? 'Me' : 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                  <div className="relative">
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
                      {message.message_type === 'voice' && message.image_url && (
                        <div className="flex items-center gap-2 mb-2">
                          <audio 
                            controls 
                            src={message.image_url}
                            className="max-w-full"
                            onError={(e) => {
                              console.log('Audio failed to load:', message.image_url);
                            }}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      {message.content && (
                        <p className="text-sm break-words">{message.content}</p>
                      )}
                    </div>

                    {/* Message Actions - shown on hover */}
                    <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform ${isOwn ? '-translate-x-full' : 'translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleReactionButtonClick(e, message.id)}
                        >
                          <Smile className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleReplyToMessage(message)}
                          title="Reply in thread"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleReplyToMessage(message)}>
                              Reply in thread
                            </DropdownMenuItem>
                            <DropdownMenuItem>Forward</DropdownMenuItem>
                            {isOwn && <DropdownMenuItem>Edit</DropdownMenuItem>}
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Thread indicator */}
                  {threadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mt-1 h-6 text-xs ${isOwn ? 'ml-auto' : 'mr-auto'} flex items-center gap-1`}
                      onClick={() => handleReplyToMessage(message)}
                    >
                      <MessageSquare className="w-3 h-3" />
                      {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
                    </Button>
                  )}

                  {/* Message Reactions */}
                  {messageReactions.length > 0 && (
                    <MessageReactionsDisplay
                      reactions={messageReactions}
                      currentUserId={user.id}
                      onReactionToggle={(emoji) => handleReactionToggle(message.id, emoji)}
                      className={isOwn ? 'justify-end' : 'justify-start'}
                    />
                  )}
                  
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-muted-foreground">{messageTime}</span>
                    {isOwn && (
                      <MessageStatusIndicator 
                        status={message.read_at ? 'read' : 'delivered'} 
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

      {/* Thread Dialog */}
      {threadState.parentMessage && (
        <MessageThread
          parentMessageId={threadState.parentMessageId || ''}
          isOpen={threadState.isOpen}
          onClose={closeThread}
          parentMessage={threadState.parentMessage}
        />
      )}

      {/* Reaction Picker */}
      <MessageReactionsPicker
        messageId={reactionPickerState.messageId || ''}
        onReactionAdd={handleReactionAdd}
        isOpen={reactionPickerState.isOpen}
        onClose={closeReactionPicker}
        position={reactionPickerState.position || undefined}
      />

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

          {/* Voice Message Button */}
          <EnhancedMessageInput
            onSendMessage={(content, messageType, options) => 
              sendMessage(conversationId, content, messageType || 'text', options?.imageUrl)
            }
            onSendVoiceMessage={handleSendVoiceMessage}
            onFileSelect={(file) => setSelectedFile(file)}
            disabled={uploading || sendingMessage}
            placeholder={t('messaging.typeMessage') || 'Type your message...'}
            showEncryption={false}
          />

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
