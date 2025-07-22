
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <Heart className="h-6 w-6 text-blue-600 md:h-8 md:w-8" />
      <span className="text-xl font-bold text-gray-900">MY PUP</span>
    </Link>
  );
};

export default HeaderLogo;
