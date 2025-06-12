
import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarMobileMenuProps {
  isMobileMenuOpen: boolean;
  user: any;
  signOut: () => void;
}

const NavbarMobileMenu = ({ isMobileMenuOpen, user, signOut }: NavbarMobileMenuProps) => {
  return (
    <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Link
          to="/browse"
          className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Browse Puppies
        </Link>
        <Link
          to="/explore"
          className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Explore
        </Link>
        {user && (
          <>
            <Link
              to="/messages"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Messages
            </Link>
            <Link
              to="/notifications"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Notifications
            </Link>
          </>
        )}
        <Link
          to="/education"
          className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Education
        </Link>
        <Link
          to="/analytics"
          className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
        >
          Analytics
        </Link>
        {user ? (
          <>
            <Link
              to="/profile"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Profile
            </Link>
            <Link
              to="/my-listings"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              My Listings
            </Link>
            <Link
              to="/create-listing"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Create Listing
            </Link>
            <Link
              to="/messaging-test"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Message Testing
            </Link>
            <Link
              to="/messaging-analytics"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Message Analytics
            </Link>
            <button
              onClick={signOut}
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavbarMobileMenu;
