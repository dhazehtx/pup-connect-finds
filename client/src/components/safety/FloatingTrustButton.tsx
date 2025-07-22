
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TrustSafetyPanel from './TrustSafetyPanel';

const FloatingTrustButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg"
            size="icon"
          >
            <Shield className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trust & Safety Center</DialogTitle>
          </DialogHeader>
          <TrustSafetyPanel />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FloatingTrustButton;
