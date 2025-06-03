
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageEncryption } from '@/utils/encryption';
import { useToast } from '@/hooks/use-toast';

export const useEncryption = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKeys, setPublicKeys] = useState<Map<string, CryptoKey>>(new Map());
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize encryption for the current user
  const initializeEncryption = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user already has encryption keys
      const { data: existingKeys } = await supabase
        .from('user_encryption_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingKeys) {
        // Load existing private key from IndexedDB
        const storedPrivateKey = await MessageEncryption.getPrivateKey(user.id);
        if (storedPrivateKey) {
          setPrivateKey(storedPrivateKey);
          setIsInitialized(true);
          return;
        }
      }

      // Generate new key pair
      const keyPair = await MessageEncryption.generateKeyPair();
      
      // Store private key locally
      await MessageEncryption.storePrivateKey(user.id, keyPair.privateKey);
      
      // Store public key in database
      await supabase
        .from('user_encryption_keys')
        .upsert({
          user_id: user.id,
          public_key: keyPair.publicKeyPem,
          key_fingerprint: keyPair.fingerprint,
          is_active: true
        });

      setPrivateKey(keyPair.privateKey);
      setIsInitialized(true);

      toast({
        title: "Encryption initialized",
        description: "Your messages are now end-to-end encrypted",
      });
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      toast({
        title: "Encryption setup failed",
        description: "Unable to set up message encryption",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Get public key for a user
  const getPublicKey = useCallback(async (userId: string): Promise<CryptoKey | null> => {
    if (publicKeys.has(userId)) {
      return publicKeys.get(userId)!;
    }

    try {
      const { data } = await supabase
        .from('user_encryption_keys')
        .select('public_key')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (data?.public_key) {
        const publicKey = await MessageEncryption.importPublicKey(data.public_key);
        setPublicKeys(prev => new Map(prev).set(userId, publicKey));
        return publicKey;
      }
    } catch (error) {
      console.error('Failed to get public key:', error);
    }

    return null;
  }, [publicKeys]);

  // Encrypt a message for a recipient
  const encryptMessage = useCallback(async (message: string, recipientId: string) => {
    const recipientPublicKey = await getPublicKey(recipientId);
    if (!recipientPublicKey) {
      throw new Error('Recipient public key not found');
    }

    return await MessageEncryption.encryptMessage(message, recipientPublicKey);
  }, [getPublicKey]);

  // Decrypt a message
  const decryptMessage = useCallback(async (
    encryptedMessage: string,
    encryptedKey: string,
    iv: string
  ): Promise<string> => {
    if (!privateKey) {
      throw new Error('Private key not available');
    }

    return await MessageEncryption.decryptMessage(
      encryptedMessage,
      encryptedKey,
      iv,
      privateKey
    );
  }, [privateKey]);

  // Initialize encryption when user logs in
  useEffect(() => {
    if (user && !isInitialized) {
      initializeEncryption();
    }
  }, [user, isInitialized, initializeEncryption]);

  return {
    isInitialized,
    encryptMessage,
    decryptMessage,
    initializeEncryption
  };
};
