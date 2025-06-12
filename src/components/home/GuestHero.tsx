
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GuestHero = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MY PUP! 🐕
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Find your perfect companion from trusted breeders and connect with fellow dog lovers
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" asChild>
            <Link to="/explore">
              Browse Dogs
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth">
              Sign Up Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestHero;
