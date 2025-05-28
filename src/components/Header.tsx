
import React from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-cloud-white border-b border-soft-sky sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Left spacer for balance */}
        <div className="w-16"></div>

        {/* Centered Logo */}
        <div className="flex items-center justify-center flex-1">
          <img 
            src="/lovable-uploads/252c4abe-53d4-48e1-a356-bf715001c720.png" 
            alt="MY PUP Logo" 
            className="h-16 w-auto object-contain mix-blend-multiply"
            style={{ filter: 'contrast(1.1) brightness(1.1)' }}
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 bg-sunset-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu - Hamburger Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Menu size={28} className="text-deep-navy" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-4">
                <p className="text-base font-medium leading-none">{user?.email}</p>
                <p className="text-sm leading-none text-muted-foreground">
                  Welcome to MY PUP
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="py-3 px-4">
                <User className="mr-3 h-5 w-5" />
                <span className="text-base">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="py-3 px-4">
                <User className="mr-3 h-5 w-5" />
                <span className="text-base">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="py-3 px-4">
                <LogOut className="mr-3 h-5 w-5" />
                <span className="text-base">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
