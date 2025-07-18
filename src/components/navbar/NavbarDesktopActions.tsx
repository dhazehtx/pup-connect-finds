
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ModernPostCreator from '@/components/home/ModernPostCreator';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarDesktopActionsProps {
  onCreatePost: () => void;
}

const NavbarDesktopActions = ({ onCreatePost }: NavbarDesktopActionsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showPostCreator, setShowPostCreator] = useState(false);

  const isMarketplacePage = location.pathname === '/marketplace';
  const isProfilePage = location.pathname === '/profile' || location.pathname.startsWith('/profile/');

  const handleButtonClick = () => {
    if (isMarketplacePage) {
      // Navigate to create listing if on marketplace
      navigate('/create-listing');
    } else if (isProfilePage && user) {
      // Show post creator modal if on profile page and user is logged in
      setShowPostCreator(true);
    } else {
      // Navigate to marketplace if not on marketplace or profile
      navigate('/marketplace');
    }
  };

  const getButtonText = () => {
    if (isMarketplacePage) return 'List Puppy';
    if (isProfilePage) return 'Post';
    return 'Marketplace';
  };

  const getButtonIcon = () => {
    if (isMarketplacePage) return <Plus className="h-5 w-5" />;
    if (isProfilePage) return <Plus className="h-5 w-5" />;
    return <ShoppingBag className="h-5 w-5" />;
  };

  const getButtonColor = () => {
    if (isMarketplacePage) return 'bg-green-600 hover:bg-green-700';
    if (isProfilePage) return 'bg-blue-600 hover:bg-blue-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  const handlePostCreated = (newPost: any) => {
    setShowPostCreator(false);
    // Trigger the onCreatePost callback to refresh feeds
    onCreatePost();
  };

  return (
    <>
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

      {/* Post Creator Modal */}
      {showPostCreator && (
        <ModernPostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default NavbarDesktopActions;
