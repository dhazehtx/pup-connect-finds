
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, Users } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Updated resolution options - removed partial refund to prevent scams
  const resolutionOptions = [
    {
      value: 'refund_buyer',
      label: 'Full Refund to Buyer',
      description: 'Return the complete amount to the buyer (fraud/misrepresentation)',
      icon: <XCircle className="w-4 h-4 text-red-500" />
    },
    {
      value: 'release_seller',
      label: 'Release to Seller',
      description: 'Release the full amount to the seller (transaction valid)',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      value: 'mediation',
      label: 'Require Mediation',
      description: 'Escalate to a human mediator for complex cases',
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
          resolutionNotes
        }
      });

      if (error) throw error;

      toast({
        title: "Dispute Resolved",
        description: `Dispute resolved with ${resolution.replace('_', ' ')} - full transparency, no partial refunds.`,
      });

      if (onResolved) {
        onResolved();
      }

      onOpenChange(false);
      setResolution('');
      setResolutionNotes('');

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
            Resolve Dispute - Full Refunds Only
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800">
              {dispute.dog_listings?.dog_name} - {dispute.dog_listings?.breed}
            </h4>
            <p className="text-sm text-blue-600">Amount: ${dispute.amount}</p>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Policy:</strong> To prevent scams and ensure fairness, we only process full refunds. 
              No partial refunds are allowed for dog transactions.
            </p>
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
              All refunds are processed as full amounts to maintain transparency.
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
