
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Flag, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportingSystemProps {
  reportType: 'listing' | 'user' | 'message';
  targetId: string;
  targetName: string;
  onClose: () => void;
}

const ReportingSystem = ({ reportType, targetId, targetName, onClose }: ReportingSystemProps) => {
  const [reportReason, setReportReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reportReasons = {
    listing: [
      { id: 'misleading', label: 'Misleading information', description: 'False details about the dog' },
      { id: 'scam', label: 'Suspected scam', description: 'Fraudulent listing or seller' },
      { id: 'inappropriate', label: 'Inappropriate content', description: 'Offensive images or text' },
      { id: 'illegal', label: 'Illegal activity', description: 'Puppy mill or illegal breeding' },
      { id: 'duplicate', label: 'Duplicate listing', description: 'Same dog listed multiple times' },
      { id: 'other', label: 'Other', description: 'Something else' }
    ],
    user: [
      { id: 'harassment', label: 'Harassment', description: 'Inappropriate or threatening behavior' },
      { id: 'spam', label: 'Spam', description: 'Sending unwanted messages' },
      { id: 'scam', label: 'Suspected scammer', description: 'Fraudulent behavior' },
      { id: 'fake', label: 'Fake profile', description: 'Using false identity' },
      { id: 'other', label: 'Other', description: 'Something else' }
    ],
    message: [
      { id: 'harassment', label: 'Harassment', description: 'Threatening or abusive language' },
      { id: 'spam', label: 'Spam', description: 'Unwanted promotional content' },
      { id: 'inappropriate', label: 'Inappropriate content', description: 'Offensive or explicit material' },
      { id: 'scam', label: 'Scam attempt', description: 'Fraudulent message' },
      { id: 'other', label: 'Other', description: 'Something else' }
    ]
  };

  const handleSubmit = async () => {
    if (!reportReason || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a reason and provide details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate report submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep our community safe.",
    });
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
          <p className="text-gray-600 mb-4">
            We've received your report about {targetName}. Our team will review it within 24 hours.
          </p>
          <Badge className="mb-4">Report ID: RP{targetId.slice(0, 6).toUpperCase()}</Badge>
          <div className="space-y-2">
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
            <p className="text-xs text-gray-500">
              You'll receive an email update on our investigation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Report {reportType === 'listing' ? 'Listing' : reportType === 'user' ? 'User' : 'Message'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help us maintain a safe community by reporting suspicious or inappropriate content.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report target */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="font-medium">Reporting: {targetName}</span>
          </div>
        </div>

        {/* Report reason */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            What's the issue? *
          </Label>
          <RadioGroup value={reportReason} onValueChange={setReportReason}>
            <div className="space-y-3">
              {reportReasons[reportType].map((reason) => (
                <div key={reason.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={reason.id} className="font-medium cursor-pointer">
                      {reason.label}
                    </Label>
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Additional details */}
        <div>
          <Label htmlFor="description" className="text-base font-medium mb-2 block">
            Additional Details *
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide more details about the issue..."
            rows={4}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Describe what you experienced and why you're reporting this.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!reportReason || !description.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>

        {/* Safety notice */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2 text-sm text-blue-800">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Your report is confidential</p>
              <p>The person you're reporting won't be notified that you submitted this report.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportingSystem;
