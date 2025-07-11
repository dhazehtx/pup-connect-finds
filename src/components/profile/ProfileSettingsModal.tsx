
import React from 'react';
import { Settings, Edit, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileSettingsModalProps {
  onEditProfile: () => void;
}

const ProfileSettingsModal = ({ onEditProfile }: ProfileSettingsModalProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('guestMode');
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out",
        variant: "destructive",
      });
    }
  };

  const settingsItems = [
    {
      icon: Edit,
      label: 'Edit Profile',
      action: onEditProfile,
    },
    {
      icon: CreditCard,
      label: 'Manage Subscription',
      action: () => toast({ title: 'Coming Soon', description: 'Subscription management will be available soon' }),
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      action: () => toast({ title: 'Coming Soon', description: 'Help center will be available soon' }),
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {settingsItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start h-12 px-4"
              onClick={item.action}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          ))}
          <div className="pt-4 mt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSettingsModal;
