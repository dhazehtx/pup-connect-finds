
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Flag, BookOpen, Phone, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const TrustSafetyPanel = () => {
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const safetyResources = [
    {
      title: 'Buyer Protection Guide',
      description: 'Learn how to safely purchase from breeders and shelters',
      icon: Shield,
      link: '/safety/buyer-guide'
    },
    {
      title: 'Seller Best Practices',
      description: 'Guidelines for ethical breeding and rehoming',
      icon: BookOpen,
      link: '/safety/seller-guide'
    },
    {
      title: 'Platform Policies',
      description: 'Community guidelines and terms of service',
      icon: AlertTriangle,
      link: '/safety/policies'
    },
    {
      title: 'Emergency Contacts',
      description: '24/7 support for urgent safety concerns',
      icon: Phone,
      link: '/safety/emergency'
    }
  ];

  const reportTypes = [
    'Suspected scam or fraud',
    'Fake or misleading listing',
    'Inappropriate behavior',
    'Animal welfare concern',
    'Payment dispute',
    'Other safety issue'
  ];

  const handleSubmitReport = () => {
    // Here you would typically send the report to your backend
    console.log('Submitting report:', { reportType, reportDescription });
    setIsReportOpen(false);
    setReportType('');
    setReportDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Shield className="h-5 w-5" />
            Trust & Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-700">
            Your safety is our priority. Use these resources to stay protected on our platform.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Report Safety Concern</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Type of Issue</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="">Select issue type...</option>
                      {reportTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Please provide details about the safety concern..."
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubmitReport}
                      disabled={!reportType || !reportDescription}
                      className="flex-1"
                    >
                      Submit Report
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReportOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safetyResources.map((resource, index) => {
          const IconComponent = resource.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{resource.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{resource.description}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-blue-600">
                      Learn More →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Safety Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Badge className="bg-green-100 text-green-800 text-xs">TIP</Badge>
            <p className="text-sm">Always verify breeder credentials before making payments</p>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-green-100 text-green-800 text-xs">TIP</Badge>
            <p className="text-sm">Meet in safe, public locations when possible</p>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-green-100 text-green-800 text-xs">TIP</Badge>
            <p className="text-sm">Use our platform's secure messaging and payment systems</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustSafetyPanel;
