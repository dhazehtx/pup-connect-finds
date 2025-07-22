
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRefundManagement, RefundRequest, FraudEvent } from '@/hooks/useRefundManagement';
import RefundRequestDialog from './RefundRequestDialog';
import FraudAnalysisDialog from './FraudAnalysisDialog';

const RefundManagementDashboard = () => {
  const { user } = useAuth();
  const {
    fetchRefundRequests,
    fetchFraudEvents,
    processRefund,
    isProcessing
  } = useRefundManagement();

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [fraudEvents, setFraudEvents] = useState<FraudEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [selectedFraud, setSelectedFraud] = useState<FraudEvent | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showFraudDialog, setShowFraudDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [refunds, frauds] = await Promise.all([
        fetchRefundRequests(),
        fetchFraudEvents()
      ]);
      setRefundRequests(refunds);
      setFraudEvents(frauds);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (refundRequest: RefundRequest) => {
    try {
      await processRefund(refundRequest.id, true); // Admin approval
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
      processed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 0.8) {
      return <Badge variant="destructive">High Risk ({(riskScore * 100).toFixed(0)}%)</Badge>;
    } else if (riskScore >= 0.6) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">
        Medium Risk ({(riskScore * 100).toFixed(0)}%)
      </Badge>;
    } else if (riskScore >= 0.3) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">
        Low Risk ({(riskScore * 100).toFixed(0)}%)
      </Badge>;
    }
    return <Badge variant="secondary">Minimal Risk ({(riskScore * 100).toFixed(0)}%)</Badge>;
  };

  const pendingRefunds = refundRequests.filter(r => r.status === 'pending');
  const processedRefunds = refundRequests.filter(r => r.status === 'processed');
  const highRiskFrauds = fraudEvents.filter(f => f.risk_score >= 0.6);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading refund data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="text-green-600" size={24} />
              Refund Management Dashboard
            </CardTitle>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {pendingRefunds.length}
              </div>
              <div className="text-sm text-gray-600">Pending Refunds</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {processedRefunds.length}
              </div>
              <div className="text-sm text-gray-600">Processed Refunds</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {highRiskFrauds.length}
              </div>
              <div className="text-sm text-gray-600">High Risk Alerts</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${processedRefunds.reduce((sum, r) => sum + r.refund_amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Refunded</div>
            </div>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending Refunds</TabsTrigger>
              <TabsTrigger value="processed">Processed Refunds</TabsTrigger>
              <TabsTrigger value="fraud">Fraud Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <RefundsList 
                refunds={pendingRefunds}
                onViewDetails={(refund) => {
                  setSelectedRefund(refund);
                  setShowRefundDialog(true);
                }}
                onProcess={handleProcessRefund}
                getStatusBadge={getStatusBadge}
                isProcessing={isProcessing}
              />
            </TabsContent>

            <TabsContent value="processed">
              <RefundsList 
                refunds={processedRefunds}
                onViewDetails={(refund) => {
                  setSelectedRefund(refund);
                  setShowRefundDialog(true);
                }}
                getStatusBadge={getStatusBadge}
                hideProcessButton={true}
              />
            </TabsContent>

            <TabsContent value="fraud">
              <FraudEventsList 
                fraudEvents={fraudEvents}
                onViewDetails={(fraud) => {
                  setSelectedFraud(fraud);
                  setShowFraudDialog(true);
                }}
                getRiskBadge={getRiskBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedRefund && (
        <RefundRequestDialog
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
          refundRequest={selectedRefund}
          onProcessed={loadData}
        />
      )}

      {selectedFraud && (
        <FraudAnalysisDialog
          open={showFraudDialog}
          onOpenChange={setShowFraudDialog}
          fraudEvent={selectedFraud}
        />
      )}
    </div>
  );
};

interface RefundsListProps {
  refunds: RefundRequest[];
  onViewDetails: (refund: RefundRequest) => void;
  onProcess?: (refund: RefundRequest) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  isProcessing?: boolean;
  hideProcessButton?: boolean;
}

const RefundsList: React.FC<RefundsListProps> = ({
  refunds,
  onViewDetails,
  onProcess,
  getStatusBadge,
  isProcessing = false,
  hideProcessButton = false
}) => {
  if (refunds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No refund requests found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {refunds.map((refund) => (
        <Card key={refund.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">
                    {refund.escrow_transactions?.dog_listings?.dog_name || 'Unknown'} - 
                    {refund.escrow_transactions?.dog_listings?.breed || 'Unknown Breed'}
                  </h3>
                  {getStatusBadge(refund.status)}
                  <Badge variant="outline">{refund.refund_type}</Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Amount: ${refund.refund_amount} • Created: {new Date(refund.created_at).toLocaleDateString()}
                </p>
                
                <p className="text-sm text-gray-800 mb-3">
                  Reason: {refund.refund_reason}
                </p>
                
                {refund.admin_notes && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    Admin Notes: {refund.admin_notes}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(refund)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                
                {!hideProcessButton && refund.status === 'pending' && onProcess && (
                  <Button
                    size="sm"
                    onClick={() => onProcess(refund)}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {isProcessing ? 'Processing...' : 'Process Refund'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface FraudEventsListProps {
  fraudEvents: FraudEvent[];
  onViewDetails: (fraud: FraudEvent) => void;
  getRiskBadge: (riskScore: number) => React.ReactNode;
}

const FraudEventsList: React.FC<FraudEventsListProps> = ({
  fraudEvents,
  onViewDetails,
  getRiskBadge
}) => {
  if (fraudEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No fraud events found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fraudEvents.map((fraud) => (
        <Card key={fraud.id} className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    {fraud.event_type.replace('_', ' ')}
                  </h3>
                  {getRiskBadge(fraud.risk_score)}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Detection: {fraud.detection_method} • 
                  Created: {new Date(fraud.created_at).toLocaleDateString()}
                </p>
                
                {fraud.auto_action_taken && (
                  <p className="text-sm text-orange-800 bg-orange-50 p-2 rounded mb-2">
                    Auto Action: {fraud.auto_action_taken.replace('_', ' ')}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(fraud)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Analyze
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RefundManagementDashboard;
