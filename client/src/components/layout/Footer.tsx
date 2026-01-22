import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkStyle: React.CSSProperties = {
    color: '#000000',
    textDecoration: 'none'
  };

  const linkHoverStyle = {
    color: '#0074d4'
  };

  return (
    <footer style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '32px' }}>
          {/* Company */}
          <div>
            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '16px' }}>My Pup</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/about" style={linkStyle}>About Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/careers" style={linkStyle}>Careers</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/press" style={linkStyle}>Press</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/blog" style={linkStyle}>Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Support</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/help" style={linkStyle}>Help Center</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact" style={linkStyle}>Contact Us</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/faq" style={linkStyle}>FAQ</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/community" style={linkStyle}>Community</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <Link to="/legal" style={{ fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'block', textDecoration: 'none' }}>Legal</Link>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/privacy" style={linkStyle}>Privacy Policy</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/terms" style={linkStyle}>Terms of Service</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/privacy" style={linkStyle}>Cookie Policy</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/legal/guidelines" style={linkStyle}>Community Guidelines</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Connect</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="https://twitter.com/mypup" style={linkStyle}>Twitter</a></li>
              <li style={{ marginBottom: '8px' }}><a href="https://facebook.com/mypup" style={linkStyle}>Facebook</a></li>
              <li style={{ marginBottom: '8px' }}><a href="https://instagram.com/mypup" style={linkStyle}>Instagram</a></li>
              <li style={{ marginBottom: '8px' }}><a href="https://youtube.com/mypup" style={linkStyle}>YouTube</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '32px', paddingTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            © {currentYear} My Pup. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/help" style={{ fontSize: '14px', color: '#000000', textDecoration: 'none' }}>
              Help Center
            </Link>
            <Link to="/legal/privacy" style={{ fontSize: '14px', color: '#000000', textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link to="/legal/terms" style={{ fontSize: '14px', color: '#000000', textDecoration: 'none' }}>
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
