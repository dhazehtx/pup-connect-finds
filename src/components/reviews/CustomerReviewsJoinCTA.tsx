
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CustomerReviewsJoinCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-16 text-center">
      <Card className="bg-royal-blue/10 border-royal-blue">
        <CardContent className="p-8">
          <h3 className="text-2xl font-semibold text-black mb-4">
            Join Our Growing Community
          </h3>
          <p className="text-black/70 mb-6 max-w-2xl mx-auto">
            Ready to find your perfect puppy companion? Browse our verified breeders 
            and discover why families trust MY PUP to help them find their new best friend.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/explore')}
              className="bg-royal-blue text-white hover:bg-royal-blue/90"
            >
              Browse Puppies
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/help')}
              className="border-royal-blue text-black hover:bg-royal-blue/20"
            >
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReviewsJoinCTA;
