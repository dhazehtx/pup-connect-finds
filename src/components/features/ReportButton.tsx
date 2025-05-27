
import React, { useState } from 'react';
import { Flag, AlertTriangle, Shield } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  const [urgentConcern, setUrgentConcern] = useState(false);
  const [contactAuthorities, setContactAuthorities] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const reportReasons = [
    { value: 'scam', label: 'Suspected scam or fraud', severity: 'high' },
    { value: 'fake', label: 'Fake or misleading listing', severity: 'high' },
    { value: 'health', label: 'Animal health/welfare concerns', severity: 'urgent' },
    { value: 'underage', label: 'Puppies under 8 weeks old', severity: 'urgent' },
    { value: 'mill', label: 'Suspected puppy mill operation', severity: 'urgent' },
    { value: 'price', label: 'Unrealistic or suspicious pricing', severity: 'medium' },
    { value: 'documentation', label: 'Missing health/vaccination records', severity: 'medium' },
    { value: 'inappropriate', label: 'Inappropriate content or language', severity: 'low' },
    { value: 'spam', label: 'Spam or duplicate listing', severity: 'low' },
    { value: 'other', label: 'Other concerns', severity: 'medium' },
  ];

  const selectedReasonData = reportReasons.find(r => r.value === reportReason);

  const handleSubmit = () => {
    if (!reportReason) {
      toast({
        title: "Please select a reason",
        description: "You need to select a reason for reporting this listing",
        variant: "destructive",
      });
      return;
    }

    // Log the comprehensive report data
    console.log('Comprehensive report submitted:', { 
      listingId, 
      reason: reportReason, 
      description,
      severity: selectedReasonData?.severity,
      urgentConcern,
      contactAuthorities,
      timestamp: new Date().toISOString(),
      reporterAction: contactAuthorities ? 'authorities_contacted' : 'platform_only'
    });
    
    setIsOpen(false);
    setShowSuccess(true);
    setReportReason('');
    setDescription('');
    setUrgentConcern(false);
    setContactAuthorities(false);

    // Show different success messages based on severity
    const successMessage = selectedReasonData?.severity === 'urgent' 
      ? "Urgent report submitted - our team will review immediately"
      : "Report submitted successfully - we'll review this within 24 hours";
    
    toast({
      title: "Report submitted",
      description: successMessage,
    });
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
              Report Listing: {listingTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Help us maintain a safe marketplace by reporting violations of our community standards.
            </p>
            
            <div>
              <Label className="text-sm font-medium text-deep-navy">Reason for reporting:</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-2">
                {reportReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="text-sm flex items-center gap-2">
                      {reason.label}
                      {reason.severity === 'urgent' && (
                        <Shield size={12} className="text-red-500" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {selectedReasonData?.severity === 'urgent' && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Urgent Animal Welfare Concern</p>
                    <p className="text-xs text-red-700 mt-1">
                      This type of issue may require immediate attention from local animal control authorities.
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="urgent" 
                      checked={urgentConcern} 
                      onCheckedChange={setUrgentConcern}
                    />
                    <Label htmlFor="urgent" className="text-xs text-red-800">
                      This requires urgent attention
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="authorities" 
                      checked={contactAuthorities} 
                      onCheckedChange={setContactAuthorities}
                    />
                    <Label htmlFor="authorities" className="text-xs text-red-800">
                      I will also contact local authorities
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-deep-navy">Additional details:</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide specific details about your concern. Include any evidence or observations that support your report..."
                className="mt-2"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>What happens next:</strong> Our moderation team reviews all reports within 24 hours. 
                Urgent animal welfare concerns are escalated immediately. We may contact you for additional information.
              </p>
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
