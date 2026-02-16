import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Info, Settings } from 'lucide-react';
import { FraudDetectionBanner, useFraudDetectionState } from './FraudDetectionBanner';
import { FraudWarningModal, useFraudDetection } from '@/components/ui/fraud-warning-modal';

export const FraudDetectionDemo: React.FC = () => {
  const { fraudState, simulateFraudDetection, dismissBanner, handleContactSupport } = useFraudDetectionState();
  const { fraudWarning, handleFraudError, dismissWarning } = useFraudDetection();

  const demoScenarios = [
    {
      id: 'flagged',
      title: 'Low Risk Detection',
      description: 'Simulate detection of minor suspicious activity',
      status: 'flagged' as const,
      score: 45,
      color: 'bg-blue-100 text-blue-800',
      icon: Info
    },
    {
      id: 'under_review',
      title: 'Medium Risk Detection',
      description: 'Simulate account flagged for review',
      status: 'under_review' as const,
      score: 75,
      color: 'bg-blue-100 text-blue-800',
      icon: Shield
    },
    {
      id: 'suspended',
      title: 'High Risk Detection',
      description: 'Simulate account suspension',
      status: 'suspended' as const,
      score: 95,
      color: 'bg-red-100 text-red-800',
      icon: AlertTriangle
    }
  ];

  const handleModalDemo = (status: 'under_review' | 'suspended', score: number) => {
    // Simulate a 403 error response that would trigger the modal
    handleFraudError({
      status: 403,
      data: {
        profile_status: status,
        fraud_score: score,
        error: status === 'suspended' ? 'Account Suspended' : 'Account Under Review',
        message: status === 'suspended' 
          ? 'Your account has been suspended due to suspicious activity.'
          : 'Your account is under review. Some features may be limited.'
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Fraud Detection System Demo</CardTitle>
              <CardDescription>
                Test the fraud detection UI components and user experience
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✓ Rate Limiting Active
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                ✓ Abuse Detection Active
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                ⚠ Fraud Detection (Demo Mode)
              </Badge>
            </div>
          </div>

          {/* Demo Banner */}
          {fraudState.show && !fraudState.dismissed && (
            <FraudDetectionBanner
              profileStatus={fraudState.profileStatus!}
              fraudScore={fraudState.fraudScore}
              onDismiss={dismissBanner}
              onContactSupport={handleContactSupport}
            />
          )}

          {/* Demo Controls */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Test Fraud Detection Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoScenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <Card key={scenario.id} className="border-2 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{scenario.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{scenario.description}</p>
                          <Badge className={`text-xs ${scenario.color}`}>
                            Score: {scenario.score}/100
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => simulateFraudDetection(scenario.status, scenario.score)}
                        >
                          Show Banner
                        </Button>
                        
                        {scenario.status !== 'flagged' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => handleModalDemo(scenario.status, scenario.score)}
                          >
                            Show Modal
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Fraud Detection Logic Preview */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Detection Logic (Backend Preview)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Score Triggers:</h4>
                  <ul className="text-gray-600 space-y-1 text-xs">
                    <li>• IP address mismatch: +15 points</li>
                    <li>• Rapid login attempts: +20 points</li>
                    <li>• Duplicate listings: +25 points</li>
                    <li>• Banned keywords: +15 points</li>
                    <li>• Payment fraud indicators: +40 points</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Action Thresholds:</h4>
                  <ul className="text-gray-600 space-y-1 text-xs">
                    <li>• 30-49: Low risk flagging</li>
                    <li>• 50-69: Medium risk monitoring</li>
                    <li>• 70-89: Account under review</li>
                    <li>• 90+: Account suspension</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Fraud Warning Modal */}
      <FraudWarningModal
        isOpen={fraudWarning.show}
        onClose={dismissWarning}
        profileStatus={fraudWarning.profileStatus!}
        fraudScore={fraudWarning.fraudScore}
        onContact={handleContactSupport}
      />
    </div>
  );
};