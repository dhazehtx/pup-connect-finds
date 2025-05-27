
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Mail, User } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => void;
  onGuestBrowse: () => void;
}

const AuthScreen = ({ onSignIn, onGuestBrowse }: AuthScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-cloud-white border-soft-sky shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-royal-blue rounded-full flex items-center justify-center">
            <Heart size={32} className="text-cloud-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-deep-navy">Welcome to MY PUP</CardTitle>
          <p className="text-deep-navy/70">Join our community of dog lovers</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Social Login Options */}
          <div className="space-y-3">
            <Button
              onClick={onSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail size={18} className="mr-2" />
              Continue with Google
            </Button>
            
            <Button
              onClick={onSignIn}
              variant="outline"
              className="w-full border-gray-300 text-deep-navy hover:bg-gray-50"
            >
              <User size={18} className="mr-2" />
              Continue with Facebook
            </Button>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cloud-white px-2 text-sm text-deep-navy/60">
              or
            </span>
          </div>

          {/* Email/Password Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-deep-navy">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-deep-navy">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>

            <Button
              onClick={onSignIn}
              className="w-full bg-royal-blue hover:bg-royal-blue/90 text-cloud-white"
            >
              Sign In
            </Button>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cloud-white px-2 text-sm text-deep-navy/60">
              Just browsing?
            </span>
          </div>

          {/* Guest Browse Option */}
          <Button
            onClick={onGuestBrowse}
            variant="ghost"
            className="w-full text-royal-blue hover:bg-royal-blue/10"
          >
            Continue as Guest
          </Button>

          <p className="text-xs text-center text-deep-navy/60 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
