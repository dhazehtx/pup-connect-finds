import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BugReportModal from './BugReportModal';
import { useAuth } from '@/contexts/AuthContext';

interface BugReportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
}

const BugReportButton: React.FC<BugReportButtonProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = '',
  iconClassName = ''
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!user) {
    return null; // Only show for authenticated users
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Bug className={`w-4 h-4 ${iconClassName}`} />
        Report a Bug
      </Button>

      <BugReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default BugReportButton;