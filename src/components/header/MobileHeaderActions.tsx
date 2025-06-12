
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileHeaderActionsProps {
  isAuthenticated: boolean;
  user: any;
  isGuest: boolean;
  onSignOut: () => void;
}

const MobileHeaderActions = ({ 
  isAuthenticated, 
  user, 
  isGuest, 
  onSignOut 
}: MobileHeaderActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-3">
      <LanguageSelector />
      
      {isAuthenticated && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && (
              <>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isGuest && (
              <>
                <DropdownMenuItem onClick={() => navigate('/auth')}>
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onSignOut}>
              {user ? 'Sign Out' : 'Exit Guest Mode'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {!isAuthenticated && (
        <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
          <User className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default MobileHeaderActions;
