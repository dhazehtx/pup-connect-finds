
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileResponsive } from '@/components/ui/mobile-responsive';
import VerificationWorkflow from '@/components/verification/VerificationWorkflow';
import { useNavigate } from 'react-router-dom';

const Verification = () => {
  const navigate = useNavigate();

  return (
    <MobileResponsive>
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Account Verification</h1>
        </div>

        <VerificationWorkflow />
      </div>
    </MobileResponsive>
  );
};

export default Verification;
