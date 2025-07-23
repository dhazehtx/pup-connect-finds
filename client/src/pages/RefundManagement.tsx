import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefundRequestForm } from '@/components/refunds/RefundRequestForm';
import { RefundStatusCard } from '@/components/refunds/RefundStatusCard';
import { AdminRefundPanel } from '@/components/refunds/AdminRefundPanel';
import { DollarSign, Plus, History, Settings } from 'lucide-react';
import { useState } from 'react';

export const RefundManagement: React.FC = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [isAdmin] = useState(true); // TODO: Get from auth context

  // Fetch user's refund requests
  const { data: userRefunds, isLoading: refundsLoading } = useQuery({
    queryKey: ['/api/refunds/user'],
    queryFn: async () => {
      const response = await fetch('/api/refunds/user');
      if (!response.ok) throw new Error('Failed to fetch refunds');
      return response.json();
    }
  });

  const handleRefundSuccess = (refundRequestId: string) => {
    setShowRequestForm(false);
    // The query will automatically refetch due to invalidation in the form
  };

  const refunds = userRefunds?.refunds || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Refund Center</h1>
            <p className="text-gray-600">Manage your refund requests and view status updates</p>
          </div>
        </div>
        
        {!showRequestForm && (
          <Button onClick={() => setShowRequestForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
        )}
      </div>

      {/* Refund Request Form */}
      {showRequestForm && (
        <div className="space-y-4">
          <RefundRequestForm
            onSuccess={handleRefundSuccess}
            onCancel={() => setShowRequestForm(false)}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="my-refunds" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-refunds" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            My Refunds ({refunds.length})
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin-panel" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin Panel
            </TabsTrigger>
          )}
        </TabsList>

        {/* User Refunds Tab */}
        <TabsContent value="my-refunds" className="space-y-6">
          {refundsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : refunds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No refund requests yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't submitted any refund requests. If you need to return a purchase or report an issue, you can request a refund here.
                </p>
                <Button onClick={() => setShowRequestForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Your First Refund
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Active/Recent Refunds */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Refund Requests</h3>
                {refunds
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((refund: any) => (
                    <RefundStatusCard
                      key={refund.id}
                      refund={refund}
                      onViewDetails={(refundId) => {
                        // TODO: Open detailed view modal or navigate to detail page
                        console.log('View details for refund:', refundId);
                      }}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Help Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Refund Policy Information</CardTitle>
              <CardDescription className="text-blue-700">
                Understanding our refund process and timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="text-blue-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Processing Times:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Auto-approved: Instant to 1 hour</li>
                    <li>• Manual review: 1-3 business days</li>
                    <li>• Bank processing: 5-10 business days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Refund Eligibility:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Order cancellations: Within 7 days</li>
                    <li>• Service issues: Within 30 days</li>
                    <li>• Fraud/scam reports: Within 60 days</li>
                  </ul>
                </div>
              </div>
              
              <Alert className="bg-blue-100 border-blue-300">
                <AlertDescription className="text-blue-800">
                  <strong>Need Help?</strong> If you have questions about the refund process or need assistance with your request, 
                  please contact our support team at support@mypup.com or use the help center.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Panel Tab */}
        {isAdmin && (
          <TabsContent value="admin-panel">
            <AdminRefundPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};