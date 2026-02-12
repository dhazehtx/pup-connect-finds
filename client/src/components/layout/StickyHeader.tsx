import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Plus, Bell, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

import { useToast } from '@/hooks/use-toast';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import ModernPostCreator from '@/components/home/ModernPostCreator';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationButton from '@/components/notifications/NotificationButton';
import SearchBar from '../SearchBar';

const StickyHeader = () => {
  const { user, isGuest, profile, loading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { unreadCount } = useEnhancedNotifications();
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
  const isExplorePage = location.pathname === '/explore';
  const isMarketplacePage = location.pathname === '/marketplace';
  
  // Hide search on auth pages
  const showSearch = !location.pathname.startsWith('/auth');

  // Determine button text and behavior
  const getPostButtonText = () => {
    if (isExplorePage) {
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
            {showSearch && (
              <div className="flex-1 max-w-2xl mx-8 hidden md:flex items-center space-x-4">
                <SearchBar 
                  placeholder="Search puppies, breeds, or breeders..." 
                  className="flex-1"
                />
                
                <div className="flex items-center space-x-3">
                  {/* Create Post - visible on all pages for authenticated users */}
                  {(user || isGuest) && (
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      title="Create Post"
                      style={{
                        padding: '8px',
                        color: '#0074d4',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '9999px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <Plus className="h-5 w-5" style={{ color: '#0074d4' }} />
                    </button>
                  )}

                  {/* Admin Panel Access - Only for admin users */}
                  {loading ? (
                    <div className="h-6 w-6" />
                  ) : profile?.is_admin ? (
                    <Link
                      to="/admin"
                      title="Admin Dashboard"
                      style={{
                        padding: '8px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ShieldCheck className="h-5 w-5" style={{ color: '#0074d4' }} />
                    </Link>
                  ) : null}
                  




                  {/* Notification Bell - Only for fully authenticated users (not guests) */}
                  {user && !isGuest && (
                    <NotificationButton className="p-2 text-[#0074d4] hover:text-[#0074d4] hover:bg-[#0074d4]/5 hover:shadow-sm transition-all duration-200 rounded-full" />
                  )}
                </div>
              </div>
            )}

            {/* Mobile search and create */}
            {showSearch && (
              <div className="flex md:hidden items-center space-x-2 flex-1 mx-4">
                <SearchBar 
                  placeholder="Search..." 
                  className="flex-1 text-sm"
                />
                
                <div className="flex items-center space-x-2">
                  {/* Mobile Create Post - visible on all pages for authenticated users */}
                  {(user || isGuest) && (
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      title="Create Post"
                      style={{
                        padding: '6px',
                        color: '#0074d4',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '9999px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <Plus className="h-5 w-5" style={{ color: '#0074d4' }} />
                    </button>
                  )}



                  {/* Mobile Admin Panel Access - Only for admin users */}
                  {loading ? (
                    <div className="h-6 w-6" />
                  ) : profile?.is_admin && (
                    <Link
                      to="/admin"
                      title="Admin Dashboard"
                      style={{
                        padding: '6px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ShieldCheck className="h-5 w-5" style={{ color: '#0074d4' }} />
                    </Link>
                  )}

                  {/* Mobile Notification Bell - Only for fully authenticated users (not guests) */}
                  {user && !isGuest && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                          padding: '6px',
                          color: '#0074d4',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '9999px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <Bell className="h-5 w-5" style={{ color: '#0074d4' }} />
                        {unreadCount > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#FF3B30',
                            borderRadius: '50%',
                            border: '1px solid white'
                          }}></div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right: Sign In button only for non-authenticated users */}
            <div className="flex items-center flex-shrink-0">
              {!user && !isGuest && (
                <div className="flex items-center space-x-3">
                  <Link to="/auth">
                    <Button size="sm" className="px-5 py-2 btn-primary">
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