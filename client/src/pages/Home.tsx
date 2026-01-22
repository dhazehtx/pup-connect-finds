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
      {/* Hero Section */}
      <section className="greeting-hero" style={{ backgroundColor: '#ffffff', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          {/* Title */}
          <h1 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.2 }}>
            <span style={{ color: '#0F172A', display: 'block' }}>Find Your Perfect</span>
            <span style={{ color: '#0074D4', display: 'block' }}>Puppy Companion</span>
          </h1>
          
          {/* Subtitle */}
          <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px', maxWidth: '640px', margin: '0 auto 32px' }}>
            Connect with verified breeders and discover adorable, healthy puppies 
            waiting for their forever homes.
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
              <Search style={iconStyle} />
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
