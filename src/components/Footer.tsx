
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = () => {
    scrollToTop();
  };

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Heart size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">MY PUP</span>
            </div>
            <p className="text-white mb-4 max-w-md">
              Connecting loving families with their perfect puppy companions. 
              Find trusted breeders, verified sellers, and your next best friend.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-blue-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Browse Puppies
                </Link>
              </li>
              <li>
                <Link to="/education" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/customer-reviews" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link to="/monetization" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Premium
                </Link>
              </li>
              <li>
                <Link to="/legal" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Legal Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help-center" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/trust-safety" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors flex items-center gap-2">
                  <Mail size={16} />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/b2b-dashboard" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  B2B Analytics
                </Link>
              </li>
              <li>
                <Link to="/terms" onClick={handleLinkClick} className="text-white hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white text-sm mb-4 md:mb-0">
            © 2024 MY PUP. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-white">
            <Link to="/privacy-policy" onClick={handleLinkClick} className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" onClick={handleLinkClick} className="hover:text-blue-400 transition-colors">
              Terms of Use
            </Link>
            <span className="flex items-center gap-2 text-white">
              <MapPin size={16} />
              Made with ❤️ in the USA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
