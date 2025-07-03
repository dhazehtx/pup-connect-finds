
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = () => {
    scrollToTop();
  };

  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MY PUP Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-white" />
              <span className="text-xl font-bold text-white">MY PUP</span>
            </div>
            <p className="text-white mb-4">
              Connecting loving families with their perfect puppy companions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" onClick={handleLinkClick} className="text-white hover:text-blue-200 transition-colors">
                  Browse Puppies
                </Link>
              </li>
              <li>
                <Link to="/education" onClick={handleLinkClick} className="text-white hover:text-blue-200 transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={handleLinkClick} className="text-white hover:text-blue-200 transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help-center" onClick={handleLinkClick} className="text-white hover:text-blue-200 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/trust-safety" onClick={handleLinkClick} className="text-white hover:text-blue-200 transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="text-white hover:text-blue-200 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-700 mt-8 pt-8 text-center">
          <div className="text-white text-sm">
            <span>© 2024 MY PUP. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
