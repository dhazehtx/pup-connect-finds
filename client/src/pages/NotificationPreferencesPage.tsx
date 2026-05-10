import React from 'react';
import Layout from '@/components/Layout';
import NotificationSettings from '@/components/notifications/NotificationSettings';

/**
 * Dedicated notification preferences (linked from Settings hub).
 */
const NotificationPreferencesPage = () => {
  return (
    <Layout>
      <div className="px-4 py-6 pb-24">
        <NotificationSettings />
      </div>
    </Layout>
  );
};

export default NotificationPreferencesPage;
