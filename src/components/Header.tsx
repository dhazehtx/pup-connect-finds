
import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 bg-cloud-white border-b border-soft-sky shadow-sm z-50">
      <div className="max-w-4xl mx-auto px-4 py-2 relative">
        {/* Centered Logo Only */}
        <div className="flex justify-center">
          <div 
            className="cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <img 
                src="/lovable-uploads/64114b5b-ae93-4c5b-a6d4-be95ec65c954.png" 
                alt="MY PUP Logo" 
                className="w-16 h-16 transition-transform duration-200 group-hover:scale-105 mix-blend-multiply"
                style={{ 
                  filter: 'brightness(1.1) contrast(1.05)',
                  background: 'transparent'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-royal-blue/5 to-soft-sky/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
          </div>
        </div>
        
        {/* Search Button - Top Right */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <button className="p-2 hover:bg-transparent transition-all duration-200 group">
            <Search size={20} className="text-royal-blue group-hover:text-deep-navy" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
