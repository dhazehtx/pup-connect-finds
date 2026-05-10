import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ban, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockStatus, useToggleBlock } from '@/hooks/useBlocks';
import ReportUserModal from '@/components/reports/ReportUserModal';

type Props = {
  targetUserId: string;
  targetLabel: string;
  /** compact = icon buttons in a row */
  variant?: 'default' | 'compact';
  className?: string;
};

/**
 * Report + block controls for another user’s profile or listing seller row.
 */
export function UserTrustActions({ targetUserId, targetLabel, variant = 'default', className }: Props) {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const { data: blockStatus, isLoading: blockLoading } = useBlockStatus(targetUserId);
  const toggleBlock = useToggleBlock();

  if (!user || user.id === targetUserId) {
    return null;
  }

  const blockedByMe = blockStatus?.blocked && blockStatus?.blockedByMe;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${variant === 'compact' ? '' : 'justify-center sm:justify-start'} ${className ?? ''}`}
    >
      <Button
        type="button"
        variant="outline"
        size={variant === 'compact' ? 'sm' : 'default'}
        className="border-slate-200 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        onClick={() => setReportOpen(true)}
      >
        <Flag className="mr-2 h-4 w-4 text-amber-600" aria-hidden />
        Report
      </Button>
      <Button
        type="button"
        variant="outline"
        size={variant === 'compact' ? 'sm' : 'default'}
        className="border-slate-200 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        disabled={blockLoading || toggleBlock.isPending}
        onClick={() => toggleBlock.mutate(targetUserId)}
      >
        <Ban className="mr-2 h-4 w-4 text-slate-600" aria-hidden />
        {blockedByMe ? 'Unblock' : 'Block'}
      </Button>

      <ReportUserModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedUserId={targetUserId}
        reportedUsername={targetLabel}
      />
    </div>
  );
}
