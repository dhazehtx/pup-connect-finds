
// Message encryption utilities using Web Crypto API
export class MessageEncryption {
  private static readonly ALGORITHM = 'RSA-OAEP';
  private static readonly KEY_SIZE = 2048;
  private static readonly HASH = 'SHA-256';

  // Generate RSA key pair for end-to-end encryption
  static async generateKeyPair(): Promise<{
    publicKey: CryptoKey;
    privateKey: CryptoKey;
    publicKeyPem: string;
    fingerprint: string;
  }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        modulusLength: this.KEY_SIZE,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: this.HASH,
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyPem = this.arrayBufferToBase64(publicKeyBuffer);
    const fingerprint = await this.generateFingerprint(publicKeyBuffer);

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      publicKeyPem,
      fingerprint
    };
  }

  // Import public key from PEM format
  static async importPublicKey(pemKey: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(pemKey);
    return await window.crypto.subtle.importKey(
      'spki',
      keyBuffer,
      {
        name: this.ALGORITHM,
        hash: this.HASH,
      },
      true,
      ['encrypt']
    );
  }

  // Encrypt message with recipient's public key
  static async encryptMessage(
    message: string,
    recipientPublicKey: CryptoKey
  ): Promise<{
    encryptedMessage: string;
    encryptedKey: string;
    iv: string;
  }> {
    // Generate AES key for message encryption
    const aesKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt message with AES
    const encodedMessage = new TextEncoder().encode(message);
    const encryptedMessageBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encodedMessage
    );

    // Export AES key and encrypt with RSA
    const aesKeyBuffer = await window.crypto.subtle.exportKey('raw', aesKey);
    const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
      { name: this.ALGORITHM },
      recipientPublicKey,
      aesKeyBuffer
    );

    return {
      encryptedMessage: this.arrayBufferToBase64(encryptedMessageBuffer),
      encryptedKey: this.arrayBufferToBase64(encryptedKeyBuffer),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  // Decrypt message with private key
  static async decryptMessage(
    encryptedMessage: string,
    encryptedKey: string,
    iv: string,
    privateKey: CryptoKey
  ): Promise<string> {
    // Decrypt AES key with RSA
    const encryptedKeyBuffer = this.base64ToArrayBuffer(encryptedKey);
    const aesKeyBuffer = await window.crypto.subtle.decrypt(
      { name: this.ALGORITHM },
      privateKey,
      encryptedKeyBuffer
    );

    // Import AES key
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      aesKeyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decrypt message
    const encryptedMessageBuffer = this.base64ToArrayBuffer(encryptedMessage);
    const ivBuffer = this.base64ToArrayBuffer(iv);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      aesKey,
      encryptedMessageBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  // Store private key in IndexedDB
  static async storePrivateKey(userId: string, privateKey: CryptoKey): Promise<void> {
    const request = indexedDB.open('MessageEncryption', 1);
    
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const db = request.result;
        const transaction = db.transaction(['keys'], 'readwrite');
        const store = transaction.objectStore('keys');
        
        const exportedKey = await window.crypto.subtle.exportKey('jwk', privateKey);
        store.put({ userId, privateKey: exportedKey });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore('keys', { keyPath: 'userId' });
      };
    });
  }

  // Retrieve private key from IndexedDB
  static async getPrivateKey(userId: string): Promise<CryptoKey | null> {
    const request = indexedDB.open('MessageEncryption', 1);
    
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['keys'], 'readonly');
        const store = transaction.objectStore('keys');
        const getRequest = store.get(userId);
        
        getRequest.onsuccess = async () => {
          if (getRequest.result) {
            try {
              const privateKey = await window.crypto.subtle.importKey(
                'jwk',
                getRequest.result.privateKey,
                {
                  name: this.ALGORITHM,
                  hash: this.HASH,
                },
                false,
                ['decrypt']
              );
              resolve(privateKey);
            } catch (error) {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        getRequest.onerror = () => resolve(null);
      };
    });
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  private static async generateFingerprint(publicKeyBuffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', publicKeyBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  }
}
