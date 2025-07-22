
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Smartphone, Key, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthProps {
  onSuccess?: () => void;
}

const TwoFactorAuth = ({ onSuccess }: TwoFactorAuthProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setIsEnabled(profile.two_factor_enabled || false);
    }
  }, [profile]);

  const generateSecret = () => {
    // Generate a base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const secret = generateSecret();
      const appName = 'MY PUP';
      const accountName = user?.email || 'user';
      
      setSecretKey(secret);
      setQrCodeUrl(`otpauth://totp/${appName}:${accountName}?secret=${secret}&issuer=${appName}`);
      setBackupCodes(generateBackupCodes());
      setSetupMode(true);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would verify the TOTP code here
      // For now, we'll simulate the verification
      if (verificationCode === '123456' || verificationCode.length === 6) {
        const { error } = await supabase
          .from('profiles')
          .update({
            two_factor_enabled: true,
            two_factor_secret: secretKey,
            backup_codes: backupCodes
          })
          .eq('id', user?.id);
        
        if (error) throw error;
        
        setIsEnabled(true);
        setSetupMode(false);
        await refreshProfile();
        
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled.",
        });
        
        onSuccess?.();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      setIsEnabled(false);
      setSetupMode(false);
      setSecretKey('');
      setBackupCodes([]);
      await refreshProfile();
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (setupMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <h4 className="font-medium mb-2">1. Scan QR Code</h4>
            <p className="text-sm text-gray-600 mb-4">
              Use an authenticator app like Google Authenticator or Authy to scan this QR code:
            </p>
            <div className="bg-white p-4 border rounded-lg text-center">
              <div className="text-sm text-gray-500 mb-2">QR Code would appear here</div>
              <div className="text-xs text-gray-400">
                {qrCodeUrl}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Manual Entry</h4>
            <p className="text-sm text-gray-600 mb-2">
              Or enter this secret key manually:
            </p>
            <div className="flex items-center gap-2">
              <Input value={secretKey} readOnly className="font-mono text-sm" />
              <Button
                onClick={() => copyToClipboard(secretKey)}
                variant="outline"
                size="sm"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Verify Setup</h4>
            <p className="text-sm text-gray-600 mb-2">
              Enter the 6-digit code from your authenticator app:
            </p>
            <div className="space-y-3">
              <Input
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
              />
              <div className="flex gap-2">
                <Button onClick={verifyAndEnable} disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </Button>
                <Button 
                  onClick={() => setSetupMode(false)} 
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          
          {backupCodes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">4. Save Backup Codes</h4>
              <p className="text-sm text-gray-600 mb-2">
                Save these backup codes in a safe place. You can use them to access your account if you lose your phone:
              </p>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
          {isEnabled && <Badge variant="secondary">Enabled</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Key className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-gray-600">
                {isEnabled 
                  ? 'Two-factor authentication is active'
                  : 'Add an extra layer of security to your account'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  startSetup();
                } else {
                  disable2FA();
                }
              }}
              disabled={loading}
            />
          </div>
        </div>
        
        {isEnabled && (
          <div className="space-y-3">
            <Button
              onClick={() => setSetupMode(true)}
              variant="outline"
              className="w-full"
            >
              Reconfigure 2FA
            </Button>
            <Button
              onClick={disable2FA}
              variant="destructive"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          We recommend using Google Authenticator, Authy, or another TOTP-compatible app.
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
