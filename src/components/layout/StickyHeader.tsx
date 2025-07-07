
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PostCreator from '@/components/home/PostCreator';

const StickyHeader = () => {
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostCreator, setShowPostCreator] = useState(false);

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
    setShowPostCreator(true);
  };

  const handlePostCreated = () => {
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

  // Only show create post button on home/profile pages, not on post/explore pages
  const isHomeOrProfilePage = (location.pathname === '/home' || location.pathname.startsWith('/profile')) && 
                              location.pathname !== '/post';

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

            {/* Center: Search bar + Create button */}
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
              
              {/* Only show create post button on home/profile pages */}
              {isHomeOrProfilePage && (
                <Button
                  onClick={handleCreatePost}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 flex items-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">+ Post</span>
                </Button>
              )}
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
              
              {/* Mobile create post button - only on home/profile pages */}
              {isHomeOrProfilePage && (
                <Button
                  onClick={handleCreatePost}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 p-0 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Right: Sign Out */}
            <div className="flex items-center flex-shrink-0">
              {user || isGuest ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut} 
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                </Button>
              ) : (
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

      {/* Post Creator Modal - Only for social posts */}
      {showPostCreator && (
        <PostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default StickyHeader;
