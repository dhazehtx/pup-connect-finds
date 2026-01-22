import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Search, Shield, Star, UserPlus, LogIn, Eye } from 'lucide-react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

const Home = () => {
  const { user, loading, continueAsGuest, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Stable user identity for dependency tracking
  const stableUserId = useMemo(() => user?.id || null, [user?.id]);

  useEffect(() => {
    document.title = 'My Pup - Find Your Perfect Puppy Companion';
  }, []);

  // Navigation guard
  useEffect(() => {
    const shouldRedirect = !loading && !user && !isGuest;
    const currentPath = location.pathname;
    const targetPath = '/greeting';
    
    if (shouldRedirect && currentPath !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [loading, user, isGuest, location.pathname, navigate]);

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/explore');
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #0074D4', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Button styles - defined once for consistency
  const ctaButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0074D4',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '16px',
    fontFamily: 'inherit',
    borderRadius: '10px',
    padding: '14px 24px',
    border: 'none',
    cursor: 'pointer',
    minHeight: '48px',
    boxShadow: '0 2px 4px rgba(0, 116, 212, 0.3)',
    textDecoration: 'none'
  };

  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    color: '#FFFFFF'
  };

  return (
    <div className="greeting-page" style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section className="greeting-hero" style={{ backgroundColor: '#ffffff', padding: isMobile ? '40px 16px 32px' : '64px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          {/* Title - Mobile: 46px extra-bold hook, Desktop: 64px */}
          <h1 style={{ 
            fontSize: isMobile ? '46px' : '64px', 
            fontWeight: isMobile ? 800 : 700, 
            marginBottom: isMobile ? '28px' : '24px', 
            lineHeight: isMobile ? 1.08 : 1.1,
            letterSpacing: isMobile ? '-0.02em' : 'normal'
          }}>
            <span style={{ display: 'block', color: '#0F172A' }}>Find Your Perfect</span>
            <span style={{ display: 'block', color: '#0074D4' }}>Puppy Companion</span>
          </h1>
          
          {/* Subtitle - Mobile: 17px with better spacing, Desktop: 20px */}
          <p style={{ 
            fontSize: isMobile ? '17px' : '20px', 
            color: '#6b7280', 
            marginBottom: isMobile ? '36px' : '32px', 
            maxWidth: isMobile ? '90%' : '640px', 
            margin: isMobile ? '0 auto 36px' : '0 auto 32px',
            lineHeight: isMobile ? 1.6 : 1.5,
            padding: '0 8px'
          }}>
            Connect with shelters and verified breeders to discover adorable, 
            healthy puppies waiting for their forever homes.
          </p>
          
          {/* CTA Buttons - Always rendered, no conditions */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            gap: '16px', 
            justifyContent: 'center', 
            marginBottom: '32px'
          }}>
            <button 
              type="button"
              onClick={() => navigate('/auth')}
              style={ctaButtonStyle}
            >
              <UserPlus style={iconStyle} />
              <span style={{ color: '#FFFFFF' }}>Sign Up</span>
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/auth')}
              style={ctaButtonStyle}
            >
              <LogIn style={iconStyle} />
              <span style={{ color: '#FFFFFF' }}>Sign In</span>
            </button>
            
            <button 
              type="button"
              onClick={handleGuestAccess}
              style={ctaButtonStyle}
            >
              <Eye style={iconStyle} />
              <span style={{ color: '#FFFFFF' }}>Browse as Guest</span>
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/explore')}
              style={ctaButtonStyle}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#FFFFFF" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ marginRight: '8px', flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <span style={{ color: '#FFFFFF' }}>Explore Puppies</span>
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', fontSize: '14px', color: '#6b7280', marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield style={{ width: '16px', height: '16px', color: '#16a34a' }} />
              <span>Verified Breeders</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart style={{ width: '16px', height: '16px', color: '#ef4444' }} />
              <span>Health Guaranteed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star style={{ width: '16px', height: '16px', color: '#0074D4' }} />
              <span>5-Star Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
