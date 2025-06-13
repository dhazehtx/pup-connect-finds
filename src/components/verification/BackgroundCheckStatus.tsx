
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import { formatDistanceToNow } from 'date-fns';

const BackgroundCheckStatus = () => {
  const { backgroundChecks, requestBackgroundCheck, loading } = useVerification();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestCheck = (checkType: string) => {
    requestBackgroundCheck(checkType);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Background Check Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backgroundChecks.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Background Checks</h3>
              <p className="text-muted-foreground mb-6">
                Request a background check to increase your trust score
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => handleRequestCheck('criminal')} 
                  disabled={loading}
                  className="w-full"
                >
                  Request Criminal Background Check
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleRequestCheck('identity')} 
                  disabled={loading}
                  className="w-full"
                >
                  Request Identity Verification
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {backgroundChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {check.check_type.replace('_', ' ')} Check
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requested {formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
                      </p>
                      {check.expires_at && (
                        <p className="text-xs text-muted-foreground">
                          Expires {formatDistanceToNow(new Date(check.expires_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                    {check.status === 'expired' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestCheck(check.check_type)}
                        disabled={loading}
                        className="mt-2"
                      >
                        Renew
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Background Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Criminal Background Check</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive criminal history screening for buyer confidence
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>• National criminal database search</li>
                <li>• County-level criminal records</li>
                <li>• Sex offender registry check</li>
                <li>• Valid for 12 months</li>
              </ul>
              <Button 
                size="sm" 
                onClick={() => handleRequestCheck('criminal')}
                disabled={loading || backgroundChecks.some(check => 
                  check.check_type === 'criminal' && check.status === 'pending'
                )}
                className="w-full"
              >
                Request ($29.99)
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Identity Verification</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Verify identity through multiple data sources
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                <li>• Social Security number verification</li>
                <li>• Address history confirmation</li>
                <li>• Phone number validation</li>
                <li>• Valid for 24 months</li>
              </ul>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleRequestCheck('identity')}
                disabled={loading || backgroundChecks.some(check => 
                  check.check_type === 'identity' && check.status === 'pending'
                )}
                className="w-full"
              >
                Request ($19.99)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundCheckStatus;
