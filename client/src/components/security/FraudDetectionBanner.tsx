import React from 'react';
import { AlertTriangle, Shield, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FraudDetectionBannerProps {
  profileStatus: 'under_review' | 'suspended' | 'flagged';
  fraudScore: number;
  onDismiss?: () => void;
  onContactSupport?: () => void;
}

export const FraudDetectionBanner: React.FC<FraudDetectionBannerProps> = ({
  profileStatus,
  fraudScore,
  onDismiss,
  onContactSupport
}) => {
  const getStatusConfig = () => {
    switch (profileStatus) {
      case 'suspended':
        return {
          title: 'Account Suspended',
          message: 'Your account has been suspended due to suspicious activity. Contact support to resolve this issue.',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          canDismiss: false
        };
      case 'under_review':
        return {
          title: 'Account Under Review',
          message: 'Your account is being reviewed for security purposes. Some features may be limited.',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Shield,
          canDismiss: true
        };
      case 'flagged':
        return {
          title: 'Security Notice',
          message: 'Unusual activity detected on your account. Please review your recent actions.',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: Shield,
          canDismiss: true
        };
      default:
        return {
          title: 'Security Alert',
          message: 'Please contact support for more information.',
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          icon: Shield,
          canDismiss: true
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const getRiskBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 50) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <Card className={`mb-4 ${config.bgColor} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <StatusIcon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium ${config.textColor}`}>
                  {config.title}
                </h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRiskBadgeColor(fraudScore)}`}
                >
                  Risk: {fraudScore}/100
                </Badge>
              </div>
              <p className={`text-sm ${config.textColor} mb-3`}>
                {config.message}
              </p>
              
              {onContactSupport && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onContactSupport}
                  className={`text-xs ${config.textColor} border-current hover:bg-white hover:bg-opacity-50`}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Contact Support
                </Button>
              )}
            </div>
          </div>
          
          {config.canDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={`${config.textColor} hover:bg-white hover:bg-opacity-50 h-6 w-6 p-0`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for managing fraud detection state
export const useFraudDetectionState = () => {
  const [fraudState, setFraudState] = React.useState<{
    show: boolean;
    profileStatus: 'under_review' | 'suspended' | 'flagged' | null;
    fraudScore: number;
    dismissed: boolean;
  }>({
    show: false,
    profileStatus: null,
    fraudScore: 0,
    dismissed: false
  });

  // Simulate fraud detection for demo purposes
  const simulateFraudDetection = React.useCallback((
    status: 'under_review' | 'suspended' | 'flagged',
    score: number
  ) => {
    setFraudState({
      show: true,
      profileStatus: status,
      fraudScore: score,
      dismissed: false
    });
  }, []);

  const dismissBanner = React.useCallback(() => {
    setFraudState(prev => ({ ...prev, show: false, dismissed: true }));
  }, []);

  const handleContactSupport = React.useCallback(() => {
    // This would typically open a support chat or redirect to a support page
    window.open('mailto:support@mypup.com?subject=Account Security Issue', '_blank');
  }, []);

  return {
    fraudState,
    simulateFraudDetection,
    dismissBanner,
    handleContactSupport
  };
};