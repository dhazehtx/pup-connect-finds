
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from './useEncryption';
import { useToast } from '@/hooks/use-toast';

export const useEncryptedMessaging = () => {
  const { user } = useAuth();
  const { encryptMessage, decryptMessage, isInitialized } = useEncryption();
  const { toast } = useToast();

  // Send an encrypted message
  const sendEncryptedMessage = useCallback(async (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    imageUrl?: string,
    recipientId?: string
  ) => {
    if (!user || !isInitialized) {
      throw new Error('Encryption not initialized');
    }

    if (!recipientId) {
      // Get recipient ID from conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('buyer_id, seller_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      recipientId = conversation.buyer_id === user.id 
        ? conversation.seller_id 
        : conversation.buyer_id;
    }

    try {
      // Encrypt the message content
      const encrypted = await encryptMessage(content, recipientId);

      // Store encrypted message in database
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content: null, // Clear text content is null for encrypted messages
          encrypted_content: JSON.stringify({
            message: encrypted.encryptedMessage,
            key: encrypted.encryptedKey,
            iv: encrypted.iv
          }),
          message_type: messageType,
          image_url: imageUrl,
          is_encrypted: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to send encrypted message:', error);
      toast({
        title: "Failed to send message",
        description: "Unable to encrypt and send message",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, isInitialized, encryptMessage, toast]);

  // Decrypt a received message
  const decryptReceivedMessage = useCallback(async (message: any): Promise<string> => {
    if (!message.is_encrypted || !message.encrypted_content) {
      return message.content || '';
    }

    try {
      const encryptedData = JSON.parse(message.encrypted_content);
      return await decryptMessage(
        encryptedData.message,
        encryptedData.key,
        encryptedData.iv
      );
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      return '[Encrypted message - unable to decrypt]';
    }
  }, [decryptMessage]);

  return {
    sendEncryptedMessage,
    decryptReceivedMessage,
    isEncryptionReady: isInitialized
  };
};
