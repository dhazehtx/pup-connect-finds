import React from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminAccessButton = () => {
  const { profile } = useAuth();

  // Only show for admin users
  if (!profile?.is_admin) {
    return null;
  }

  return (
    <Link href="/admin">
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-20 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-lg"
      >
        <Shield className="w-4 h-4 mr-2" />
        Admin
      </Button>
    </Link>
  );
};

export default AdminAccessButton;