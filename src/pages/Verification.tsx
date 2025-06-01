
import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, Camera, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeVerification } from '@/hooks/useRealtimeVerification';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import SocialLogin from '@/components/auth/SocialLogin';
import EnhancedVerificationFlow from '@/components/verification/EnhancedVerificationFlow';

const Verification = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { 
    verificationRequests, 
    isLoading: verificationLoading, 
    submitVerificationRequest 
  } = useRealtimeVerification();
  const { isMobile, getMobileClasses } = useMobileOptimized();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  const pendingRequest = verificationRequests.find(req => req.status === 'pending');
  const isVerified = profile?.verified;

  return (
    <div className={getMobileClasses(
      "px-4 py-4 max-w-full",
      "max-w-4xl mx-auto px-4 py-6"
    )}>
      <div className="mb-8">
        <h1 className={getMobileClasses(
          "text-2xl font-bold text-gray-900 mb-2",
          "text-3xl font-bold text-gray-900 mb-2"
        )}>
          Account Verification
        </h1>
        <p className={getMobileClasses(
          "text-sm text-gray-600",
          "text-gray-600"
        )}>
          Complete your verification to earn trust badges and increase buyer confidence
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={getMobileClasses(
          "grid w-full grid-cols-4 text-xs",
          "grid w-full grid-cols-4"
        )}>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-5 h-5 text-blue-500" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={getMobileClasses(
                "space-y-4",
                "flex items-center justify-between"
              )}>
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isVerified ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {isVerified ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <Shield className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {isVerified ? 'Verified Account' : 'Verification Pending'}
                    </h3>
                    <p className={getMobileClasses(
                      "text-xs text-gray-600",
                      "text-sm text-gray-600"
                    )}>
                      {isVerified 
                        ? 'Your account has been verified' 
                        : pendingRequest 
                          ? 'Your verification is under review'
                          : 'Complete verification to get verified'}
                    </p>
                  </div>
                </div>
                
                {!isMobile && (
                  <Badge variant={isVerified ? "default" : pendingRequest ? "secondary" : "outline"}>
                    {isVerified ? 'Verified' : pendingRequest ? 'Under Review' : 'Not Verified'}
                  </Badge>
                )}
              </div>

              {isMobile && (
                <div className="mt-3">
                  <Badge variant={isVerified ? "default" : pendingRequest ? "secondary" : "outline"}>
                    {isVerified ? 'Verified' : pendingRequest ? 'Under Review' : 'Not Verified'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Identity Verification</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Verify your identity with government ID and selfie
                </p>
                <Button 
                  onClick={() => setActiveTab('documents')}
                  className="w-full"
                  variant={isVerified ? "outline" : "default"}
                >
                  {isVerified ? 'View Status' : 'Start Verification'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Security Settings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enable 2FA and manage connected accounts
                </p>
                <Button 
                  onClick={() => setActiveTab('security')}
                  variant="outline"
                  className="w-full"
                >
                  Manage Security
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <EnhancedVerificationFlow />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SocialLogin showTwoFactor={true} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : verificationRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">No verification requests found.</p>
              ) : (
                <div className="space-y-3">
                  {verificationRequests.map((request) => (
                    <div key={request.id} className={getMobileClasses(
                      "p-3 border rounded space-y-2",
                      "flex items-center justify-between p-3 border rounded"
                    )}>
                      <div className="flex-1">
                        <p className="font-medium capitalize text-sm">
                          {request.verification_type || 'General'} Verification
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted {new Date(request.submitted_at).toLocaleDateString()}
                        </p>
                        {request.rejection_reason && request.status === 'rejected' && (
                          <p className="text-xs text-red-600 mt-1">
                            Reason: {request.rejection_reason}
                          </p>
                        )}
                      </div>
                      {!isMobile && (
                        <Badge className={
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {request.status}
                        </Badge>
                      )}
                      {isMobile && (
                        <div className="mt-2">
                          <Badge className={
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Verification;
