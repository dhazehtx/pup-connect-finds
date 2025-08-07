import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'react-router-dom';

interface BugReportData {
  route: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

export function FloatingBugReportButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const [bugReportData, setBugReportData] = useState<BugReportData>({
    route: location.pathname,
    description: '',
    severity: 'medium',
  });

  const submitBugReport = useMutation({
    mutationFn: async (data: BugReportData) => {
      return apiRequest('/api/qa/bug-report', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          user_id: user?.id,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for helping improve the app!",
      });
      setIsOpen(false);
      setBugReportData({
        route: location.pathname,
        description: '',
        severity: 'medium',
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Only show in development mode
  if (!isDevelopment || !user) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 rounded-full h-12 w-12 bg-red-600 hover:bg-red-700 shadow-lg"
        size="sm"
      >
        <Bug className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report a Bug</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="route">Page/Route</Label>
              <input
                id="route"
                placeholder="e.g., /marketplace, /admin"
                value={bugReportData.route}
                onChange={(e) => setBugReportData(prev => ({ ...prev, route: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={bugReportData.severity} onValueChange={(value: any) => setBugReportData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the bug, steps to reproduce, expected behavior..."
                value={bugReportData.description}
                onChange={(e) => setBugReportData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            
            <Button 
              onClick={() => submitBugReport.mutate(bugReportData)}
              disabled={submitBugReport.isPending || !bugReportData.description}
              className="w-full"
            >
              {submitBugReport.isPending ? 'Submitting...' : 'Submit Bug Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}