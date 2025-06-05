
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Share2, Copy, Mail } from 'lucide-react';

interface ShareOptionsProps {
  onShareToMessages: () => void;
  onShareToPhone: () => void;
  onShareToEmail: () => void;
  onShareToOtherApps: () => void;
  onCopyLink: () => void;
}

const ShareOptions = ({
  onShareToMessages,
  onShareToPhone,
  onShareToEmail,
  onShareToOtherApps,
  onCopyLink
}: ShareOptionsProps) => {
  return (
    <div className="space-y-4">
      {/* Quick Share Options */}
      <div className="grid grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={onShareToMessages}
        >
          <MessageCircle size={24} />
          <span className="text-xs">Messages</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={onShareToPhone}
        >
          <Phone size={24} />
          <span className="text-xs">SMS</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={onShareToEmail}
        >
          <Mail size={24} />
          <span className="text-xs">Email</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-3"
          onClick={onShareToOtherApps}
        >
          <Share2 size={24} />
          <span className="text-xs">More</span>
        </Button>
      </div>

      {/* Copy Link */}
      <div className="border-t pt-4">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={onCopyLink}
        >
          <Copy size={16} />
          Copy Link
        </Button>
      </div>
    </div>
  );
};

export default ShareOptions;
