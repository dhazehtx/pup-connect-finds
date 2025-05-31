
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { useEnhancedFileUpload } from '@/hooks/useEnhancedFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  listingId?: string;
}

const EnhancedChatInterface = ({ conversationId, otherUserId, listingId }: EnhancedChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage, markAsRead } = useRealtimeMessaging();
  const { uploadFile, uploading } = useEnhancedFileUpload();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
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
    if ((!newMessage.trim() && !selectedFile) || !user) return;

    let imageUrl: string | undefined;

    // Upload file if selected
    if (selectedFile) {
      imageUrl = await uploadFile(selectedFile, {
        bucket: 'dog-images',
        folder: 'messages',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 800,
        maxHeight: 600
      }) || undefined;
    }

    // Send message
    await sendMessage(
      conversationId,
      newMessage.trim() || (selectedFile ? 'Image' : ''),
      selectedFile ? 'image' : 'text',
      imageUrl
    );

    // Clear inputs
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {isOwn ? 'Y' : 'T'}
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
                    />
                  )}
                  {message.content && (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{messageTime}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Selected: {selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t">
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
            disabled={uploading}
          >
            <Image size={16} />
          </Button>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={uploading}
          />

          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedFile) || uploading}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
