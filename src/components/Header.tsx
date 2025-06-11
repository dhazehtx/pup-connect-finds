
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Heart, User, MessageSquare, Bell, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const Header = () => {
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-cloud-white border-b border-soft-sky shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-royal-blue" />
          <span className="text-xl font-bold text-deep-navy">MY PUP</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/explore" className="text-deep-navy hover:text-royal-blue transition-colors">
            Explore
          </Link>
          {!isGuest && user && (
            <>
              <Link to="/messages" className="text-deep-navy hover:text-royal-blue transition-colors">
                Messages
              </Link>
              <Link to="/profile" className="text-deep-navy hover:text-royal-blue transition-colors">
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user && !isGuest ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              <NotificationCenter 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {isGuest && (
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
              {!user && !isGuest && (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
