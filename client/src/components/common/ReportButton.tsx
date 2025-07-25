import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import ReportUserModal from '@/components/reports/ReportUserModal';
import ReportListingModal from '@/components/reports/ReportListingModal';

interface ReportUserButtonProps {
  type: 'user';
  userId: string;
  username: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

interface ReportListingButtonProps {
  type: 'listing';
  listingId: string;
  listingTitle: string;
  listingOwnerId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

type ReportButtonProps = ReportUserButtonProps | ReportListingButtonProps;

const ReportButton: React.FC<ReportButtonProps> = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { variant = 'ghost', size = 'sm', className = '' } = props;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setModalOpen(true)}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      >
        <Flag className="w-4 h-4 mr-2" />
        Report
      </Button>

      {props.type === 'user' ? (
        <ReportUserModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          reportedUserId={props.userId}
          reportedUsername={props.username}
        />
      ) : (
        <ReportListingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          listingId={props.listingId}
          listingTitle={props.listingTitle}
          listingOwnerId={props.listingOwnerId}
        />
      )}
    </>
  );
};

export default ReportButton;