import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Users, Lock, Eye, FileText, Video, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const TrustSafetyPublic = () => {
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    email: '',
    description: '',
    location: ''
  });
  const [issueForm, setIssueForm] = useState({
    name: '',
    email: '',
    type: '',
    description: ''
  });
  const { toast } = useToast();

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send an email via backend
    console.log('Emergency report submitted:', emergencyForm);
    toast({
      title: "Emergency Report Submitted",
      description: "Your emergency report has been submitted. We will respond immediately.",
    });
    setEmergencyForm({ name: '', email: '', description: '', location: '' });
    setIsEmergencyDialogOpen(false);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send an email via backend
    console.log('Issue report submitted:', issueForm);
    toast({
      title: "Report Submitted",
      description: "Your report has been submitted. We will review it and respond within 24 hours.",
    });
    setIssueForm({ name: '', email: '', type: '', description: '' });
    setIsIssueDialogOpen(false);
  };

  const safetyFeatures = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Verified Breeders',
      description: 'All breeders undergo thorough verification including background checks, license verification, and reference validation.',
      status: 'Active'
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Secure Payments',
      description: 'Our escrow system protects your payment until you meet your puppy and confirm the transaction.',
      status: 'Active'
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'Content Moderation',
      description: 'AI-powered and human moderation ensures all listings meet our quality and safety standards.',
      status: 'Active'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community Reporting',
      description: 'Our community helps identify and report suspicious activity to keep the platform safe.',
      status: 'Active'
    }
  ];

  const safetyTips = [
    {
      category: 'Before You Buy',
      tips: [
        'Always meet the puppy and breeder in person',
        'Schedule a video call with the breeder to see the puppy and parents',
        'Verify health certificates and vaccination records',
        'Ask to see the puppy\'s parents if possible',
        'Research the breed and breeder thoroughly'
      ]
    },
    {
      category: 'During the Transaction',
      tips: [
        'Use our secure escrow payment system',
        'Document everything with photos and messages',
        'Don\'t rush - take time to inspect the puppy',
        'Ask questions about the puppy\'s care and history'
      ]
    },
    {
      category: 'Red Flags to Watch',
      tips: [
        'Sellers who won\'t meet in person',
        'Prices significantly below market value',
        'Requests for wire transfers or gift cards',
        'Multiple breeds available from the same seller'
      ]
    }
  ];

  const communityGuidelines = [
    'Be honest and accurate in all listings and communications',
    'Respect other users and maintain professional conduct',
    'Only list puppies that are at least 8 weeks old',
    'Provide complete health and vaccination information',
    'Report suspicious or fraudulent activity immediately',
    'Follow all local and state laws regarding pet sales'
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-cloud-white" />
            <h1 className="text-4xl font-bold mb-4">Trust & Safety</h1>
            <p className="text-xl opacity-90">Your safety and security are our top priorities</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Safety Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-deep-navy mb-8 text-center">How We Keep You Safe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="border-soft-sky">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-royal-blue">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-deep-navy">{feature.title}</h3>
                        <Badge className="bg-green-100 text-green-800">{feature.status}</Badge>
                      </div>
                      <p className="text-deep-navy/70">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-deep-navy mb-8 text-center">Safety Tips</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {safetyTips.map((section, index) => (
              <Card key={index} className="border-soft-sky">
                <CardHeader>
                  <CardTitle className="text-deep-navy">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-2">
                        {section.category === 'Before You Buy' && tip.includes('video call') ? (
                          <Video className="h-4 w-4 text-royal-blue mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-deep-navy/70">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mb-12">
          <Card className="border-soft-sky">
            <CardHeader>
              <CardTitle className="text-deep-navy text-center">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityGuidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-royal-blue mt-0.5 flex-shrink-0" />
                    <span className="text-deep-navy/70">{guideline}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact and Report Issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="mr-2" />
                Report Emergency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                If you encounter fraud, abuse, or immediate safety concerns, submit an emergency report.
              </p>
              <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Mail className="mr-2" size={16} />
                    Submit Emergency Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-red-800">Emergency Report</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEmergencySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="emergency-name">Your Name</Label>
                      <Input
                        id="emergency-name"
                        value={emergencyForm.name}
                        onChange={(e) => setEmergencyForm({...emergencyForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-email">Your Email</Label>
                      <Input
                        id="emergency-email"
                        type="email"
                        value={emergencyForm.email}
                        onChange={(e) => setEmergencyForm({...emergencyForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-location">Location (if applicable)</Label>
                      <Input
                        id="emergency-location"
                        value={emergencyForm.location}
                        onChange={(e) => setEmergencyForm({...emergencyForm, location: e.target.value})}
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency-description">Describe the Emergency</Label>
                      <Textarea
                        id="emergency-description"
                        value={emergencyForm.description}
                        onChange={(e) => setEmergencyForm({...emergencyForm, description: e.target.value})}
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                      Submit Emergency Report
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-soft-sky">
            <CardHeader>
              <CardTitle className="text-deep-navy flex items-center">
                <FileText className="mr-2" />
                Report an Issue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-deep-navy/70 mb-4">
                Help us maintain a safe community by reporting suspicious listings or behavior.
              </p>
              <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
                    <FileText className="mr-2" size={16} />
                    Submit Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-deep-navy">Report an Issue</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleIssueSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="issue-name">Your Name</Label>
                      <Input
                        id="issue-name"
                        value={issueForm.name}
                        onChange={(e) => setIssueForm({...issueForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="issue-email">Your Email</Label>
                      <Input
                        id="issue-email"
                        type="email"
                        value={issueForm.email}
                        onChange={(e) => setIssueForm({...issueForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="issue-type">Issue Type</Label>
                      <select
                        id="issue-type"
                        value={issueForm.type}
                        onChange={(e) => setIssueForm({...issueForm, type: e.target.value})}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        required
                      >
                        <option value="">Select issue type</option>
                        <option value="suspicious-listing">Suspicious Listing</option>
                        <option value="fraud">Fraud</option>
                        <option value="harassment">Harassment</option>
                        <option value="fake-profile">Fake Profile</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="issue-description">Describe the Issue</Label>
                      <Textarea
                        id="issue-description"
                        value={issueForm.description}
                        onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Report
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-soft-sky/20 to-royal-blue/10 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-deep-navy mb-6 text-center">Trust by the Numbers</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-royal-blue mb-2">99.8%</div>
              <p className="text-deep-navy/70">Safe Transactions</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-royal-blue mb-2">24/7</div>
              <p className="text-deep-navy/70">Security Monitoring</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-royal-blue mb-2">2,847</div>
              <p className="text-deep-navy/70">Verified Breeders</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-royal-blue mb-2">&lt;1hr</div>
              <p className="text-deep-navy/70">Average Response Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSafetyPublic;
