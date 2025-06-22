
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarDesktopActionsProps {
  onCreatePost: () => void;
}

const NavbarDesktopActions = ({ onCreatePost }: NavbarDesktopActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="hidden md:block">
      <Button
        onClick={() => navigate('/marketplace')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg"
        size="sm"
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="font-medium">Marketplace</span>
      </Button>
    </div>
  );
};

export default NavbarDesktopActions;
