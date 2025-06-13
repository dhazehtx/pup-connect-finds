
import React from 'react';
import Layout from '@/components/Layout';
import B2BAnalyticsDashboard from '@/components/b2b/B2BAnalyticsDashboard';

const B2BDashboard = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <B2BAnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default B2BDashboard;
