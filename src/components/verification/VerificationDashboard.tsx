
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, Clock, XCircle, FileText, Award, AlertTriangle } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';
import { formatDistanceToNow } from 'date-fns';
import IdentityVerificationForm from './IdentityVerificationForm';
import BusinessVerificationForm from './BusinessVerificationForm';
import BackgroundCheckStatus from './BackgroundCheckStatus';

const VerificationDashboard = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const { 
    verificationRequests, 
    documents, 
    backgroundChecks, 
    loading, 
    getVerificationStatus 
  } = useVerification();

  const status = getVerificationStatus();

  const getStatusIcon = (requestStatus: string) => {
    switch (requestStatus) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'in_review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (requestStatus: string) => {
    switch (requestStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Verification & Trust Center</h1>
        <p className="text-muted-foreground">Build trust with buyers and sellers through verification</p>
      </div>

      {/* Trust Score Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Trust Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Trust Score</span>
                <span className="text-2xl font-bold">{status.overallTrustScore}%</span>
              </div>
              <Progress value={status.overallTrustScore} className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <FileText className="w-5 h-5" />
              <div>
                <p className="font-medium">Identity Verification</p>
                <Badge className={status.identityVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {status.identityVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Award className="w-5 h-5" />
              <div>
                <p className="font-medium">Business Verification</p>
                <Badge className={status.businessVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {status.businessVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-medium">Background Check</p>
                <Badge className={status.backgroundCheckPassed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {status.backgroundCheckPassed ? 'Passed' : 'Not Completed'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : verificationRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Verification Requests</h3>
                    <p className="text-muted-foreground mb-6">
                      Start building trust by verifying your identity
                    </p>
                    <Button onClick={() => setActiveForm('identity')}>
                      Start Identity Verification
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verificationRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <p className="font-medium capitalize">
                              {request.verification_type.replace('_', ' ')} Verification
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {formatDistanceToNow(new Date(request.submitted_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="identity">
          <IdentityVerificationForm onClose={() => setActiveForm(null)} />
        </TabsContent>

        <TabsContent value="business">
          <BusinessVerificationForm onClose={() => setActiveForm(null)} />
        </TabsContent>

        <TabsContent value="background">
          <BackgroundCheckStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerificationDashboard;
