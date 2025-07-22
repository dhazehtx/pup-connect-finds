
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DesktopUserMenuProps {
  isAuthenticated: boolean;
  user: any;
  isGuest: boolean;
  onSignOut: () => void;
}

const DesktopUserMenu = ({ 
  isAuthenticated, 
  user, 
  isGuest, 
  onSignOut 
}: DesktopUserMenuProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-4">
      <LanguageSelector />
      
      {!isAuthenticated ? (
        <div className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-gray-700 hover:text-blue-600"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign Up
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User size={16} />
              <span className="hidden md:inline">
                {user ? (user.email?.split('@')[0] || 'User') : 'Guest'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border shadow-lg">
            {user && (
              <>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isGuest && (
              <>
                <DropdownMenuItem onClick={() => navigate('/auth')}>
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {user ? 'Sign Out' : 'Exit Guest Mode'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default DesktopUserMenu;
