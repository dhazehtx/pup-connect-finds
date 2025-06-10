
import { useState, useCallback } from 'react';

interface EncryptionKey {
  id: string;
  key: string;
  created_at: string;
}

interface EncryptionResult {
  encryptedContent: string;
  keyId: string;
}

export const useMessageEncryption = () => {
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [currentKey, setCurrentKey] = useState<EncryptionKey | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const generateKey = useCallback((): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }, []);

  const encryptMessage = useCallback(async (message: string, key?: string): Promise<EncryptionResult | null> => {
    if (!encryptionEnabled || !message) return null;
    
    setIsEncrypting(true);
    const encryptionKey = key || currentKey?.key || generateKey();
    
    try {
      // Simple encryption for demo - in production use proper crypto libraries
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const keyData = encoder.encode(encryptionKey.slice(0, 16));
      
      const encrypted = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ keyData[i % keyData.length];
      }
      
      const encryptedContent = btoa(String.fromCharCode(...encrypted));
      
      return {
        encryptedContent,
        keyId: currentKey?.id || 'default'
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, [encryptionEnabled, currentKey, generateKey]);

  const decryptMessage = useCallback(async (encryptedMessage: string, key?: string): Promise<string> => {
    if (!encryptionEnabled || !encryptedMessage) return encryptedMessage;
    
    const decryptionKey = key || currentKey?.key;
    if (!decryptionKey) return encryptedMessage;
    
    try {
      const data = new Uint8Array(atob(encryptedMessage).split('').map(char => char.charCodeAt(0)));
      const encoder = new TextEncoder();
      const keyData = encoder.encode(decryptionKey.slice(0, 16));
      
      const decrypted = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) {
        decrypted[i] = data[i] ^ keyData[i % keyData.length];
      }
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedMessage;
    }
  }, [encryptionEnabled, currentKey]);

  const createEncryptionKey = useCallback(async (conversationId: string): Promise<EncryptionKey> => {
    const key: EncryptionKey = {
      id: `key_${Date.now()}`,
      key: generateKey(),
      created_at: new Date().toISOString()
    };
    
    setCurrentKey(key);
    return key;
  }, [generateKey]);

  const toggleEncryption = useCallback(() => {
    setEncryptionEnabled(prev => !prev);
  }, []);

  return {
    encryptionEnabled,
    currentKey,
    isEncrypting,
    encryptMessage,
    decryptMessage,
    createEncryptionKey,
    toggleEncryption
  };
};
