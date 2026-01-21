
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
    <div className="min-h-screen bg-white pb-20 greeting-page">
      {/* Hero Section */}
      <section className="greeting-hero relative bg-white py-8 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6"
            style={{ background: 'none', backgroundColor: 'transparent' }}
          >
            <span style={{ color: '#0F172A', background: 'none' }}>Find Your Perfect</span>
            <span 
              className="block" 
              style={{ color: '#0074D4', background: 'none', backgroundColor: 'transparent' }}
            >
              Puppy Companion
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Connect with verified breeders and discover adorable, healthy puppies 
            waiting for their forever homes.
          </p>
          
          {/* Main 4 Buttons - All using button elements for CSS compatibility */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            gap: '16px', 
            justifyContent: 'center', 
            marginBottom: '32px',
            padding: '0 8px'
          }}>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0074D4',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '10px',
                padding: '14px 24px',
                minHeight: '48px',
                boxShadow: '0 2px 4px rgba(0, 116, 212, 0.3)'
              }}
            >
              <UserPlus style={{ width: '20px', height: '20px', marginRight: '8px', color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Sign Up</span>
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0074D4',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '10px',
                padding: '14px 24px',
                minHeight: '48px',
                boxShadow: '0 2px 4px rgba(0, 116, 212, 0.3)'
              }}
            >
              <LogIn style={{ width: '20px', height: '20px', marginRight: '8px', color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Sign In</span>
            </Button>
            <Button 
              onClick={handleGuestAccess}
              className="bg-blue-600"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0074D4',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '10px',
                padding: '14px 24px',
                minHeight: '48px',
                boxShadow: '0 2px 4px rgba(0, 116, 212, 0.3)'
              }}
            >
              <Eye style={{ width: '20px', height: '20px', marginRight: '8px', color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Browse as Guest</span>
            </Button>
            <Button 
              onClick={() => navigate('/explore')}
              className="bg-blue-600"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0074D4',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '16px',
                borderRadius: '10px',
                padding: '14px 24px',
                minHeight: '48px',
                boxShadow: '0 2px 4px rgba(0, 116, 212, 0.3)'
              }}
            >
              <Search style={{ width: '20px', height: '20px', marginRight: '8px', color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Explore Puppies</span>
            </Button>
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
