
// Web Crypto API utilities for end-to-end encryption
export class MessageEncryption {
  private static algorithm = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  };

  private static aesAlgorithm = {
    name: 'AES-GCM',
    length: 256,
  };

  // Generate a new RSA key pair for a user
  static async generateKeyPair(): Promise<{
    publicKey: CryptoKey;
    privateKey: CryptoKey;
    publicKeyPem: string;
    fingerprint: string;
  }> {
    const keyPair = await crypto.subtle.generateKey(
      this.algorithm,
      true,
      ['encrypt', 'decrypt']
    );

    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyPem = this.arrayBufferToPem(publicKeyBuffer, 'PUBLIC KEY');
    
    // Create fingerprint from public key
    const publicKeyHash = await crypto.subtle.digest('SHA-256', publicKeyBuffer);
    const fingerprint = Array.from(new Uint8Array(publicKeyHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      publicKeyPem,
      fingerprint
    };
  }

  // Import a public key from PEM format
  static async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    const publicKeyBuffer = this.pemToArrayBuffer(publicKeyPem, 'PUBLIC KEY');
    return await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      this.algorithm,
      false,
      ['encrypt']
    );
  }

  // Encrypt a message using hybrid encryption (RSA + AES)
  static async encryptMessage(message: string, recipientPublicKey: CryptoKey): Promise<{
    encryptedMessage: string;
    encryptedKey: string;
    iv: string;
  }> {
    // Generate AES key for message encryption
    const aesKey = await crypto.subtle.generateKey(
      this.aesAlgorithm,
      true,
      ['encrypt', 'decrypt']
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt message with AES
    const encodedMessage = new TextEncoder().encode(message);
    const encryptedMessageBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encodedMessage
    );

    // Export AES key and encrypt it with recipient's public key
    const aesKeyBuffer = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedKeyBuffer = await crypto.subtle.encrypt(
      this.algorithm,
      recipientPublicKey,
      aesKeyBuffer
    );

    return {
      encryptedMessage: this.arrayBufferToBase64(encryptedMessageBuffer),
      encryptedKey: this.arrayBufferToBase64(encryptedKeyBuffer),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  // Decrypt a message using the user's private key
  static async decryptMessage(
    encryptedMessage: string,
    encryptedKey: string,
    iv: string,
    privateKey: CryptoKey
  ): Promise<string> {
    try {
      // Decrypt AES key with private key
      const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKey);
      const aesKeyBuffer = await crypto.subtle.decrypt(
        this.algorithm,
        privateKey,
        encryptedKeyBuffer
      );

      // Import decrypted AES key
      const aesKey = await crypto.subtle.importKey(
        'raw',
        aesKeyBuffer,
        this.aesAlgorithm,
        false,
        ['decrypt']
      );

      // Decrypt message with AES key
      const encryptedMessageBuffer = this.base64ToArrayBuffer(encryptedMessage);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      
      const decryptedMessageBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        aesKey,
        encryptedMessageBuffer
      );

      return new TextDecoder().decode(decryptedMessageBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Encrypted message - unable to decrypt]';
    }
  }

  // Store private key in IndexedDB
  static async storePrivateKey(userId: string, privateKey: CryptoKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EncryptionKeys', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['privateKeys'], 'readwrite');
        const store = transaction.objectStore('privateKeys');
        
        store.put({ userId, privateKey });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('privateKeys')) {
          db.createObjectStore('privateKeys', { keyPath: 'userId' });
        }
      };
    });
  }

  // Retrieve private key from IndexedDB
  static async getPrivateKey(userId: string): Promise<CryptoKey | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EncryptionKeys', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['privateKeys'], 'readonly');
        const store = transaction.objectStore('privateKeys');
        
        const getRequest = store.get(userId);
        getRequest.onsuccess = () => {
          resolve(getRequest.result?.privateKey || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  // Utility methods
  private static arrayBufferToPem(buffer: ArrayBuffer, type: string): string {
    const base64 = this.arrayBufferToBase64(buffer);
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`;
  }

  private static pemToArrayBuffer(pem: string, type: string): ArrayBuffer {
    const base64 = pem
      .replace(`-----BEGIN ${type}-----`, '')
      .replace(`-----END ${type}-----`, '')
      .replace(/\s/g, '');
    return this.base64ToArrayBuffer(base64);
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
