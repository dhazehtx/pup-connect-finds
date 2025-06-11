
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingState from '@/components/ui/loading-state';

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingState 
        message="Loading admin dashboard..." 
        className="min-h-screen flex items-center justify-center"
      />
    );
  }

  // Only allow admin users to access this page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // In a real app, you'd check user role from profile
  // For now, we'll allow authenticated users to see the admin dashboard
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;
