
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EscrowDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrowTransactionId: string;
  onDisputeCreated?: () => void;
}

const EscrowDisputeDialog: React.FC<EscrowDisputeDialogProps> = ({
  open,
  onOpenChange,
  escrowTransactionId,
  onDisputeCreated
}) => {
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const disputeCategories = [
    { value: 'no_show', label: 'Other party did not show up' },
    { value: 'condition_mismatch', label: 'Puppy condition different than described' },
    { value: 'health_issues', label: 'Health concerns discovered' },
    { value: 'documentation', label: 'Missing or incorrect documentation' },
    { value: 'behavioral', label: 'Behavioral issues not disclosed' },
    { value: 'fraud', label: 'Suspected fraud or misrepresentation' },
    { value: 'other', label: 'Other issue' }
  ];

  const handleCreateDispute = async () => {
    if (!disputeCategory || !disputeReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a category and provide details about the issue",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const fullReason = `Category: ${disputeCategories.find(c => c.value === disputeCategory)?.label}\n\nDetails: ${disputeReason}`;

      const { error } = await supabase.functions.invoke('create-escrow-dispute', {
        body: {
          escrowTransactionId,
          reason: fullReason
        }
      });

      if (error) throw error;

      toast({
        title: "Dispute Created",
        description: "Your dispute has been submitted. An administrator will review your case within 24 hours.",
      });

      if (onDisputeCreated) {
        onDisputeCreated();
      }

      onOpenChange(false);
      setDisputeReason('');
      setDisputeCategory('');

    } catch (error: any) {
      toast({
        title: "Failed to Create Dispute",
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
            <AlertTriangle className="text-red-600" size={20} />
            Report Transaction Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-sm text-amber-800">
              Creating a dispute will pause the transaction and notify our support team. 
              Please provide as much detail as possible.
            </p>
          </div>

          <div>
            <Label htmlFor="disputeCategory">Issue Category</Label>
            <Select value={disputeCategory} onValueChange={setDisputeCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {disputeCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="disputeReason">Describe the Issue</Label>
            <Textarea
              id="disputeReason"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Please provide detailed information about what went wrong..."
              rows={4}
              className="mt-1"
            />
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
              onClick={handleCreateDispute}
              disabled={loading || !disputeCategory || !disputeReason.trim()}
              className="flex-1"
            >
              {loading ? (
                <AlertTriangle className="animate-pulse mr-2" size={16} />
              ) : (
                <Send className="mr-2" size={16} />
              )}
              Submit Dispute
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowDisputeDialog;
