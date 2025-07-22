
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff } from 'lucide-react';

interface ChatControlsProps {
  encryptionEnabled: boolean;
  onToggleEncryption: () => void;
}

const ChatControls = ({ encryptionEnabled, onToggleEncryption }: ChatControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleEncryption}
      >
        {encryptionEnabled ? (
          <Shield className="w-4 h-4 text-green-500" />
        ) : (
          <ShieldOff className="w-4 h-4 text-gray-400" />
        )}
      </Button>
    </div>
  );
};

export default ChatControls;
