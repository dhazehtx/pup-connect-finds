
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, User, FileText } from 'lucide-react';
import { RefundRequest } from '@/hooks/useRefundManagement';

interface RefundRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refundRequest: RefundRequest;
  onProcessed?: () => void;
}

const RefundRequestDialog: React.FC<RefundRequestDialogProps> = ({
  open,
  onOpenChange,
  refundRequest,
  onProcessed
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fraud': return 'bg-red-100 text-red-800';
      case 'admin_approved': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            Refund Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {refundRequest.escrow_transactions?.dog_listings?.dog_name || 'Unknown Puppy'}
              </h3>
              <p className="text-gray-600">
                {refundRequest.escrow_transactions?.dog_listings?.breed || 'Unknown Breed'}
              </p>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(refundRequest.status)}>
                {refundRequest.status.toUpperCase()}
              </Badge>
              <Badge className={`ml-2 ${getTypeColor(refundRequest.refund_type)}`}>
                {refundRequest.refund_type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Amount Info */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-green-600" size={20} />
              <span className="font-semibold">Refund Amount</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${refundRequest.refund_amount.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              Original Transaction: ${refundRequest.escrow_transactions?.amount.toFixed(2) || '0.00'}
            </p>
          </div>

          {/* Refund Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="text-blue-600" size={16} />
                <span className="font-medium">Request Info</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Requested by:</span> {refundRequest.requester_id}
                </div>
                <div>
                  <span className="text-gray-600">Created:</span> {' '}
                  {new Date(refundRequest.created_at).toLocaleString()}
                </div>
                {refundRequest.processed_at && (
                  <div>
                    <span className="text-gray-600">Processed:</span> {' '}
                    {new Date(refundRequest.processed_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-orange-600" size={16} />
                <span className="font-medium">Processing Info</span>
              </div>
              <div className="space-y-2 text-sm">
                {refundRequest.processed_by && (
                  <div>
                    <span className="text-gray-600">Processed by:</span> {refundRequest.processed_by}
                  </div>
                )}
                {refundRequest.stripe_refund_id && (
                  <div>
                    <span className="text-gray-600">Stripe Refund ID:</span> {' '}
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      {refundRequest.stripe_refund_id}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-gray-600" size={16} />
              <span className="font-medium">Refund Reason</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">{refundRequest.refund_reason}</p>
            </div>
          </div>

          {/* Admin Notes */}
          {refundRequest.admin_notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-purple-600" size={16} />
                <span className="font-medium">Admin Notes</span>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm">{refundRequest.admin_notes}</p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {refundRequest.escrow_transactions && (
            <div>
              <h4 className="font-medium mb-2">Transaction Details</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <div>
                  <span className="text-gray-600">Payment Intent:</span> {' '}
                  <code className="bg-white px-1 rounded text-xs">
                    {refundRequest.escrow_transactions.stripe_payment_intent_id}
                  </code>
                </div>
                <div>
                  <span className="text-gray-600">Buyer ID:</span> {refundRequest.escrow_transactions.buyer_id}
                </div>
                <div>
                  <span className="text-gray-600">Seller ID:</span> {refundRequest.escrow_transactions.seller_id}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefundRequestDialog;
