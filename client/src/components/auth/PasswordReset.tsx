
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PasswordResetProps {
  onBack: () => void;
}

const PasswordReset = ({ onBack }: PasswordResetProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="border border-gray-200 shadow-sm rounded-none bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="text-center">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Check your email and click the link to reset your password.
            </p>
          </div>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm rounded-none bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 text-center">Reset Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading || !email} 
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button 
            type="button"
            onClick={onBack} 
            variant="ghost" 
            className="w-full text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordReset;
