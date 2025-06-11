
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MoreVertical, Search, Shield, Phone } from 'lucide-react';

interface MoreOptionsControlProps {
  onSearchClick: () => void;
  onEncryptionClick: () => void;
  onVideoCallClick: () => void;
}

const MoreOptionsControl = ({ onSearchClick, onEncryptionClick, onVideoCallClick }: MoreOptionsControlProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onSearchClick}
          >
            <Search className="w-4 h-4 mr-2" />
            Search Messages
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onEncryptionClick}
          >
            <Shield className="w-4 h-4 mr-2" />
            Encryption Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onVideoCallClick}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call Options
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MoreOptionsControl;
