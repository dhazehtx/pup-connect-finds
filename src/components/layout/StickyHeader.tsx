
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Search, Plus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import ModernPostCreator from '@/components/home/ModernPostCreator';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const StickyHeader = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { unreadCount } = useEnhancedNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCreatePost = () => {
    if (!user && !isGuest) {
      navigate('/auth');
      return;
    }

    // Check current route to determine post type
    const isMarketplacePage = location.pathname === '/marketplace' || location.pathname === '/explore';
    
    if (isMarketplacePage) {
      // Redirect to listing creation for marketplace/explore pages
      navigate('/create-listing');
    } else {
      // Show social post creator for home/profile pages
      setShowPostCreator(true);
    }
  };

  const handlePostCreated = (newPost: any) => {
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
  };

  // Determine the correct home link based on authentication status
  const getHomeLink = () => {
    if (user || isGuest) {
      return "/home";
    }
    return "/";
  };

  // Only show social post button on home and profile pages
  const isHomeOrProfilePage = location.pathname === '/home' || location.pathname.startsWith('/profile');
  const isMarketplacePage = location.pathname === '/marketplace' || location.pathname === '/explore';

  // Determine button text and behavior
  const getPostButtonText = () => {
    if (isMarketplacePage) {
      return "List Puppy";
    }
    return "Post";
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={getHomeLink()} className="flex items-center space-x-2 flex-shrink-0">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MY PUP</span>
            </Link>

            {/* Center: Search bar + Create Post button + Notification Bell */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:flex items-center space-x-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search puppies, breeds, or breeders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </form>
              
              <div className="flex items-center space-x-3">
                {/* Dynamic Post Button */}
                {(isHomeOrProfilePage || isMarketplacePage) && (
                  <Button
                    onClick={handleCreatePost}
                    size="sm"
                    className={`${
                      isMarketplacePage 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-full px-4 py-2 flex items-center gap-2 flex-shrink-0`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{getPostButtonText()}</span>
                  </Button>
                )}

                {/* Notification Bell - Only for authenticated users */}
                {(user || isGuest) && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-[#2C3EDC] hover:text-[#2C3EDC] hover:bg-[#2C3EDC]/5 hover:shadow-sm transition-all duration-200 rounded-full"
                    >
                      <Bell className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF3B30] rounded-full border border-white"></div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile search and create */}
            <div className="flex md:hidden items-center space-x-2 flex-1 mx-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </form>
              
              <div className="flex items-center space-x-2">
                {/* Mobile Dynamic Post Button */}
                {(isHomeOrProfilePage || isMarketplacePage) && (
                  <Button
                    onClick={handleCreatePost}
                    size="sm"
                    className={`${
                      isMarketplacePage 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-full w-8 h-8 p-0 flex-shrink-0`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}

                {/* Mobile Notification Bell - Only for authenticated users */}
                {(user || isGuest) && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-1.5 text-[#2C3EDC] hover:text-[#2C3EDC] hover:bg-[#2C3EDC]/5 rounded-full w-8 h-8"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF3B30] rounded-full border border-white"></div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Sign In button only for non-authenticated users */}
            <div className="flex items-center flex-shrink-0">
              {!user && !isGuest && (
                <div className="flex items-center space-x-3">
                  <Link to="/auth">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Post Creator Modal - Only for social posts */}
      {showPostCreator && (
        <ModernPostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default StickyHeader;
