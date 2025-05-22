
import React from 'react';
import { Search, Bell, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-blue-200 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2" onClick={() => navigate('/')} role="button">
          <img 
            src="/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png" 
            alt="MY PUP Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-blue-600">MY PUP</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-blue-100 rounded-full transition-colors">
            <Search size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-blue-100 rounded-full transition-colors relative"
          >
            <MessageCircle size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-blue-100 rounded-full transition-colors relative"
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
