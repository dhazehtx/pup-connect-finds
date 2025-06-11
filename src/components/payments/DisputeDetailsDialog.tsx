
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, MapPin, User, AlertTriangle } from 'lucide-react';

interface DisputeTransaction {
  id: string;
  stripe_payment_intent_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  dispute_reason: string;
  dispute_created_at: string;
  dispute_resolved_at?: string;
  meeting_location?: string;
  meeting_scheduled_at?: string;
  dog_listings?: {
    dog_name: string;
    breed: string;
  };
  buyer_profile?: {
    full_name: string;
    email: string;
  };
  seller_profile?: {
    full_name: string;
    email: string;
  };
}

interface DisputeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: DisputeTransaction;
  userRole: string;
}

const DisputeDetailsDialog: React.FC<DisputeDetailsDialogProps> = ({
  open,
  onOpenChange,
  dispute,
  userRole
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disputed': return 'destructive';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={20} />
            Dispute Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(dispute.status)}>
                {dispute.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">{userRole.toUpperCase()}</Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Dispute ID</div>
              <div className="font-mono text-xs">{dispute.id.substring(0, 8)}</div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Transaction Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Dog:</span>
                <div className="font-medium">
                  {dispute.dog_listings?.dog_name || 'Unknown'} - {dispute.dog_listings?.breed || 'Unknown Breed'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <div className="font-medium">${dispute.amount}</div>
              </div>
              <div>
                <span className="text-gray-500">Payment Intent:</span>
                <div className="font-mono text-xs">{dispute.stripe_payment_intent_id}</div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="font-medium">{dispute.status}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Meeting Details */}
          {(dispute.meeting_location || dispute.meeting_scheduled_at) && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Meeting Information
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {dispute.meeting_location && (
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <div className="font-medium">{dispute.meeting_location}</div>
                    </div>
                  )}
                  {dispute.meeting_scheduled_at && (
                    <div>
                      <span className="text-gray-500">Scheduled Time:</span>
                      <div className="font-medium">{formatDate(dispute.meeting_scheduled_at)}</div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Parties Involved */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Parties Involved
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Buyer</div>
                <div>{dispute.buyer_profile?.full_name || 'Unknown'}</div>
                <div className="text-xs text-blue-600">{dispute.buyer_profile?.email}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">Seller</div>
                <div>{dispute.seller_profile?.full_name || 'Unknown'}</div>
                <div className="text-xs text-green-600">{dispute.seller_profile?.email}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dispute Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Dispute Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Created:</span>
                <div className="font-medium">{formatDate(dispute.dispute_created_at)}</div>
              </div>
              
              {dispute.dispute_resolved_at && (
                <div>
                  <span className="text-gray-500 text-sm">Resolved:</span>
                  <div className="font-medium">{formatDate(dispute.dispute_resolved_at)}</div>
                </div>
              )}
              
              <div>
                <span className="text-gray-500 text-sm">Reason:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {dispute.dispute_reason}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Transaction created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Dispute created - {formatDate(dispute.dispute_created_at)}</span>
              </div>
              {dispute.dispute_resolved_at && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dispute resolved - {formatDate(dispute.dispute_resolved_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeDetailsDialog;
