
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';

const TwoFactorSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <TwoFactorAuth onSuccess={() => navigate('/profile')} />
      </div>
    </div>
  );
};

export default TwoFactorSetup;
