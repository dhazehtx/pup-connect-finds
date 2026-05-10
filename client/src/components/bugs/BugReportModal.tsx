import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bug, 
  Camera, 
  Upload, 
  AlertTriangle, 
  Info,
  X,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUG_CATEGORIES = [
  { value: 'ui_issue', label: 'UI/Design Issue', icon: Monitor },
  { value: 'functionality', label: 'Feature Not Working', icon: AlertTriangle },
  { value: 'performance', label: 'Performance Issue', icon: Info },
  { value: 'mobile_issue', label: 'Mobile Issue', icon: Smartphone },
  { value: 'data_issue', label: 'Data/Loading Issue', icon: Upload },
  { value: 'crash', label: 'App Crash/Error', icon: X },
  { value: 'other', label: 'Other', icon: Bug }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low - Minor issue', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium - Affects some functionality', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High - Major functionality broken', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical - App unusable', color: 'bg-red-100 text-red-800' }
];

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    priority: 'medium',
    screenshot_url: '',
    device_info: ''
  });

  // Auto-detect device info
  React.useEffect(() => {
    if (isOpen) {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      };
      
      setFormData(prev => ({
        ...prev,
        device_info: JSON.stringify(deviceInfo, null, 2)
      }));
    }
  }, [isOpen]);

  const submitBugMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/bugs', { method: 'POST', body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-reports'] });
      toast({
        title: "Bug report submitted successfully",
        description: "Thank you for helping us improve MY PUP. We'll investigate this issue.",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit bug report",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      steps_to_reproduce: '',
      expected_behavior: '',
      actual_behavior: '',
      priority: 'medium',
      screenshot_url: '',
      device_info: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "Please fill in required fields",
        description: "Subject and description are required.",
        variant: "destructive",
      });
      return;
    }

    submitBugMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!submitBugMutation.isPending) {
      onClose();
      resetForm();
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-500" />
            Report a Bug
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Priority Selection */}
          <div>
            <Label htmlFor="priority">Priority Level *</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_LEVELS.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={priority.color} variant="secondary">
                        {priority.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Bug Summary *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of the issue"
              required
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.subject.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the bug in detail..."
              rows={4}
              required
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <Label htmlFor="steps">Steps to Reproduce</Label>
            <Textarea
              id="steps"
              value={formData.steps_to_reproduce}
              onChange={(e) => setFormData(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expected Behavior */}
            <div>
              <Label htmlFor="expected">Expected Behavior</Label>
              <Textarea
                id="expected"
                value={formData.expected_behavior}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                placeholder="What should happen?"
                rows={3}
              />
            </div>

            {/* Actual Behavior */}
            <div>
              <Label htmlFor="actual">Actual Behavior</Label>
              <Textarea
                id="actual"
                value={formData.actual_behavior}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                placeholder="What actually happens?"
                rows={3}
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <Label htmlFor="screenshot">Screenshot (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Screenshot helps us understand the issue better
              </p>
              <Input
                id="screenshot"
                type="url"
                value={formData.screenshot_url}
                onChange={(e) => setFormData(prev => ({ ...prev, screenshot_url: e.target.value }))}
                placeholder="Paste image URL here"
                className="mt-2"
              />
            </div>
          </div>

          {/* Device Information Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-4 h-4" />
                <Label className="text-sm font-medium">Technical Information</Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This information will be automatically included to help us debug the issue.
              </p>
              <details className="mt-2">
                <summary className="text-sm cursor-pointer text-blue-600 hover:text-blue-700">
                  View technical details
                </summary>
                <pre className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded mt-2 overflow-auto max-h-32">
                  {formData.device_info}
                </pre>
              </details>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={submitBugMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitBugMutation.isPending || !formData.subject.trim() || !formData.description.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitBugMutation.isPending ? 'Submitting...' : 'Submit Bug Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportModal;