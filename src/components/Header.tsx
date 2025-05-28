
import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left spacer for balance */}
        <div className="w-16"></div>

        {/* Centered Logo */}
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-royal-blue rounded-full flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-6 h-6 text-cloud-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 2.8 6.5 2 5 2C3.3 2 2 3.3 2 5C2 6.7 3.3 8 5 8C5.3 8 5.6 8 5.9 7.9C6.8 10.1 9.2 11.5 12 11.5C14.8 11.5 17.2 10.1 18.1 7.9C18.4 8 18.7 8 19 8C20.7 8 22 6.7 22 5C22 3.3 20.7 2 19 2C17.5 2 16.2 2.8 15.5 4C14.8 2.8 13.5 2 12 2Z" 
                  fill="currentColor"
                />
                <ellipse cx="12" cy="16" rx="8" ry="4" fill="currentColor" opacity="0.8"/>
                <circle cx="9" cy="14" r="1" fill="white"/>
                <circle cx="15" cy="14" r="1" fill="white"/>
                <path d="M12 15.5C11.5 15.5 11 15.7 11 16C11 16.3 11.5 16.5 12 16.5C12.5 16.5 13 16.3 13 16C13 15.7 12.5 15.5 12 15.5Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-deep-navy text-xl">MY PUP</span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-sunset-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="bg-royal-blue text-white">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Welcome to MY PUP
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
