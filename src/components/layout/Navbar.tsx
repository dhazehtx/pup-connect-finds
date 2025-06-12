
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import GuestPrompt from '@/components/GuestPrompt';
import PostCreator from '@/components/home/PostCreator';
import NotificationBell from '@/components/ui/notification-bell';
import NavbarDesktopMenu from '@/components/navbar/NavbarDesktopMenu';
import NavbarDesktopActions from '@/components/navbar/NavbarDesktopActions';
import NavbarUserDropdown from '@/components/navbar/NavbarUserDropdown';
import NavbarMobileMenu from '@/components/navbar/NavbarMobileMenu';

const Navbar = () => {
  const { user, signOut, profile, isGuest } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showPostCreator, setShowPostCreator] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCreatePost = () => {
    if (!user && !isGuest) {
      setShowGuestPrompt(true);
      return;
    }
    setShowPostCreator(true);
  };

  const handlePostCreated = (newPost: any) => {
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gray-900">PuppyLove</span>
              </Link>
              
              <NavbarDesktopMenu user={user} onCreatePost={handleCreatePost} />
            </div>

            <div className="flex items-center space-x-4">
              {/* Create Post Button - Desktop */}
              <NavbarDesktopActions onCreatePost={handleCreatePost} />

              {/* Notification Bell */}
              {user && (
                <Link to="/notifications">
                  <NotificationBell />
                </Link>
              )}

              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  type="button"
                  className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>

              {user ? (
                <NavbarUserDropdown user={user} profile={profile} signOut={signOut} />
              ) : (
                <div className="hidden md:ml-6 md:flex md:space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <NavbarMobileMenu 
          isMobileMenuOpen={isMobileMenuOpen} 
          user={user} 
          signOut={signOut} 
        />
      </nav>

      {/* Guest Prompt Modal */}
      {showGuestPrompt && (
        <GuestPrompt
          action="create content"
          description="To create content, you need to create a MY PUP account."
          onCancel={() => setShowGuestPrompt(false)}
        />
      )}

      {/* Post Creator Modal */}
      {showPostCreator && (
        <PostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default Navbar;
