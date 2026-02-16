import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RefundRequest {
  id: string;
  user_id: string;
  transaction_id: string;
  charge_id: string;
  reason: string;
  detailed_reason: string;
  status: string;
  refund_amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_username: string;
  transaction_amount: string;
  product_type: string;
}

interface RefundStats {
  total_requests: number;
  pending: number;
  approved: number;
  declined: number;
  refunded: number;
  failed: number;
  total_refunded_amount: number;
  common_reasons: Record<string, number>;
}

export const AdminRefundPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'approve' | 'decline' | null }>({
    open: false,
    action: null
  });
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch all refund requests
  const { data: refundsData, isLoading: refundsLoading } = useQuery({
    queryKey: ['/api/refunds/admin/all'],
    queryFn: async () => {
      const response = await fetch('/api/refunds/admin/all');
      if (!response.ok) throw new Error('Failed to fetch refunds');
      return response.json();
    }
  });

  // Fetch refund statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/refunds/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/refunds/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Admin action mutation
  const adminActionMutation = useMutation({
    mutationFn: async ({ refundId, action, notes }: { refundId: string; action: 'approve' | 'decline'; notes?: string }) => {
      const response = await fetch(`/api/refunds/admin/${refundId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, admin_notes: notes })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error);
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'approve' ? 'Refund Approved' : 'Refund Declined',
        description: variables.action === 'approve' 
          ? 'The refund has been processed successfully.'
          : 'The refund request has been declined.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/refunds/admin/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/refunds/admin/stats'] });
      
      setActionDialog({ open: false, action: null });
      setAdminNotes('');
      setSelectedRefund(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Action Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAdminAction = (action: 'approve' | 'decline') => {
    if (!selectedRefund) return;
    
    if (action === 'decline' && !adminNotes.trim()) {
      toast({
        title: 'Admin Notes Required',
        description: 'Please provide a reason for declining the refund.',
        variant: 'destructive',
      });
      return;
    }
    
    adminActionMutation.mutate({
      refundId: selectedRefund.id,
      action,
      notes: adminNotes.trim() || undefined
    });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-blue-100 text-blue-800', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
      refunded: { color: 'bg-green-100 text-green-800', label: 'Refunded' },
      declined: { color: 'bg-red-100 text-red-800', label: 'Declined' },
      failed: { color: 'bg-gray-100 text-gray-800', label: 'Failed' },
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      canceled_order: 'Order Canceled',
      scam_listing: 'Fraudulent Listing',
      dispute_resolved: 'Dispute Resolved',
      service_not_delivered: 'Service Not Delivered',
      item_not_as_described: 'Item Not As Described',
      duplicate_payment: 'Duplicate Payment',
      other: 'Other'
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const refunds: RefundRequest[] = refundsData?.refunds || [];
  const stats: RefundStats = statsData || {
    total_requests: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    refunded: 0,
    failed: 0,
    total_refunded_amount: 0,
    common_reasons: {}
  };

  const pendingRefunds = refunds.filter(r => r.status === 'pending');
  const processedRefunds = refunds.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Refund Management</h1>
          <p className="text-gray-600">Review and process refund requests</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_requests}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successfully Refunded</p>
                <p className="text-2xl font-bold text-green-600">{stats.refunded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                <p className="text-2xl font-bold text-gray-900">${stats.total_refunded_amount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed ({stats.approved + stats.declined + stats.refunded + stats.failed})
          </TabsTrigger>
          <TabsTrigger value="stats">
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Pending Refunds */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRefunds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending refund requests to review.</p>
              </CardContent>
            </Card>
          ) : (
            pendingRefunds.map((refund) => (
              <Card key={refund.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">
                          {refund.user_name || refund.user_username}
                        </h3>
                        {getStatusBadge(refund.status)}
                        <Badge variant="outline">
                          {getReasonLabel(refund.reason)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="ml-2 font-medium">${parseFloat(refund.refund_amount).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Transaction:</span>
                          <span className="ml-2 font-mono text-xs">{refund.transaction_id.slice(-8)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Requested:</span>
                          <span className="ml-2">{formatDate(refund.created_at)}</span>
                        </div>
                      </div>

                      {refund.detailed_reason && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{refund.detailed_reason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRefund(refund);
                          setActionDialog({ open: true, action: 'approve' });
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRefund(refund);
                          setActionDialog({ open: true, action: 'decline' });
                        }}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Processed Refunds */}
        <TabsContent value="processed" className="space-y-4">
          {processedRefunds.slice(0, 20).map((refund) => (
            <Card key={refund.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{refund.user_name || refund.user_username}</span>
                      {getStatusBadge(refund.status)}
                      <Badge variant="outline">{getReasonLabel(refund.reason)}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${parseFloat(refund.refund_amount).toFixed(2)} • {formatDate(refund.updated_at)}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-mono text-xs text-gray-500">
                      {refund.transaction_id.slice(-8)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Refund Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.common_reasons)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([reason, count]) => (
                      <div key={reason} className="flex justify-between items-center">
                        <span className="text-sm">{getReasonLabel(reason)}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Refunded</span>
                    <Badge className="bg-green-100 text-green-800">{stats.refunded}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Review</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats.pending}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Declined</span>
                    <Badge className="bg-red-100 text-red-800">{stats.declined}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed</span>
                    <Badge className="bg-gray-100 text-gray-800">{stats.failed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, action: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' ? 'Approve Refund' : 'Decline Refund'}
            </DialogTitle>
            <DialogDescription>
              {selectedRefund && (
                <>
                  {actionDialog.action === 'approve' 
                    ? `Approve refund of $${parseFloat(selectedRefund.refund_amount).toFixed(2)} for ${selectedRefund.user_name || selectedRefund.user_username}?`
                    : `Decline refund request from ${selectedRefund.user_name || selectedRefund.user_username}?`
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === 'decline' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for declining (required):</label>
              <Textarea
                placeholder="Provide a clear explanation for why this refund is being declined..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          {actionDialog.action === 'approve' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will process the refund immediately through Stripe. This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialog({ open: false, action: null });
                setAdminNotes('');
              }}
              disabled={adminActionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAdminAction(actionDialog.action!)}
              disabled={adminActionMutation.isPending}
              className={
                actionDialog.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {adminActionMutation.isPending ? 'Processing...' : 
               actionDialog.action === 'approve' ? 'Approve Refund' : 'Decline Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};