
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarDesktopActionsProps {
  onCreatePost: () => void;
}

const NavbarDesktopActions = ({ onCreatePost }: NavbarDesktopActionsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMarketplacePage = location.pathname === '/marketplace';

  const handleButtonClick = () => {
    if (isMarketplacePage) {
      // Navigate to create listing if on marketplace
      navigate('/create-listing');
    } else {
      // Navigate to marketplace if not on marketplace
      navigate('/marketplace');
    }
  };

  const getButtonText = () => {
    return isMarketplacePage ? 'List Puppy' : 'Marketplace';
  };

  const getButtonIcon = () => {
    return isMarketplacePage ? <Plus className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />;
  };

  const getButtonColor = () => {
    return isMarketplacePage 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <div className="hidden md:block">
      <Button
        onClick={handleButtonClick}
        className={`${getButtonColor()} text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg`}
        size="sm"
      >
        {getButtonIcon()}
        <span className="font-medium">{getButtonText()}</span>
      </Button>
    </div>
  );
};

export default NavbarDesktopActions;
