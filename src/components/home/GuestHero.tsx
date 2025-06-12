
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const GuestHero = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Heart size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to MY PUP! 🐕
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find your perfect companion from trusted breeders and connect with fellow dog lovers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md"
            asChild
          >
            <Link to="/auth">
              Sign Up Free
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border-2 border-gray-300"
            asChild
          >
            <Link to="/explore">
              Browse Dogs
            </Link>
          </Button>
        </div>

        {/* Guest Access */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-3 text-gray-500 font-medium">Just browsing?</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full text-gray-600 hover:text-gray-800 hover:bg-transparent underline"
          asChild
        >
          <Link to="/explore">
            Continue as Guest
          </Link>
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default GuestHero;
