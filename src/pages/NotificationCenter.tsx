import React, { useState } from 'react';
import Layout from '@/components/Layout';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const NotificationCenterPage = () => {
  const [isOpen, setIsOpen] = useState(true); // Always open for the page version

  const handleClose = () => {
    // For page version, we could navigate back or just keep it open
    // Since this is a dedicated page, we'll keep it open
    setIsOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Notification Center</h1>
          <div className="relative">
            <NotificationCenter 
              isOpen={isOpen}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationCenterPage;
