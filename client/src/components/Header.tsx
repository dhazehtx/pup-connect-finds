
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/NotificationBell';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { logNav } from '@/lib/adminLog';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, signOut, isGuest, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => {
              const homeLink = getHomeLink();
              logNav({ from: location.pathname, to: homeLink });
              navigate(homeLink);
            }}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">MY PUP</span>
          </button>

          {/* Simple Sign In/Sign Up buttons on the right */}
          <div className="flex items-center space-x-4">
            {user || isGuest ? (
              <div className="flex items-center space-x-4">
                {user && (
                  <>
                    <NotificationBell />
                    {profile?.is_admin && (
                      <Link to="/admin/dashboard" data-testid="admin-shield-link">
                        <button 
                          className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                          title="Admin Dashboard"
                        >
                          <Shield className="h-5 w-5 text-blue-600" />
                        </button>
                      </Link>
                    )}
                    <ThemeToggle />
                  </>
                )}

                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700">
                  {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ThemeToggle />
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
