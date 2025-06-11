
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Shield } from 'lucide-react';
import EncryptionManager from '../EncryptionManager';

interface EncryptionControlProps {
  conversationId: string;
  isEncrypted: boolean;
  onToggleEncryption: (enabled: boolean) => void;
}

const EncryptionControl = ({ conversationId, isEncrypted, onToggleEncryption }: EncryptionControlProps) => {
  const [showEncryption, setShowEncryption] = useState(false);

  return (
    <Popover open={showEncryption} onOpenChange={setShowEncryption}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className={`w-4 h-4 ${isEncrypted ? 'text-green-600' : 'text-gray-400'}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <EncryptionManager
          conversationId={conversationId}
          isEncrypted={isEncrypted}
          onToggleEncryption={onToggleEncryption}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EncryptionControl;
