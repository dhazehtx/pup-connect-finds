import { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Search, Shield, Star, UserPlus, LogIn, Eye } from 'lucide-react';

const Home = () => {
  const { user, loading, continueAsGuest, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      {/* Mobile hero text styles - scoped to this component only */}
      <style>{`
        @media (max-width: 639px) {
          .greeting-hero-headline {
            font-size: 46px !important;
            font-weight: 800 !important;
            line-height: 1.08 !important;
            letter-spacing: -0.02em !important;
          }
          .greeting-hero-subtitle-text {
            font-size: 17px !important;
            line-height: 1.6 !important;
            max-width: 90% !important;
          }
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="greeting-hero px-4 pt-10 pb-8 sm:py-16 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Title - Mobile: 46px extra-bold hook, Desktop: 64px */}
          <h1 className="greeting-hero-headline mb-8 sm:mb-6" style={{ fontSize: '64px', fontWeight: 700, lineHeight: 1.1 }}>
            <span style={{ display: 'block', color: '#0F172A' }}>Find Your Perfect</span>
            <span style={{ display: 'block', color: '#0074D4' }}>Puppy Companion</span>
          </h1>
          
          {/* Subtitle - Mobile: 17px with better spacing, Desktop: 20px */}
          <p className="greeting-hero-subtitle-text mx-auto mb-10 sm:mb-8 px-2" style={{ fontSize: '20px', color: '#6b7280', lineHeight: 1.5, maxWidth: '640px' }}>
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
