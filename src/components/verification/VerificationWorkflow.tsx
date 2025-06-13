
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, FileText, User, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeVerification } from '@/hooks/useRealtimeVerification';
import IdentityVerification from './IdentityVerification';
import BusinessVerification from './BusinessVerification';
import PhoneVerification from './PhoneVerification';
import VerificationStatus from './VerificationStatus';

const VerificationWorkflow = () => {
  const { user } = useAuth();
  const { verificationRequests, isLoading } = useRealtimeVerification();
  const [activeTab, setActiveTab] = useState('identity');

  const getVerificationStatus = (type: string) => {
    return verificationRequests.find(req => req.verification_type === type);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'in_review':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const verificationTypes = [
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify your identity with government-issued ID',
      icon: User,
      required: true,
      status: getVerificationStatus('identity')?.status
    },
    {
      id: 'business',
      title: 'Business Verification',
      description: 'Verify your business credentials and licenses',
      icon: FileText,
      required: false,
      status: getVerificationStatus('business')?.status
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your phone number for secure communication',
      icon: Phone,
      required: true,
      status: getVerificationStatus('phone')?.status
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p>Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-blue-600" />
            Account Verification
          </CardTitle>
          <p className="text-gray-600">
            Complete verification to build trust and unlock premium features
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verificationTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    activeTab === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(type.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    {getStatusIcon(type.status)}
                  </div>
                  <h3 className="font-medium mb-1">{type.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                  <div className="flex items-center gap-2">
                    {type.required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                    {type.status && (
                      <Badge 
                        className={`text-xs ${
                          type.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : type.status === 'pending' || type.status === 'in_review'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {type.status}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <IdentityVerification 
            currentStatus={getVerificationStatus('identity')}
          />
        </TabsContent>

        <TabsContent value="business">
          <BusinessVerification 
            currentStatus={getVerificationStatus('business')}
          />
        </TabsContent>

        <TabsContent value="phone">
          <PhoneVerification 
            currentStatus={getVerificationStatus('phone')}
          />
        </TabsContent>
      </Tabs>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No verification requests found. Start your first verification above.
              </p>
            ) : (
              verificationRequests.map((request) => (
                <VerificationStatus
                  key={request.id}
                  status={request.status as any}
                  type={request.verification_type}
                  submittedAt={request.submitted_at}
                  reviewedAt={request.reviewed_at}
                  rejectionReason={request.rejection_reason}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationWorkflow;
