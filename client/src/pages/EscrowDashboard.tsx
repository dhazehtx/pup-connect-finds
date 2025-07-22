
import React from 'react';
import Layout from '@/components/Layout';
import EscrowDashboard from '@/components/escrow/EscrowDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EscrowDashboardPage = () => {
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
              <Shield className="text-green-600" size={32} />
              Escrow Dashboard
            </h1>
            <p className="text-gray-600">Manage your secure transactions</p>
          </div>
        </div>

        <EscrowDashboard />
      </div>
    </Layout>
  );
};

export default EscrowDashboardPage;
