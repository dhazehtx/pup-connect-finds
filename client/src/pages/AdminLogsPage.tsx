import React, { useEffect } from 'react';
import AdminLogViewer from '@/components/admin/AdminLogViewer';
import { logInfo } from '@/utils/logger';

const AdminLogsPage = () => {
  useEffect(() => {
    // Log page access for monitoring
    logInfo('user-action', 'Admin accessed log viewer', {
      page: '/admin/logs',
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLogViewer />
    </div>
  );
};

export default AdminLogsPage;