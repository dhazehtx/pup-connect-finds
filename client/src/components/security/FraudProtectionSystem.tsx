
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useFraudDetection } from '@/hooks/useFraudDetection';

interface FraudProtectionSystemProps {
  transactionId?: string;
  onRiskDetected?: (riskScore: number) => void;
}

const FraudProtectionSystem = ({ transactionId, onRiskDetected }: FraudProtectionSystemProps) => {
  const { analyzeTransaction, reportSuspiciousActivity, riskScore, loading } = useFraudDetection();
  const [fraudAnalysis, setFraudAnalysis] = useState<any>(null);
  const [userBehavior, setUserBehavior] = useState({
    rapidClicks: 0,
    multiplePaymentAttempts: 0,
    unusualHours: false
  });

  useEffect(() => {
    if (transactionId) {
      performFraudAnalysis();
    }
  }, [transactionId]);

  useEffect(() => {
    if (riskScore && onRiskDetected) {
      onRiskDetected(riskScore);
    }
  }, [riskScore, onRiskDetected]);

  const performFraudAnalysis = async () => {
    if (!transactionId) return;

    const result = await analyzeTransaction(transactionId, userBehavior, {
      ipLocation: 'US',
      userLocation: 'US',
      locationMismatch: false
    });

    if (result) {
      setFraudAnalysis(result);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.3) return 'text-blue-600';
    return 'text-green-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return 'High Risk';
    if (score >= 0.6) return 'Medium Risk';
    if (score >= 0.3) return 'Low Risk';
    return 'Minimal Risk';
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'monitor': return <Eye className="w-5 h-5 text-blue-600" />;
      case 'manual_review': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'block_transaction': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Fraud Protection System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Analyzing transaction security...</span>
            </div>
          )}

          {riskScore !== null && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Risk Score</span>
                  <span className={`font-bold ${getRiskColor(riskScore)}`}>
                    {(riskScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={riskScore * 100} 
                  className={`h-3 ${
                    riskScore >= 0.8 ? '[&>div]:bg-red-500' :
                    riskScore >= 0.6 ? '[&>div]:bg-yellow-500' :
                    riskScore >= 0.3 ? '[&>div]:bg-blue-500' : '[&>div]:bg-green-500'
                  }`}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {getRiskLevel(riskScore)}
                </p>
              </div>

              {fraudAnalysis && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Risk Factors</h4>
                    <div className="flex flex-wrap gap-2">
                      {fraudAnalysis.risk_factors.map((factor: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {factor.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendation</h4>
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(fraudAnalysis.recommendation)}
                      <span className="capitalize">
                        {fraudAnalysis.recommendation.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Automated Actions</h4>
                    <div className="space-y-1">
                      {fraudAnalysis.auto_actions.map((action: string, index: number) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {action.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {riskScore !== null && riskScore >= 0.6 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This transaction has been flagged for manual review due to elevated risk factors.
                Our security team will review it within 24 hours.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={performFraudAnalysis}
              disabled={loading || !transactionId}
              variant="outline"
            >
              Re-analyze
            </Button>
            <Button
              onClick={() => reportSuspiciousActivity('manual_report', { 
                transaction_id: transactionId,
                reported_by: 'user'
              })}
              variant="outline"
            >
              Report Suspicious Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <p className="text-sm text-muted-foreground">Legitimate Transactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">0.2%</div>
              <p className="text-sm text-muted-foreground">Flagged for Review</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">0.001%</div>
              <p className="text-sm text-muted-foreground">Blocked Transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudProtectionSystem;
