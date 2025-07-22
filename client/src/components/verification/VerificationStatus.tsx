
import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VerificationStatusProps {
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  type: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const VerificationStatus = ({ 
  status, 
  type, 
  submittedAt, 
  reviewedAt, 
  rejectionReason 
}: VerificationStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'default' as const,
          title: 'Verification Approved',
          message: 'Your verification has been approved successfully.'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          title: 'Verification Rejected',
          message: rejectionReason || 'Your verification was rejected. Please review and resubmit.'
        };
      case 'expired':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeVariant: 'secondary' as const,
          title: 'Verification Expired',
          message: 'Your verification has expired. Please submit a new request.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'secondary' as const,
          title: 'Verification Pending',
          message: 'Your verification is under review. We\'ll notify you once it\'s processed.'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={cn("w-full", config.borderColor, config.bgColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            {config.title}
          </CardTitle>
          <Badge variant={config.badgeVariant}>
            {type} Verification
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">{config.message}</p>
        
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Submitted:</span>
            <span>{new Date(submittedAt).toLocaleDateString()}</span>
          </div>
          
          {reviewedAt && (
            <div className="flex justify-between">
              <span>Reviewed:</span>
              <span>{new Date(reviewedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        {status === 'rejected' && rejectionReason && (
          <div className="mt-3 p-3 bg-red-100 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</h4>
            <p className="text-sm text-red-700">{rejectionReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationStatus;
