
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Search, User, Menu, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/ui/language-switcher';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isGuest } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAuthAction = () => {
    if (user && !isGuest) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="bg-cloud-white shadow-sm border-b border-soft-sky sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-royal-blue rounded-full flex items-center justify-center">
              <Heart size={20} className="text-cloud-white" />
            </div>
            <span className="text-xl font-bold text-deep-navy">MY PUP</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/explore')}
              className="text-deep-navy hover:bg-soft-sky"
            >
              Browse
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/location-explorer')}
              className="text-deep-navy hover:bg-soft-sky"
            >
              Locations
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/analytics')}
              className="text-deep-navy hover:bg-soft-sky"
            >
              Analytics
            </Button>
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-navy/60" />
                <Input
                  type="text"
                  placeholder="Search puppies, breeders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-soft-sky focus:border-royal-blue"
                />
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="text-deep-navy hover:bg-soft-sky"
            >
              <Bell size={18} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-deep-navy hover:bg-soft-sky"
            >
              <User size={18} className="mr-2" />
              {user && !isGuest ? user.email?.split('@')[0] : 'Profile'}
            </Button>

            <Button
              onClick={handleAuthAction}
              size="sm"
              variant={user && !isGuest ? "outline" : "default"}
              className={user && !isGuest 
                ? "border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-cloud-white" 
                : "bg-royal-blue hover:bg-royal-blue/90 text-cloud-white"
              }
            >
              {user && !isGuest ? 'Sign Out' : 'Sign In'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-soft-sky bg-cloud-white">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-navy/60" />
                <Input
                  type="text"
                  placeholder="Search puppies, breeders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-soft-sky"
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/explore');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start text-deep-navy hover:bg-soft-sky"
              >
                Browse Puppies
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/location-explorer');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start text-deep-navy hover:bg-soft-sky"
              >
                Location Explorer
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/analytics');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start text-deep-navy hover:bg-soft-sky"
              >
                Analytics
              </Button>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-deep-navy/70">Language</span>
                <LanguageSwitcher />
              </div>
              
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/notifications');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start text-deep-navy hover:bg-soft-sky"
              >
                <Bell size={18} className="mr-2" />
                Notifications
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start text-deep-navy hover:bg-soft-sky"
              >
                <User size={18} className="mr-2" />
                {user && !isGuest ? user.email?.split('@')[0] : 'Profile'}
              </Button>

              <Button
                onClick={() => {
                  handleAuthAction();
                  setIsMobileMenuOpen(false);
                }}
                variant={user && !isGuest ? "outline" : "default"}
                className={`w-full ${user && !isGuest 
                  ? "border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-cloud-white" 
                  : "bg-royal-blue hover:bg-royal-blue/90 text-cloud-white"
                }`}
              >
                {user && !isGuest ? 'Sign Out' : 'Sign In'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
