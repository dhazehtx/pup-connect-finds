
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface NavbarDesktopActionsProps {
  onCreatePost: () => void;
}

const NavbarDesktopActions = ({ onCreatePost }: NavbarDesktopActionsProps) => {
  return (
    <div className="hidden md:block">
      <Button
        onClick={onCreatePost}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg"
        size="sm"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Post</span>
      </Button>
    </div>
  );
};

export default NavbarDesktopActions;
