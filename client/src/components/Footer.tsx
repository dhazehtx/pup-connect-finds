
import React from 'react';
import { Link } from 'react-router-dom';
import { PawsWordmarkLockup } from '@/components/brand/PawsWordmark';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = () => {
    scrollToTop();
  };

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/30 text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <div className="font-brand-wordmark mb-3 inline-flex items-baseline gap-1 text-lg font-medium tracking-widest text-slate-800">
              <PawsWordmarkLockup />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              Connecting families with healthy puppies, trusted care providers, and curated PAWS essentials.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Discover
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/explore"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Browse Puppies
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?tab=store"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  PAWS Store
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace?tab=box"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Pup Box
                </Link>
              </li>
              <li>
                <Link
                  to="/education"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Education
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/legal"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Legal Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/help-center"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/guidelines"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Trust &amp; Safety
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Support Tickets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/legal/terms"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/shipping"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/returns"
                  onClick={handleLinkClick}
                  className="text-slate-700 transition-colors hover:text-blue-600"
                >
                  Returns &amp; Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200/90 pt-6 text-center">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} PAWS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
