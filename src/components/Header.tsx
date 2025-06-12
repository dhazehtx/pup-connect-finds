
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import HeaderLogo from '@/components/header/HeaderLogo';
import MobileHeaderActions from '@/components/header/MobileHeaderActions';
import DesktopUserMenu from '@/components/header/DesktopUserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isGuest, signOut } = useAuth();
  const { isMobile } = useMobileOptimized();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isAuthenticated = Boolean(user || isGuest);

  // Mobile header design
  if (isMobile) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center h-14 px-4">
          <HeaderLogo />
          <MobileHeaderActions
            isAuthenticated={isAuthenticated}
            user={user}
            isGuest={isGuest}
            onSignOut={handleSignOut}
          />
        </div>
      </header>
    );
  }

  // Desktop header design
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <HeaderLogo />
          <DesktopUserMenu
            isAuthenticated={isAuthenticated}
            user={user}
            isGuest={isGuest}
            onSignOut={handleSignOut}
          />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {!isAuthenticated && (
                <div className="space-y-2 px-3 py-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      navigate('/auth?mode=signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
