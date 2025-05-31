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

  const [idUploaded, setIdUploaded] = useState(false);
  const [vetLicenseUploaded, setVetLicenseUploaded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ethicsAccepted, setEthicsAccepted] = useState(false);

  const verificationItems = [
    {
      id: 'id',
      title: 'Government ID Verification',
      description: 'Upload a valid government-issued photo ID',
      icon: <Shield className="w-5 h-5" />,
      completed: true,
      required: true
    },
    {
      id: 'vet',
      title: 'Veterinarian License',
      description: 'Upload your veterinary license or breeder certification',
      icon: <Award className="w-5 h-5" />,
      completed: false,
      required: false
    },
    {
      id: 'business',
      title: 'Business License',
      description: 'Upload your business registration (if applicable)',
      icon: <FileText className="w-5 h-5" />,
      completed: false,
      required: false
    }
  ];

  const submitVerification = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      await submitVerificationRequest({
        business_license: 'sample_license_123',
        id_document: 'sample_id_456',
        address_proof: 'sample_address_789',
        contact_verification: { phone: profile?.phone, email: user.email },
        experience_details: 'Experienced breeder with 10+ years in the field'
      });

      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted for review.",
      });
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      <Tabs defaultValue="status" className="w-full">
        <TabsList className={getMobileClasses(
          "grid w-full grid-cols-3 text-xs",
          "grid w-full grid-cols-3"
        )}>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
              
              {!isVerified && !pendingRequest && (
                <div className="mt-4">
                  <Button 
                    onClick={submitVerification} 
                    disabled={loading}
                    className={getMobileClasses("w-full", "")}
                  >
                    {loading ? 'Submitting...' : 'Submit for Verification'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {/* Verification Items */}
          <div className="grid gap-4">
            {verificationItems.map((item) => (
              <Card key={item.id} className={`border ${item.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardContent className={getMobileClasses("p-4", "p-6")}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.completed ? <CheckCircle className="w-5 h-5" /> : item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                        
                        {!item.completed && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input type="file" accept="image/*,.pdf" className="flex-1" />
                              <Button size="sm" onClick={() => {
                                if (item.id === 'id') setIdUploaded(true);
                                if (item.id === 'vet') setVetLicenseUploaded(true);
                              }}>
                                <Upload className="w-4 h-4 mr-1" />
                                Upload
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                          </div>
                        )}
                        
                        {item.completed && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Verified and approved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
