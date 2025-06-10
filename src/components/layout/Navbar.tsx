
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const { user, signOut, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">PuppyLove</span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/browse"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Puppies
              </Link>
              <Link
                to="/explore"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Explore
              </Link>
              {user && (
                <Link
                  to="/messages"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Messages
                </Link>
              )}
              <Link
                to="/education"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Education
              </Link>
              <Link
                to="/analytics"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Analytics
              </Link>
              {user && (
                <>
                  <Link
                    to="/messaging-test"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Msg Test
                  </Link>
                  <Link
                    to="/messaging-analytics"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Msg Analytics
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                type="button"
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>{profile?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuLabel>{profile?.full_name || user.email}</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full h-full block">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/messages" className="w-full h-full block">
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/my-listings" className="w-full h-full block">
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/create-listing" className="w-full h-full block">
                      Create Listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/messaging-test" className="w-full h-full block">
                      Message Testing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/messaging-analytics" className="w-full h-full block">
                      Message Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
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
            <Link
              to="/messages"
              className="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Messages
            </Link>
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
    </nav>
  );
};

export default Navbar;
