
import React from 'react';
import { Bell, User, LogOut, Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GuestPrompt from './GuestPrompt';
import { useState } from 'react';

const Header = () => {
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNotificationClick = () => {
    if (!user && !isGuest) {
      setShowGuestPrompt(true);
      return;
    }
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    if (!user && !isGuest) {
      setShowGuestPrompt(true);
      return;
    }
    if (isGuest) {
      setShowGuestPrompt(true);
      return;
    }
    navigate('/profile');
  };

  return (
    <>
      <header className="bg-cloud-white border-b border-soft-sky sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Left spacer for balance */}
          <div className="w-16"></div>

          {/* Centered Logo */}
          <div className="flex items-center justify-center flex-1 cursor-pointer" onClick={() => navigate('/')}>
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
            <button 
              className="relative p-2 hover:bg-transparent focus:outline-none"
              onClick={handleNotificationClick}
            >
              <Bell size={24} className="text-deep-navy" />
              {user && (
                <span className="absolute -top-1 -right-1 bg-sunset-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              )}
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 p-2 hover:bg-transparent focus:outline-none">
                  <Menu size={28} className="text-deep-navy" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white" align="end" forceMount>
                {user ? (
                  <>
                    <div className="flex flex-col space-y-1 p-4">
                      <p className="text-base font-medium leading-none text-black">{user.email}</p>
                      <p className="text-sm leading-none text-gray-600">
                        Welcome to MY PUP
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="py-3 px-4 text-black hover:bg-gray-100">
                      <User className="mr-3 h-5 w-5 text-black" />
                      <span className="text-base text-black">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="py-3 px-4 text-black hover:bg-gray-100">
                      <User className="mr-3 h-5 w-5 text-black" />
                      <span className="text-base text-black">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="py-3 px-4 text-black hover:bg-gray-100">
                      <LogOut className="mr-3 h-5 w-5 text-black" />
                      <span className="text-base text-black">Sign out</span>
                    </DropdownMenuItem>
                  </>
                ) : isGuest ? (
                  <>
                    <div className="flex flex-col space-y-1 p-4">
                      <p className="text-base font-medium leading-none text-black">Guest User</p>
                      <p className="text-sm leading-none text-gray-600">
                        Browsing as guest
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/auth')} className="py-3 px-4 text-black hover:bg-gray-100">
                      <LogIn className="mr-3 h-5 w-5 text-black" />
                      <span className="text-base text-black">Sign In / Sign Up</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleProfileClick} className="py-3 px-4 text-gray-400 cursor-not-allowed">
                      <User className="mr-3 h-5 w-5 text-gray-400" />
                      <span className="text-base text-gray-400">Profile (Sign in required)</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col space-y-1 p-4">
                      <p className="text-base font-medium leading-none text-black">Welcome!</p>
                      <p className="text-sm leading-none text-gray-600">
                        Sign in to access all features
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/auth')} className="py-3 px-4 text-black hover:bg-gray-100">
                      <LogIn className="mr-3 h-5 w-5 text-black" />
                      <span className="text-base text-black">Sign In / Sign Up</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {showGuestPrompt && (
        <GuestPrompt
          action="access this feature"
          description="Sign in to access notifications, messaging, and other personalized features."
          onCancel={() => setShowGuestPrompt(false)}
        />
      )}
    </>
  );
};

export default Header;
