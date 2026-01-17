import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">My Pup</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-primary-600">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary-600">Careers</Link></li>
              <li><Link to="/press" className="hover:text-primary-600">Press</Link></li>
              <li><Link to="/blog" className="hover:text-primary-600">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/help" className="hover:text-primary-600">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-primary-600">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary-600">FAQ</Link></li>
              <li><Link to="/community" className="hover:text-primary-600">Community</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <Link to="/legal" className="font-semibold text-gray-900 mb-4 block hover:text-primary-600">Legal</Link>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/legal/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-primary-600">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-primary-600">Cookie Policy</Link></li>
              <li><Link to="/legal/guidelines" className="hover:text-primary-600">Community Guidelines</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="https://twitter.com/mypup" className="hover:text-primary-600">Twitter</a></li>
              <li><a href="https://facebook.com/mypup" className="hover:text-primary-600">Facebook</a></li>
              <li><a href="https://instagram.com/mypup" className="hover:text-primary-600">Instagram</a></li>
              <li><a href="https://youtube.com/mypup" className="hover:text-primary-600">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} My Pup. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/help" className="text-sm text-gray-500 hover:text-primary-600">
              Help Center
            </Link>
            <Link to="/legal/privacy" className="text-sm text-gray-500 hover:text-primary-600">
              Privacy
            </Link>
            <Link to="/legal/terms" className="text-sm text-gray-500 hover:text-primary-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}