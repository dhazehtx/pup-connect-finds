
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface NavbarDesktopMenuProps {
  user: any;
  onCreatePost: () => void;
}

const NavbarDesktopMenu = ({ user, onCreatePost }: NavbarDesktopMenuProps) => {
  return (
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
      
      {/* Post Button in Navigation */}
      <Button
        onClick={onCreatePost}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full flex items-center space-x-1 shadow-lg"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        <span className="font-medium text-xs">Post</span>
      </Button>
      
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
  );
};

export default NavbarDesktopMenu;
