
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, Clock, AlertTriangle, Upload, Camera } from 'lucide-react';
import DocumentUpload from '@/components/profile/DocumentUpload';

interface VerificationStatus {
  id: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const VerificationDashboard = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationStatus[]>([
    {
      id: '1',
      type: 'identity',
      status: 'approved',
      submittedAt: '2024-01-15',
      reviewedAt: '2024-01-16'
    },
    {
      id: '2',
      type: 'breeder_license',
      status: 'pending',
      submittedAt: '2024-01-20'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-green-600" size={16} />;
      case 'rejected': return <AlertTriangle className="text-red-600" size={16} />;
      default: return <Clock className="text-yellow-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const verificationTypes = [
    {
      id: 'identity',
      name: 'Identity Verification',
      description: 'Government-issued ID verification',
      required: ['photo_id', 'selfie'],
      completed: true
    },
    {
      id: 'breeder_license',
      name: 'Breeder License',
      description: 'Professional breeder certification',
      required: ['license_document', 'facility_photos'],
      completed: false
    },
    {
      id: 'health_certificate',
      name: 'Health Certification',
      description: 'Veterinary health standards compliance',
      required: ['vet_certificate', 'health_records'],
      completed: false
    },
    {
      id: 'business_registration',
      name: 'Business Registration',
      description: 'Legal business entity verification',
      required: ['business_license', 'tax_id'],
      completed: false
    }
  ];

  const getOverallProgress = () => {
    const completed = verificationTypes.filter(t => t.completed).length;
    return (completed / verificationTypes.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            Verification Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Completion</span>
              <span className="font-semibold">{Math.round(getOverallProgress())}%</span>
            </div>
            <Progress value={getOverallProgress()} className="h-3" />
            <p className="text-sm text-gray-600">
              Complete all verifications to unlock premium features and build trust with buyers.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Verification Status</TabsTrigger>
          <TabsTrigger value="submit">Submit Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          {verificationTypes.map((type) => {
            const request = verificationRequests.find(r => r.type === type.id);
            return (
              <Card key={type.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{type.name}</h3>
                        {request && (
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status.toUpperCase()}</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Required Documents:</p>
                        <div className="flex flex-wrap gap-1">
                          {type.required.map(doc => (
                            <Badge key={doc} variant="outline" className="text-xs">
                              {doc.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {!request ? (
                        <Button size="sm">
                          <Upload className="mr-2" size={16} />
                          Start Verification
                        </Button>
                      ) : request.status === 'rejected' ? (
                        <Button size="sm" variant="outline">
                          <Upload className="mr-2" size={16} />
                          Resubmit
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          {request.status === 'pending' ? 'Under Review' : 'Verified'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Verification Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                onUploadComplete={(files) => {
                  console.log('Documents uploaded:', files);
                }}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxFiles={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {verificationRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium">
                        {verificationTypes.find(t => t.id === request.type)?.name}
                      </span>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      {request.reviewedAt && (
                        <> • Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}</>
                      )}
                    </p>
                    {request.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">
                        Reason: {request.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerificationDashboard;
