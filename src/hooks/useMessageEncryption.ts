
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EncryptionResult {
  encryptedContent: string;
  keyId: string;
}

export const useMessageEncryption = () => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Simple encryption for demo purposes - in production, use proper crypto libraries
  const generateKey = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const encryptMessage = async (content: string): Promise<EncryptionResult | null> => {
    if (!user) return null;

    setIsEncrypting(true);
    try {
      // Generate a unique key for this message
      const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simple XOR encryption for demo (use proper encryption in production)
      const key = generateKey();
      const encryptedContent = btoa(
        content.split('').map((char, index) => 
          String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
        ).join('')
      );

      // In production, store the key securely (e.g., in a key management service)
      localStorage.setItem(`encryption_key_${keyId}`, key);

      return {
        encryptedContent,
        keyId
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      toast({
        title: "Encryption failed",
        description: "Unable to encrypt message",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsEncrypting(false);
    }
  };

  const decryptMessage = async (encryptedContent: string, keyId: string): Promise<string | null> => {
    try {
      // Retrieve the key (in production, this would be from a secure key store)
      const key = localStorage.getItem(`encryption_key_${keyId}`);
      if (!key) {
        console.error('Decryption key not found');
        return 'Message could not be decrypted';
      }

      // Decrypt using XOR
      const decryptedContent = atob(encryptedContent)
        .split('')
        .map((char, index) => 
          String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length))
        )
        .join('');

      return decryptedContent;
    } catch (error) {
      console.error('Decryption failed:', error);
      return 'Message could not be decrypted';
    }
  };

  return {
    encryptMessage,
    decryptMessage,
    isEncrypting
  };
};
