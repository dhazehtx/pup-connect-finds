
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DisputeTransaction {
  id: string;
  amount: number;
  buyer_id: string;
  seller_id: string;
  dispute_reason: string;
  dog_listings?: {
    dog_name: string;
    breed: string;
  };
}

interface DisputeResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: DisputeTransaction;
  onResolved?: () => void;
}

const DisputeResolutionDialog: React.FC<DisputeResolutionDialogProps> = ({
  open,
  onOpenChange,
  dispute,
  onResolved
}) => {
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState(dispute.amount.toString());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resolutionOptions = [
    {
      value: 'refund_buyer',
      label: 'Full Refund to Buyer',
      description: 'Return the full amount to the buyer',
      icon: <XCircle className="w-4 h-4 text-red-500" />
    },
    {
      value: 'partial_refund',
      label: 'Partial Refund',
      description: 'Return a portion of the amount to the buyer',
      icon: <DollarSign className="w-4 h-4 text-orange-500" />
    },
    {
      value: 'release_seller',
      label: 'Release to Seller',
      description: 'Release the full amount to the seller',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      value: 'mediation',
      label: 'Require Mediation',
      description: 'Escalate to a human mediator',
      icon: <Users className="w-4 h-4 text-blue-500" />
    }
  ];

  const handleResolveDispute = async () => {
    if (!resolution || !resolutionNotes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a resolution and provide notes",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.functions.invoke('resolve-escrow-dispute', {
        body: {
          escrowTransactionId: dispute.id,
          resolution,
          resolutionNotes,
          refundAmount: resolution === 'partial_refund' ? parseFloat(refundAmount) : null
        }
      });

      if (error) throw error;

      toast({
        title: "Dispute Resolved",
        description: "The dispute has been resolved successfully",
      });

      if (onResolved) {
        onResolved();
      }

      onOpenChange(false);
      setResolution('');
      setResolutionNotes('');
      setRefundAmount(dispute.amount.toString());

    } catch (error: any) {
      toast({
        title: "Failed to Resolve Dispute",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Resolve Dispute
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800">
              {dispute.dog_listings?.dog_name} - {dispute.dog_listings?.breed}
            </h4>
            <p className="text-sm text-blue-600">Amount: ${dispute.amount}</p>
          </div>

          <div>
            <Label>Resolution Type</Label>
            <RadioGroup value={resolution} onValueChange={setResolution} className="mt-2">
              {resolutionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-2 border rounded-lg">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{option.description}</p>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {resolution === 'partial_refund' && (
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                  max={dispute.amount}
                  step="0.01"
                  className="pl-6 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum refund: ${dispute.amount}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="resolutionNotes">Resolution Notes</Label>
            <Textarea
              id="resolutionNotes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain the reasoning for this resolution..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This action cannot be undone. Both parties will be notified of the resolution.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveDispute}
              disabled={loading || !resolution || !resolutionNotes.trim()}
              className="flex-1"
            >
              {loading ? "Resolving..." : "Resolve Dispute"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeResolutionDialog;
