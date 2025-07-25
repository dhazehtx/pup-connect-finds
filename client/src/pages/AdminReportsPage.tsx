import React, { useEffect } from 'react';
import AdminReportsPanel from '@/components/admin/AdminReportsPanel';
import { logInfo } from '@/utils/logger';

const AdminReportsPage = () => {
  useEffect(() => {
    // Log page access for monitoring
    logInfo('user-action', 'Admin accessed reports panel', {
      page: '/admin/reports',
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminReportsPanel />
    </div>
  );
};

export default AdminReportsPage;