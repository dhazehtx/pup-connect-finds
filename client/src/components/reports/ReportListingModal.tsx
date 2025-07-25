import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
// Remove unused import

interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingOwnerId: string;
}

interface ReportConfig {
  listingReportReasons: Array<{ value: string; label: string }>;
  severityLevels: Array<{ value: string; label: string }>;
}

interface RateLimitInfo {
  canReport: boolean;
  remainingReports: number;
  resetTime?: string;
}

const ReportListingModal: React.FC<ReportListingModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingOwnerId
}) => {
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      checkRateLimit();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/reports/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load report config:', error);
    }
  };

  const checkRateLimit = async () => {
    try {
      const response = await fetch('/api/reports/rate-limit');
      const data = await response.json();
      if (data.success) {
        setRateLimitInfo(data);
      }
    } catch (error) {
      console.error('Failed to check rate limit:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a reason and provide details",
        variant: "destructive"
      });
      return;
    }

    if (message.trim().length < 10) {
      toast({
        title: "More Details Needed",
        description: "Please provide at least 10 characters of detail",
        variant: "destructive"
      });
      return;
    }

    if (!rateLimitInfo?.canReport) {
      toast({
        title: "Report Limit Reached",
        description: `You have reached your daily report limit. Resets at ${rateLimitInfo?.resetTime}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          listingOwnerId,
          reason,
          message: message.trim(),
          severity
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our marketplace safe. We'll review your report shortly."
        });
        
        // Reset form and close modal
        setReason('');
        setMessage('');
        setSeverity('medium');
        onClose();
      } else {
        toast({
          title: "Report Failed",
          description: data.error || "Failed to submit report. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast({
        title: "Report Failed",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!config || !rateLimitInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2">Loading...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!rateLimitInfo.canReport) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Daily Report Limit Reached
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              You have reached your daily limit of 5 reports. This helps prevent spam and abuse of the reporting system.
            </p>
            <p className="text-sm text-gray-500">
              Your limit will reset at {new Date(rateLimitInfo.resetTime!).toLocaleTimeString()}.
            </p>
            <Button onClick={onClose} className="w-full">
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Report Listing: {listingTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> False reports may result in account restrictions. 
              Only submit reports for genuine policy violations.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {config.listingReportReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Priority Level</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.severityLevels.map((severityOption) => (
                  <SelectItem key={severityOption.value} value={severityOption.value}>
                    {severityOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Details *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide specific details about the issue (minimum 10 characters)"
              rows={4}
              className="resize-none"
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500">
              {message.length}/500 characters (minimum 10 required)
            </p>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="text-xs space-y-1">
              <li>• Our moderation team will review your report within 24 hours</li>
              <li>• You'll receive a notification when the report is resolved</li>
              <li>• The listing owner will be notified if action is taken</li>
              <li>• You have {rateLimitInfo.remainingReports - 1} reports remaining today</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !reason || message.length < 10}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportListingModal;