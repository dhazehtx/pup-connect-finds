
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  isCurrentUser: boolean;
  show: boolean;
}

const BottomNavigation = ({ isCurrentUser, show }: BottomNavigationProps) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => navigate('/home')} 
            className="flex flex-col items-center py-2"
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-700">
                <path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-700">Home</span>
          </button>
          <button 
            onClick={() => navigate('/explore')} 
            className="flex flex-col items-center py-2"
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <span className="text-xs text-gray-700">Explore</span>
          </button>
          <button 
            onClick={() => navigate('/create-listing')} 
            className="flex flex-col items-center py-2 relative"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center absolute -top-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-white">
                <path d="M12 5v14m-7-7h14"/>
              </svg>
            </div>
            <div className="h-8"></div>
          </button>
          <button 
            onClick={() => navigate('/messages')} 
            className="flex flex-col items-center py-2"
          >
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-700">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="text-xs text-gray-700">Messages</span>
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className="flex flex-col items-center py-2"
          >
            <div className="w-6 h-6 mb-1">
              <div className={`w-6 h-6 ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-700'} rounded-full`}></div>
            </div>
            <span className={`text-xs ${isCurrentUser ? 'text-blue-600' : 'text-gray-700'}`}>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
