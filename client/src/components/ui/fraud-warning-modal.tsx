import React from 'react';
import { AlertTriangle, Shield, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface FraudWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileStatus: 'under_review' | 'suspended';
  fraudScore: number;
  onContact?: () => void;
}

export const FraudWarningModal: React.FC<FraudWarningModalProps> = ({
  isOpen,
  onClose,
  profileStatus,
  fraudScore,
  onContact
}) => {
  const getStatusInfo = () => {
    switch (profileStatus) {
      case 'suspended':
        return {
          title: 'Account Suspended',
          description: 'Your account has been temporarily suspended due to suspicious activity.',
          color: 'bg-red-600',
          textColor: 'text-red-600',
          icon: AlertTriangle,
          severity: 'Critical'
        };
      case 'under_review':
        return {
          title: 'Account Under Review',
          description: 'Your account is currently under security review. Some features may be limited.',
          color: 'bg-red-600',
          textColor: 'text-blue-600',
          icon: Shield,
          severity: 'Medium'
        };
      default:
        return {
          title: 'Security Notice',
          description: 'We\'ve detected some unusual activity on your account.',
          color: 'bg-blue-600',
          textColor: 'text-blue-600',
          icon: Info,
          severity: 'Low'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getRiskLevel = (score: number) => {
    if (score >= 90) return { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' };
    if (score >= 70) return { level: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (score >= 50) return { level: 'Medium', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { level: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const riskLevel = getRiskLevel(fraudScore);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusInfo.color} bg-opacity-10`}>
              <StatusIcon className={`h-6 w-6 ${statusInfo.textColor}`} />
            </div>
            <div>
              <DialogTitle className={statusInfo.textColor}>
                {statusInfo.title}
              </DialogTitle>
              <Badge variant="outline" className={riskLevel.color}>
                {riskLevel.level} Risk
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription className="text-gray-600">
            {statusInfo.description}
          </DialogDescription>

          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Score:</span>
                <Badge className={riskLevel.color}>
                  {fraudScore}/100
                </Badge>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    fraudScore >= 70 ? 'bg-red-500' : 
                    fraudScore >= 50 ? 'bg-orange-500' : 
                    'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(fraudScore, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {profileStatus === 'suspended' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Account Suspended:</strong> You cannot create new listings, send messages, 
                  or make purchases until this issue is resolved.
                </div>
              </div>
            </div>
          )}

          {profileStatus === 'under_review' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Limited Access:</strong> New listings and account changes are temporarily 
                  disabled while we review your account.
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">What this means:</h4>
            <ul className="text-xs text-gray-600 space-y-1 ml-4">
              <li>• Our security system detected unusual patterns in your account activity</li>
              <li>• This is a precautionary measure to protect all users</li>
              <li>• Your account data remains safe and secure</li>
              {profileStatus === 'under_review' && (
                <li>• Most features remain available while we investigate</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Dismiss
          </Button>
          {onContact && (
            <Button
              onClick={onContact}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for handling fraud detection responses
export const useFraudDetection = () => {
  const [fraudWarning, setFraudWarning] = React.useState<{
    show: boolean;
    profileStatus: 'under_review' | 'suspended' | null;
    fraudScore: number;
  }>({
    show: false,
    profileStatus: null,
    fraudScore: 0
  });

  const checkFraudHeaders = React.useCallback((response: Response) => {
    const fraudScore = parseInt(response.headers.get('X-Fraud-Score') || '0');
    const profileStatus = response.headers.get('X-Profile-Status') as 'under_review' | 'suspended' | null;
    
    if (profileStatus && ['under_review', 'suspended'].includes(profileStatus)) {
      setFraudWarning({
        show: true,
        profileStatus,
        fraudScore
      });
    }
  }, []);

  const handleFraudError = React.useCallback((error: any) => {
    if (error?.status === 403 && error?.data?.profile_status) {
      setFraudWarning({
        show: true,
        profileStatus: error.data.profile_status,
        fraudScore: error.data.fraud_score || 0
      });
      return true; // Indicates fraud error was handled
    }
    return false;
  }, []);

  const dismissWarning = React.useCallback(() => {
    setFraudWarning(prev => ({ ...prev, show: false }));
  }, []);

  return {
    fraudWarning,
    checkFraudHeaders,
    handleFraudError,
    dismissWarning
  };
};