
import React from 'react';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExploreBottomNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="grid grid-cols-5 py-2">
        <button 
          className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/')}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button className="flex flex-col items-center py-2 text-blue-600">
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Explore</span>
        </button>
        
        <button 
          className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/create-listing')}
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs mt-1">Post</span>
        </button>
        
        <button 
          className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/messages')}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Messages</span>
        </button>
        
        <button 
          className="flex flex-col items-center py-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/profile')}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ExploreBottomNavigation;
