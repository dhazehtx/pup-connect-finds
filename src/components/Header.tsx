
import React from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/98 backdrop-blur-md border-b border-blue-100 shadow-sm z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Centered Logo and Name */}
        <div className="flex justify-center mb-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png" 
                alt="MY PUP Logo" 
                className="w-10 h-10 transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              MY PUP
            </h1>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-6">
          <button className="p-3 hover:bg-blue-50 rounded-full transition-all duration-200 group">
            <Search size={22} className="text-blue-600 group-hover:text-blue-700" />
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className="p-3 hover:bg-blue-50 rounded-full transition-all duration-200 relative group"
          >
            <MessageCircle size={22} className="text-blue-600 group-hover:text-blue-700" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-sm">3</span>
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-3 hover:bg-blue-50 rounded-full transition-all duration-200 relative group"
          >
            <Bell size={22} className="text-blue-600 group-hover:text-blue-700" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-sm">5</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
