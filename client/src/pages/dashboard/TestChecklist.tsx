import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, XCircle, Bug, ExternalLink, Clipboard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';

interface TestStatus {
  status: 'pass' | 'warning' | 'fail' | 'not_tested';
  notes?: string;
}

interface BugReportData {
  route: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

function TestChecklist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({
    'product-browse': { status: 'not_tested' },
    'product-checkout': { status: 'not_tested' },
    'order-history': { status: 'not_tested' },
    'service-signup': { status: 'not_tested' },
    'service-apply': { status: 'not_tested' },
    'service-approve': { status: 'not_tested' },
    'service-book': { status: 'not_tested' },
    'service-confirm': { status: 'not_tested' },
    'messaging-send': { status: 'not_tested' },
    'messaging-receive': { status: 'not_tested' },
    'admin-verify': { status: 'not_tested' },
    'admin-products': { status: 'not_tested' },
  });

  const [showBugReport, setShowBugReport] = useState(false);
  const [bugReportData, setBugReportData] = useState<BugReportData>({
    route: '',
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
      setShowBugReport(false);
      setBugReportData({ route: '', description: '', severity: 'medium' });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const updateTestStatus = (testId: string, status: TestStatus) => {
    setTestStatuses(prev => ({
      ...prev,
      [testId]: status,
    }));
  };

  const getStatusIcon = (status: TestStatus['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: TestStatus['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const testAreas = {
    store: [
      { id: 'product-browse', name: 'Browse Products', link: '/marketplace?tab=store' },
      { id: 'product-checkout', name: 'Checkout Flow', link: '/marketplace?tab=store' },
      { id: 'order-history', name: 'Order History', link: '/dashboard/orders' },
    ],
    services: [
      { id: 'service-signup', name: 'Provider Signup', link: '/marketplace?tab=services' },
      { id: 'service-apply', name: 'Service Application', link: '/marketplace?tab=services' },
      { id: 'service-approve', name: 'Provider Approval', link: '/admin/service-applications' },
      { id: 'service-book', name: 'Book Service', link: '/marketplace?tab=services' },
      { id: 'service-confirm', name: 'Booking Confirmation', link: '/dashboard/bookings' },
    ],
    messaging: [
      { id: 'messaging-send', name: 'Send Message', link: '/messages' },
      { id: 'messaging-receive', name: 'Receive Message', link: '/messages' },
    ],
    admin: [
      { id: 'admin-verify', name: 'Verify Providers', link: '/admin/service-applications' },
      { id: 'admin-products', name: 'Manage Products', link: '/admin' },
    ],
  };

  const testCredentials = [
    {
      type: 'Test Buyer',
      email: 'testbuyer@petadoptionwebservices.com',
      password: 'TestPass123!',
      purpose: 'Testing purchases and bookings',
    },
    {
      type: 'Test Provider',
      email: 'testprovider@petadoptionwebservices.com',
      password: 'TestPass123!',
      purpose: 'Testing service provider features',
    },
    {
      type: 'Test Admin',
      email: 'admin@petadoptionwebservices.com',
      password: 'AdminPass123!',
      purpose: 'Testing admin panel features',
    },
  ];

  const stripeTestCards = [
    { number: '4242 4242 4242 4242', type: 'Visa - Success' },
    { number: '4000 0000 0000 0002', type: 'Visa - Declined' },
    { number: '4000 0000 0000 9995', type: 'Visa - Insufficient Funds' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QA Testing Dashboard</h1>
          <p className="text-muted-foreground">Internal testing and quality assurance tools</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={showBugReport} onOpenChange={setShowBugReport}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                <Bug className="w-4 h-4 mr-2" />
                Report Bug
              </Button>
            </DialogTrigger>
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
        </div>
      </div>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="testing">Testing Checklist</TabsTrigger>
          <TabsTrigger value="accounts">Test Accounts</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Testing</TabsTrigger>
          <TabsTrigger value="links">Quick Links</TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-6">
          {Object.entries(testAreas).map(([category, tests]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category} Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {tests.map((test) => {
                    const status = testStatuses[test.id];
                    return (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status.status)}
                          <div>
                            <div className="font-medium">{test.name}</div>
                            {status.notes && (
                              <div className="text-sm text-muted-foreground">{status.notes}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status.status)}>
                            {status.status.replace('_', ' ')}
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(test.link, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          
                          <Select 
                            value={status.status} 
                            onValueChange={(value: any) => updateTestStatus(test.id, { status: value })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_tested">Not Tested</SelectItem>
                              <SelectItem value="pass">Pass</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="fail">Fail</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          {testCredentials.map((account, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{account.type}</h3>
                    <p className="text-sm text-muted-foreground">{account.purpose}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm font-mono">{account.email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(account.email)}
                        >
                          <Clipboard className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Password:</span>
                        <span className="text-sm font-mono">{account.password}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(account.password)}
                        >
                          <Clipboard className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => window.open('/login', '_blank')}>
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Test Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {stripeTestCards.map((card, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-mono">{card.number}</div>
                      <div className="text-sm text-muted-foreground">{card.type}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(card.number.replace(/\s/g, ''))}
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Additional info:</strong> Use any future expiry date (e.g., 12/25), 
                    any 3-digit CVC, and any billing postal code.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Store', url: '/marketplace?tab=store', desc: 'Product marketplace' },
              { name: 'Services', url: '/marketplace?tab=services', desc: 'Pet services' },
              { name: 'Admin Panel', url: '/admin', desc: 'Admin dashboard' },
              { name: 'Provider Applications', url: '/admin/service-applications', desc: 'Service provider approvals' },
              { name: 'Bug Reports', url: '/admin/bug-reports', desc: 'View reported bugs' },
              { name: 'User Bookings', url: '/dashboard/bookings', desc: 'User booking dashboard' },
              { name: 'Provider Dashboard', url: '/dashboard/provider', desc: 'Provider management' },
              { name: 'Messages', url: '/messages', desc: 'Messaging system' },
              { name: 'Home Feed', url: '/home', desc: 'Social feed' },
            ].map((link) => (
              <Card key={link.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{link.name}</h3>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TestChecklist;