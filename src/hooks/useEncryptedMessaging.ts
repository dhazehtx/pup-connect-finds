
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Message } from '@/types/messaging';

export const useEncryptedMessaging = () => {
  const { user } = useAuth();
  const { sendMessage } = useRealtimeMessages();
  const [encryptionKeys, setEncryptionKeys] = useState<Map<string, CryptoKey>>(new Map());
  const [isEncryptionReady, setIsEncryptionReady] = useState(false);

  // Initialize encryption
  useEffect(() => {
    if (user) {
      initializeEncryption();
    }
  }, [user]);

  const initializeEncryption = async () => {
    try {
      // Generate or retrieve encryption key for the user
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      setEncryptionKeys(prev => new Map(prev.set(user?.id || '', key)));
      setIsEncryptionReady(true);
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
    }
  };

  const encryptMessage = async (message: string, recipientId: string): Promise<{ encryptedContent: string; keyId: string } | null> => {
    try {
      const key = encryptionKeys.get(user?.id || '');
      if (!key) return null;

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const encryptedArray = new Uint8Array(encryptedData);
      const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
      combinedArray.set(iv);
      combinedArray.set(encryptedArray, iv.length);

      const encryptedContent = btoa(String.fromCharCode(...combinedArray));
      
      return {
        encryptedContent,
        keyId: user?.id || ''
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  const decryptMessage = async (encryptedContent: string, keyId: string): Promise<string> => {
    try {
      const key = encryptionKeys.get(keyId);
      if (!key) throw new Error('Decryption key not found');

      const combinedArray = Uint8Array.from(atob(encryptedContent), c => c.charCodeAt(0));
      const iv = combinedArray.slice(0, 12);
      const encryptedData = combinedArray.slice(12);

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  };

  const sendEncryptedMessage = async (
    conversationId: string,
    content: string,
    messageType: string = 'text',
    imageUrl?: string,
    recipientId?: string
  ) => {
    if (!recipientId) {
      throw new Error('Recipient ID required for encrypted messaging');
    }

    const encrypted = await encryptMessage(content, recipientId);
    if (!encrypted) {
      throw new Error('Failed to encrypt message');
    }

    return sendMessage(conversationId, content, messageType, imageUrl);
  };

  const decryptReceivedMessage = async (message: Message): Promise<string> => {
    if (!message.is_encrypted || !message.encrypted_content) {
      return message.content;
    }

    return decryptMessage(message.encrypted_content, message.encryption_key_id || '');
  };

  return {
    sendEncryptedMessage,
    decryptReceivedMessage,
    isEncryptionReady,
    encryptMessage,
    decryptMessage
  };
};
