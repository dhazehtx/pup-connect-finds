import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, Globe, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import NotificationBell from '@/components/ui/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = () => {
  const { user, signOut, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/us.svg' },
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/es.svg' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/fr.svg' },
    { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/de.svg' },
    { code: 'it', name: 'Italiano', flag: 'https://flagcdn.com/it.svg' },
    { code: 'pt', name: 'Português', flag: 'https://flagcdn.com/pt.svg' },
    { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/ru.svg' },
    { code: 'ja', name: '日本語', flag: 'https://flagcdn.com/jp.svg' },
    { code: 'ko', name: '한국어', flag: 'https://flagcdn.com/kr.svg' },
    { code: 'zh', name: '中文', flag: 'https://flagcdn.com/cn.svg' },
    { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/sa.svg' },
    { code: 'hi', name: 'हिन्दी', flag: 'https://flagcdn.com/in.svg' },
    { code: 'nl', name: 'Nederlands', flag: 'https://flagcdn.com/nl.svg' },
    { code: 'sv', name: 'Svenska', flag: 'https://flagcdn.com/se.svg' },
    { code: 'pl', name: 'Polski', flag: 'https://flagcdn.com/pl.svg' }
  ];

  const currentLanguage = languages.find(lang => lang.name === selectedLanguage) || languages[0];

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language.name);
    // Here you would typically integrate with i18n to actually change the language
    console.log('Language changed to:', language.code);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MY PUP</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                to="/explore"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Explore
              </Link>
              <Link
                to="/education"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Education
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for puppies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell - only show for logged in users */}
            {user && (
              <NotificationBell 
                className="text-gray-600 hover:text-gray-900" 
                onClick={handleNotificationClick}
              />
            )}

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <img src={currentLanguage.flag} alt={currentLanguage.code} className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentLanguage.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                    className="cursor-pointer"
                  >
                    <img src={language.flag} alt={language.code} className="w-4 h-4 mr-2" />
                    {language.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{profile?.username || profile?.full_name || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>{profile?.full_name || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/my-listings" className="w-full">
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/create-listing" className="w-full">
                      Create Listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
