
import React, { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RippleButton from '@/components/ui/ripple-button';
import SuccessIndicator from '@/components/ui/success-indicator';
import { useToast } from '@/hooks/use-toast';

interface ReportButtonProps {
  listingId: number;
  listingTitle: string;
}

const ReportButton = ({ listingId, listingTitle }: ReportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const reportReasons = [
    { value: 'scam', label: 'Suspected scam or fraud' },
    { value: 'fake', label: 'Fake or misleading listing' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'price', label: 'Unrealistic pricing' },
    { value: 'health', label: 'Health/welfare concerns' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = () => {
    if (!reportReason) {
      toast({
        title: "Please select a reason",
        description: "You need to select a reason for reporting this listing",
        variant: "destructive",
      });
      return;
    }

    console.log('Report submitted:', { listingId, reason: reportReason, description });
    
    setIsOpen(false);
    setShowSuccess(true);
    setReportReason('');
    setDescription('');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
            <Flag size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-deep-navy">
              <AlertTriangle size={20} className="text-red-500" />
              Report Listing
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Help us keep the community safe by reporting suspicious or inappropriate listings.
            </p>
            
            <div>
              <Label className="text-sm font-medium text-deep-navy">Reason for reporting:</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-2">
                {reportReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="text-sm">{reason.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-deep-navy">Additional details (optional):</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional information that might help us review this report..."
                className="mt-2"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
              <RippleButton 
                onClick={handleSubmit}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Submit Report
              </RippleButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessIndicator
        show={showSuccess}
        message="Report submitted successfully!"
        onComplete={() => setShowSuccess(false)}
      />
    </>
  );
};

export default ReportButton;
