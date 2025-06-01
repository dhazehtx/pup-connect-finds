
import React from 'react';
import Layout from '@/components/Layout';
import TrustSafetyDashboard from '@/components/safety/TrustSafetyDashboard';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TrustSafety = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="text-blue-600" size={32} />
              Trust & Safety Center
            </h1>
            <p className="text-gray-600">Your guide to safe and secure transactions</p>
          </div>
        </div>

        <TrustSafetyDashboard />
      </div>
    </Layout>
  );
};

export default TrustSafety;
