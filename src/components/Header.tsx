
import React from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-amber-200 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">🐕</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">PawConnect</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-amber-100 rounded-full transition-colors">
            <Search size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-amber-100 rounded-full transition-colors relative"
          >
            <MessageCircle size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-amber-100 rounded-full transition-colors relative"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">5</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
