
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NotificationBadge from '@/components/notifications/NotificationBadge';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Determine the correct home link based on authentication status
  const getHomeLink = () => {
    if (user || isGuest) {
      return "/home";
    }
    return "/";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getHomeLink()} className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MY PUP</span>
          </Link>

          {/* Simple Sign In/Sign Up buttons on the right */}
          <div className="flex items-center space-x-4">
            {user || isGuest ? (
              <div className="flex items-center space-x-4">
                {user && (
                  <NotificationBadge
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-gray-600 hover:text-blue-600"
                  />
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;
