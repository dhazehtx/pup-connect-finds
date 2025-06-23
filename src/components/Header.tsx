
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, HelpCircle, FileText, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import HeaderSupportMenu from '@/components/header/HeaderSupportMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const supportLinks = [
    { name: 'Education', path: '/education', icon: <FileText className="w-4 h-4" /> },
    { name: 'Legal Guide', path: '/legal', icon: <Shield className="w-4 h-4" /> },
    { name: 'Terms of Service', path: '/terms', icon: <FileText className="w-4 h-4" /> },
    { name: 'Privacy Policy', path: '/privacy-policy', icon: <Shield className="w-4 h-4" /> },
    { name: 'Help Center', path: '/help-center', icon: <HelpCircle className="w-4 h-4" /> },
    { name: 'Trust & Safety', path: '/trust-safety', icon: <Shield className="w-4 h-4" /> },
    { name: 'Contact Us', path: '/contact', icon: <Mail className="w-4 h-4" /> },
  ];

  // Determine the correct home link based on authentication status
  const getHomeLink = () => {
    if (user || isGuest) {
      return "/home";
    }
    return "/";
  };

  const handleProtectedNavigation = (path: string) => {
    if (!user && !isGuest) {
      // Redirect to greeting page for protected routes
      navigate('/');
      return;
    }
    navigate(path);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getHomeLink()} className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MY PUP</span>
          </Link>

          {/* User Actions and Help Menu */}
          <div className="flex items-center space-x-4">
            {user || isGuest ? (
              <div className="flex items-center space-x-4">
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

            {/* Help Menu - Desktop */}
            <div className="hidden md:block">
              <HeaderSupportMenu />
            </div>

            {/* Mobile menu button - Royal blue color */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Updated styling */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white shadow-lg rounded-b-lg">
            <nav className="flex flex-col space-y-2">
              {/* Help & Support Section */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-blue-600 px-3 mb-2">Help & Support</h3>
                {supportLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md mx-2 transition-colors"
                  >
                    <span className="text-blue-600">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Account Actions */}
              {(user || isGuest) && (
                <div className="border-t pt-2 px-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut} 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
