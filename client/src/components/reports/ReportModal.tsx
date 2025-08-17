import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { Flag, AlertTriangle, Shield, Ban, X } from 'lucide-react';

interface ReportModalProps {
  trigger: React.ReactNode;
  targetId: string;
  targetType: 'user' | 'post' | 'comment' | 'listing';
  targetTitle?: string;
}

const REPORT_REASONS = {
  user: [
    { value: 'harassment', label: 'Harassment or bullying', severity: 'high' },
    { value: 'fraud', label: 'Fraud or scam', severity: 'high' },
    { value: 'fake_profile', label: 'Fake or impersonation account', severity: 'medium' },
    { value: 'inappropriate_content', label: 'Inappropriate content', severity: 'medium' },
    { value: 'spam', label: 'Spam or unwanted messages', severity: 'low' },
    { value: 'other', label: 'Other violation', severity: 'low' }
  ],
  post: [
    { value: 'puppy_mill', label: 'Puppy mill or unethical breeding', severity: 'high' },
    { value: 'scam', label: 'Scam or fraudulent listing', severity: 'high' },
    { value: 'animal_abuse', label: 'Animal abuse or neglect', severity: 'high' },
    { value: 'misleading_info', label: 'Misleading information', severity: 'medium' },
    { value: 'inappropriate_content', label: 'Inappropriate content', severity: 'medium' },
    { value: 'spam', label: 'Spam or duplicate posting', severity: 'low' },
    { value: 'copyright', label: 'Copyright violation', severity: 'low' },
    { value: 'other', label: 'Other violation', severity: 'low' }
  ],
  comment: [
    { value: 'harassment', label: 'Harassment or hate speech', severity: 'high' },
    { value: 'inappropriate_content', label: 'Inappropriate content', severity: 'medium' },
    { value: 'spam', label: 'Spam or irrelevant comment', severity: 'low' },
    { value: 'misinformation', label: 'False or misleading information', severity: 'medium' },
    { value: 'other', label: 'Other violation', severity: 'low' }
  ],
  listing: [
    { value: 'puppy_mill', label: 'Puppy mill or unethical breeding', severity: 'high' },
    { value: 'scam', label: 'Scam or fraudulent listing', severity: 'high' },
    { value: 'animal_welfare', label: 'Animal welfare concerns', severity: 'high' },
    { value: 'misleading_price', label: 'Misleading pricing', severity: 'medium' },
    { value: 'fake_listing', label: 'Fake or stolen photos', severity: 'medium' },
    { value: 'spam', label: 'Spam or duplicate listing', severity: 'low' },
    { value: 'other', label: 'Other violation', severity: 'low' }
  ]
};

export const ReportModal: React.FC<ReportModalProps> = ({
  trigger,
  targetId,
  targetType,
  targetTitle
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');

  const reasons = REPORT_REASONS[targetType] || [];

  // Submit report mutation
  const reportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/reports', {
        target_id: targetId,
        target_type: targetType,
        reason: selectedReason,
        description: description.trim() || undefined
      });
    },
    onSuccess: () => {
      setOpen(false);
      setSelectedReason('');
      setDescription('');
      
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review this report promptly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting report",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to report content",
        variant: "destructive",
      });
      return;
    }

    if (!selectedReason) {
      toast({
        title: "Please select a reason",
        description: "Choose why you're reporting this content",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Shield className="w-3 h-3" />;
      default: return <Flag className="w-3 h-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Report {targetType}
          </DialogTitle>
          {targetTitle && (
            <p className="text-sm text-muted-foreground">
              "{targetTitle.length > 50 ? targetTitle.substring(0, 50) + '...' : targetTitle}"
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Why are you reporting this {targetType}?</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
              {reasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label 
                    htmlFor={reason.value} 
                    className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                  >
                    <span>{reason.label}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSeverityColor(reason.severity)}`}
                    >
                      {getSeverityIcon(reason.severity)}
                      <span className="ml-1 capitalize">{reason.severity}</span>
                    </Badge>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help our review..."
              className="mt-1 min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Community Guidelines</p>
                <p>Reports are reviewed by our moderation team. False reports may result in account restrictions.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || reportMutation.isPending}
              className="flex-1"
            >
              {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;