
import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Shield, Users, Star, ArrowRight, UserPlus, LogIn, Eye } from 'lucide-react';

const Home = () => {
  const { user, loading, continueAsGuest, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. INSTRUMENT FOR CLARITY - Comprehensive logging
  console.log('[HOME PAGE] Rendering Home component', {
    userId: user?.id,
    hasUser: !!user,
    loading,
    isGuest,
    pathname: location.pathname,
    timestamp: Date.now()
  });

  // Stable user identity for dependency tracking
  const stableUserId = useMemo(() => user?.id || null, [user?.id]);

  useEffect(() => {
    console.log('[HOME PAGE] Component mounted', { user: !!user, loading, isGuest });
    document.title = 'My Pup - Find Your Perfect Puppy Companion';
    return () => console.log('[HOME PAGE] Component unmounted');
  }, []);

  useEffect(() => {
    console.log('[HOME PAGE] Auth state changed:', { 
      userId: stableUserId, 
      hasUser: !!user, 
      loading, 
      isGuest,
      pathname: location.pathname
    });
  }, [stableUserId, !!user, loading, isGuest, location.pathname]);

  // HARDEN NAVIGATION GUARD - Prevent redirect loops and redundant navigation  
  useEffect(() => {
    const shouldRedirect = !loading && !user && !isGuest;
    const currentPath = location.pathname;
    const targetPath = '/greeting';
    
    console.log('[HOME PAGE] Navigation guard check:', {
      loading,
      hasUser: !!user,
      isGuest,
      pathname: currentPath,
      shouldRedirect,
      alreadyOnGreeting: currentPath === targetPath
    });
    
    // Skip redirect if already on target path
    if (shouldRedirect && currentPath === targetPath) {
      console.log('[NAV GUARD] Already on target path (/greeting), skipping redirect');
      return;
    }
    
    // Only redirect if we're definitely not authenticated and not on greeting page
    if (shouldRedirect) {
      console.log('[NAV GUARD] Redirecting unauthenticated user from', currentPath, 'to', targetPath);
      navigate(targetPath, { replace: true });
      return;
    }
    
    console.log('[NAV GUARD] No redirect needed - user authenticated or guest');
  }, [loading, user, isGuest, location.pathname, navigate]);

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/explore');
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-blue-600 block">Puppy Companion</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with verified breeders and discover adorable, healthy puppies 
            waiting for their forever homes.
          </p>
          
          {/* Main 4 Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </Link>
            <Button 
              size="lg" 
              onClick={handleGuestAccess}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              Browse as Guest
            </Button>
            <Link to="/explore">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg">
                <Search className="w-5 h-5 mr-2" />
                Explore Puppies
              </Button>
            </Link>
          </div>

          {/* Verified badges underneath */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Verified Breeders</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Health Guaranteed</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-blue-500" />
              <span>5-Star Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
