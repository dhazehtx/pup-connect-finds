
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationSystem } from '@/hooks/useVerificationSystem';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationProps {
  currentStatus?: any;
}

const PhoneVerification = ({ currentStatus }: PhoneVerificationProps) => {
  const { user } = useAuth();
  const { submitVerificationRequest, loading } = useVerificationSystem();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    // Simulate sending verification code
    setCodeSent(true);
    toast({
      title: "Verification Code Sent",
      description: `A verification code has been sent to ${phoneNumber}`,
    });
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Verification Code Required",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    
    try {
      // Simulate code verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await submitVerificationRequest('phone', {
        contactVerification: {
          phone: phoneNumber,
          verified: true,
          verifiedAt: new Date().toISOString()
        }
      });

      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified",
      });
    } catch (error) {
      console.error('Error verifying phone:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  if (currentStatus?.status === 'approved') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Phone Verified!
            </h3>
            <p className="text-gray-600">
              Your phone number has been successfully verified
            </p>
            {currentStatus.contact_verification?.phone && (
              <p className="text-sm text-gray-500 mt-2">
                Verified: {currentStatus.contact_verification.phone}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus?.status === 'pending' || currentStatus?.status === 'in_review') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">
              Verification Pending
            </h3>
            <p className="text-gray-600">
              Your phone verification is being processed.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Submitted on {new Date(currentStatus.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="text-blue-600" />
          Phone Verification
        </CardTitle>
        <p className="text-gray-600">
          Verify your phone number for secure communication and account recovery
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-w-md mx-auto space-y-4">
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={codeSent}
            />
          </div>

          {!codeSent ? (
            <Button 
              onClick={handleSendCode} 
              disabled={loading || !phoneNumber}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Verification Code
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={verifying || !verificationCode}
                  className="flex-1"
                >
                  {verifying ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCodeSent(false);
                    setVerificationCode('');
                  }}
                >
                  Change Number
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Didn't receive the code? 
                <button 
                  className="text-blue-600 hover:underline ml-1"
                  onClick={handleSendCode}
                >
                  Resend
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Why verify your phone?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enable two-factor authentication for enhanced security</li>
            <li>• Receive important account notifications via SMS</li>
            <li>• Allow buyers to contact you directly</li>
            <li>• Required for certain premium features</li>
            <li>• Helps with account recovery if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;
