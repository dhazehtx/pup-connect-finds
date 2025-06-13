
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Eye, Clock, Activity } from 'lucide-react';
import { FraudEvent } from '@/hooks/useRefundManagement';

interface FraudAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fraudEvent: FraudEvent;
}

const FraudAnalysisDialog: React.FC<FraudAnalysisDialogProps> = ({
  open,
  onOpenChange,
  fraudEvent
}) => {
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 0.8) return 'text-red-600 bg-red-100';
    if (riskScore >= 0.6) return 'text-orange-600 bg-orange-100';
    if (riskScore >= 0.3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-red-100 text-red-800';
      case 'false_positive': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const riskFactors = fraudEvent.details?.risk_factors || [];
  const userBehavior = fraudEvent.details?.user_behavior || {};
  const transactionDetails = fraudEvent.details?.transaction_details || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="text-red-600" size={20} />
            Fraud Analysis Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Score Header */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getRiskColor(fraudEvent.risk_score)}`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold text-lg">
                Risk Score: {(fraudEvent.risk_score * 100).toFixed(0)}%
              </span>
            </div>
            <Badge className={`ml-2 ${getStatusColor(fraudEvent.status)}`}>
              {fraudEvent.status.toUpperCase()}
            </Badge>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="text-blue-600" size={16} />
                <span className="font-medium">Event Information</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Event Type:</span> {fraudEvent.event_type.replace('_', ' ')}
                </div>
                <div>
                  <span className="text-gray-600">Detection Method:</span> {fraudEvent.detection_method}
                </div>
                <div>
                  <span className="text-gray-600">Detected:</span> {' '}
                  {new Date(fraudEvent.created_at).toLocaleString()}
                </div>
                {fraudEvent.auto_action_taken && (
                  <div>
                    <span className="text-gray-600">Auto Action:</span> {' '}
                    <Badge variant="outline">{fraudEvent.auto_action_taken.replace('_', ' ')}</Badge>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-orange-600" size={16} />
                <span className="font-medium">Timeline</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Account Age:</span> {' '}
                  {fraudEvent.details?.buyer_age_days ? 
                    `${Math.floor(fraudEvent.details.buyer_age_days)} days` : 'Unknown'}
                </div>
                <div>
                  <span className="text-gray-600">Listing Age:</span> {' '}
                  {fraudEvent.details?.listing_age_hours ? 
                    `${fraudEvent.details.listing_age_hours.toFixed(1)} hours` : 'Unknown'}
                </div>
                {fraudEvent.reviewed_at && (
                  <div>
                    <span className="text-gray-600">Reviewed:</span> {' '}
                    {new Date(fraudEvent.reviewed_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" size={16} />
                <span className="font-medium">Risk Factors Detected</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {riskFactors.map((factor: string, index: number) => (
                  <Badge key={index} variant="destructive" className="justify-start">
                    {factor.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* User Behavior Analysis */}
          {Object.keys(userBehavior).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="text-purple-600" size={16} />
                <span className="font-medium">User Behavior Analysis</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {userBehavior.rapidClicks && (
                    <div>
                      <span className="text-gray-600">Rapid Clicks:</span> {userBehavior.rapidClicks}
                    </div>
                  )}
                  {userBehavior.multiplePaymentAttempts && (
                    <div>
                      <span className="text-gray-600">Payment Attempts:</span> {userBehavior.multiplePaymentAttempts}
                    </div>
                  )}
                  {userBehavior.unusualHours && (
                    <div>
                      <span className="text-gray-600">Unusual Hours:</span> Yes
                    </div>
                  )}
                  {userBehavior.sessionDuration && (
                    <div>
                      <span className="text-gray-600">Session Duration:</span> {userBehavior.sessionDuration}s
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {Object.keys(transactionDetails).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="text-blue-600" size={16} />
                <span className="font-medium">Transaction Analysis</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {transactionDetails.ipLocation && (
                    <div>
                      <span className="text-gray-600">IP Location:</span> {transactionDetails.ipLocation}
                    </div>
                  )}
                  {transactionDetails.userLocation && (
                    <div>
                      <span className="text-gray-600">User Location:</span> {transactionDetails.userLocation}
                    </div>
                  )}
                  {transactionDetails.locationMismatch && (
                    <div>
                      <span className="text-gray-600">Location Mismatch:</span> 
                      <Badge variant="destructive" className="ml-2">Yes</Badge>
                    </div>
                  )}
                  {transactionDetails.paymentMethod && (
                    <div>
                      <span className="text-gray-600">Payment Method:</span> {transactionDetails.paymentMethod}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Recommendation</h4>
            <p className="text-sm">
              {fraudEvent.risk_score >= 0.8 ? 
                '🚫 Block transaction and require manual review before proceeding.' :
                fraudEvent.risk_score >= 0.6 ?
                '⚠️ Flag for manual review before processing payment.' :
                fraudEvent.risk_score >= 0.3 ?
                '👀 Monitor transaction closely but allow to proceed.' :
                '✅ Transaction appears legitimate, proceed normally.'
              }
            </p>
          </div>

          {/* Raw Data */}
          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="font-medium cursor-pointer mb-2">
              Raw Detection Data (Click to expand)
            </summary>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(fraudEvent.details, null, 2)}
            </pre>
          </details>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FraudAnalysisDialog;
