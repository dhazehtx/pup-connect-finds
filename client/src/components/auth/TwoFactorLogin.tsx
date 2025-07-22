
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorLoginProps {
  onVerify: (code: string) => Promise<void>;
  onBackupCodeVerify: (code: string) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const TwoFactorLogin = ({ onVerify, onBackupCodeVerify, onBack, loading }: TwoFactorLoginProps) => {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter a valid code');
      return;
    }
    
    setError(null);
    try {
      if (useBackupCode) {
        await onBackupCodeVerify(code);
      } else {
        await onVerify(code);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {useBackupCode ? (
            <>
              <Shield className="h-5 w-5" />
              Enter Backup Code
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="2fa-code">
              {useBackupCode ? 'Backup Code' : 'Authentication Code'}
            </Label>
            <Input
              id="2fa-code"
              placeholder={useBackupCode ? "Enter backup code" : "000000"}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, useBackupCode ? 8 : 6))}
              className={`text-center text-lg tracking-widest ${useBackupCode ? '' : 'font-mono'}`}
              disabled={loading}
              autoFocus
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {useBackupCode ? (
              <p>Enter one of your backup codes to sign in.</p>
            ) : (
              <p>Enter the 6-digit code from your authenticator app.</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Button type="submit" disabled={loading || !code} className="w-full">
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setUseBackupCode(!useBackupCode)}
              disabled={loading}
              className="w-full"
            >
              {useBackupCode ? 'Use authenticator app instead' : 'Use backup code instead'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
              className="w-full"
            >
              Back to Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TwoFactorLogin;
