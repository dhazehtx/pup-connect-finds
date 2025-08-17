import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Shield } from 'lucide-react';

interface SessionWarningModalProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  warningTimeSeconds?: number;
}

const SessionWarningModal = ({ 
  isOpen, 
  onExtendSession, 
  onLogout, 
  warningTimeSeconds = 120 
}: SessionWarningModalProps) => {
  const [timeLeft, setTimeLeft] = useState(warningTimeSeconds);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(warningTimeSeconds);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout, warningTimeSeconds]);

  const progressPercentage = ((warningTimeSeconds - timeLeft) / warningTimeSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Session Expiring Soon</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Your session will expire in <strong>{minutes}:{seconds.toString().padStart(2, '0')}</strong> due to inactivity.
            Extend your session to continue using MY PUP securely.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Progress value={progressPercentage} className="h-2 mb-3" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>This security measure helps protect your account</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-gray-700 hover:bg-gray-50"
          >
            Sign Out Now
          </Button>
          <Button
            onClick={onExtendSession}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Stay Signed In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionWarningModal;