import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';
import { RefundRequest } from '@shared/schema';

interface RefundStatusCardProps {
  refund: RefundRequest & {
    transaction_amount?: string;
    product_type?: string;
  };
  onViewDetails?: (refundId: string) => void;
}

export const RefundStatusCard: React.FC<RefundStatusCardProps> = ({
  refund,
  onViewDetails
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600',
          label: 'Pending Review'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          label: 'Approved'
        };
      case 'refunded':
        return {
          icon: DollarSign,
          color: 'bg-green-100 text-green-800 border-green-300',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600',
          label: 'Refunded'
        };
      case 'declined':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-300',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          label: 'Declined'
        };
      case 'failed':
        return {
          icon: AlertTriangle,
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600',
          label: 'Failed'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600',
          label: 'Unknown'
        };
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      canceled_order: 'Order Canceled',
      scam_listing: 'Fraudulent Listing',
      dispute_resolved: 'Dispute Resolved',
      service_not_delivered: 'Service Not Delivered',
      item_not_as_described: 'Item Not As Described',
      duplicate_payment: 'Duplicate Payment',
      other: 'Other'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = getStatusConfig(refund.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
              Refund Request
            </CardTitle>
            <CardDescription className="mt-1">
              Transaction ID: {refund.transaction_id}
            </CardDescription>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount and Currency */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Refund Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            ${parseFloat(refund.refund_amount).toFixed(2)} {refund.currency?.toUpperCase()}
          </span>
        </div>

        {refund.transaction_amount && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Original Transaction:</span>
            <span className="text-gray-900">
              ${parseFloat(refund.transaction_amount).toFixed(2)}
            </span>
          </div>
        )}

        <Separator />

        {/* Reason and Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-700">Reason:</span>
            <span className="text-sm text-gray-900 text-right">
              {getReasonLabel(refund.reason)}
            </span>
          </div>
          
          {refund.detailed_reason && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {refund.detailed_reason}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Requested:</span>
            <span className="text-gray-900">{formatDate(refund.created_at)}</span>
          </div>
          
          {refund.processed_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Processed:</span>
              <span className="text-gray-900">{formatDate(refund.processed_at)}</span>
            </div>
          )}
        </div>

        {/* Stripe Refund ID */}
        {refund.stripe_refund_id && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Refund Processed
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Stripe Refund ID: {refund.stripe_refund_id}
            </p>
            <p className="text-xs text-green-600 mt-1">
              The refund has been processed and should appear in your original payment method within 5-10 business days.
            </p>
          </div>
        )}

        {/* Admin Notes for Declined Refunds */}
        {refund.status === 'declined' && refund.admin_notes && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Refund Declined</p>
                <p className="text-sm text-red-700 mt-1">{refund.admin_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Status for Pending */}
        {refund.status === 'pending' && (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                Your refund request is being reviewed. You'll receive an email notification once it's processed.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {onViewDetails && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails(refund.id)}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};