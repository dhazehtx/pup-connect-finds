
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EncryptionManagerProps {
  conversationId: string;
  isEncrypted: boolean;
  onToggleEncryption: (enabled: boolean) => void;
}

const EncryptionManager = ({ 
  conversationId, 
  isEncrypted, 
  onToggleEncryption 
}: EncryptionManagerProps) => {
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [keyInfo, setKeyInfo] = useState<{
    publicKey?: string;
    keyFingerprint?: string;
    createdAt?: Date;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    // Simulate key info loading
    if (isEncrypted) {
      setKeyInfo({
        publicKey: 'RSA-4096',
        keyFingerprint: 'A1B2C3D4E5F6',
        createdAt: new Date()
      });
    }
  }, [isEncrypted]);

  const generateKeyPair = async () => {
    setIsGeneratingKeys(true);
    
    try {
      // Simulate key generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setKeyInfo({
        publicKey: 'RSA-4096',
        keyFingerprint: 'A1B2C3D4E5F6',
        createdAt: new Date()
      });
      
      toast({
        title: "Encryption Keys Generated",
        description: "End-to-end encryption is now active for this conversation.",
      });
      
      onToggleEncryption(true);
    } catch (error) {
      toast({
        title: "Key Generation Failed",
        description: "Unable to generate encryption keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const disableEncryption = () => {
    setKeyInfo({});
    onToggleEncryption(false);
    
    toast({
      title: "Encryption Disabled",
      description: "Messages will no longer be encrypted in this conversation.",
      variant: "destructive",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEncrypted ? (
            <Shield className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldOff className="w-5 h-5 text-gray-400" />
          )}
          End-to-End Encryption
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={isEncrypted ? "default" : "secondary"}>
            {isEncrypted ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Key Information */}
        {isEncrypted && keyInfo.publicKey && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Encryption Active</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm:</span>
                <span className="font-mono">{keyInfo.publicKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fingerprint:</span>
                <span className="font-mono">{keyInfo.keyFingerprint}</span>
              </div>
              {keyInfo.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{keyInfo.createdAt.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warning for unencrypted */}
        {!isEncrypted && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Messages are not encrypted</p>
              <p className="text-yellow-700 mt-1">
                Enable encryption to secure your conversation with end-to-end protection.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!isEncrypted ? (
            <Button
              onClick={generateKeyPair}
              disabled={isGeneratingKeys}
              className="w-full"
            >
              {isGeneratingKeys ? (
                <>
                  <Key className="w-4 h-4 mr-2 animate-spin" />
                  Generating Keys...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Enable Encryption
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={generateKeyPair}
                disabled={isGeneratingKeys}
                className="w-full"
              >
                <Key className="w-4 h-4 mr-2" />
                Regenerate Keys
              </Button>
              
              <Button
                variant="destructive"
                onClick={disableEncryption}
                className="w-full"
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                Disable Encryption
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          <p>
            End-to-end encryption ensures that only you and the recipient can read your messages.
            Not even our servers can access the content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EncryptionManager;
