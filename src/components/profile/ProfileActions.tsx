
import React from 'react';
import { Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileActions = () => {
  return (
    <div className="flex gap-2 mb-4">
      <Button className="flex-1 bg-blue-500 text-white">
        <Phone size={16} className="mr-2" />
        Contact
      </Button>
      <Button className="flex-1 bg-blue-500 text-white">
        <Heart size={16} className="mr-2" />
        Follow
      </Button>
    </div>
  );
};

export default ProfileActions;
