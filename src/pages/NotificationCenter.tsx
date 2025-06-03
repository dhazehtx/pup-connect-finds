
import React from 'react';
import Layout from '@/components/Layout';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const NotificationCenterPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Notification Center</h1>
          <NotificationCenter />
        </div>
      </div>
    </Layout>
  );
};

export default NotificationCenterPage;
