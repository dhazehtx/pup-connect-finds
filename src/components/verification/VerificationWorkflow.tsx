import React, { useState } from 'react';
import { useRealtimeVerification } from '@/hooks/useRealtimeVerification';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DocumentUpload from '@/components/profile/DocumentUpload';
import VerificationStatus from './VerificationStatus';
import { Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VerificationWorkflow = () => {
  const { verificationRequests, isLoading, submitVerificationRequest } = useRealtimeVerification();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    verificationType: '',
    businessLicense: '',
    idDocument: '',
    addressProof: '',
    experienceDetails: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleDocumentUpload = (url: string, type: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: url
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.verificationType) {
      toast({
        title: "Error",
        description: "Please select a verification type",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      await submitVerificationRequest({
        verification_type: formData.verificationType,
        business_license: formData.businessLicense,
        id_document: formData.idDocument,
        address_proof: formData.addressProof,
        experience_details: formData.experienceDetails
      });

      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted for review.",
      });

      // Reset form
      setFormData({
        verificationType: '',
        businessLicense: '',
        idDocument: '',
        addressProof: '',
        experienceDetails: ''
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Verification</h1>
        <p className="text-gray-600">
          Get verified to build trust and access premium features
        </p>
      </div>

      {/* Existing Verification Requests */}
      {verificationRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Verification Requests</h2>
          {verificationRequests.map((request) => (
            <VerificationStatus
              key={request.id}
              status={request.status}
              type={request.verification_type}
              submittedAt={request.submitted_at}
              reviewedAt={request.reviewed_at}
              rejectionReason={request.rejection_reason}
            />
          ))}
        </div>
      )}

      {/* New Verification Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Verification Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="verificationType">Verification Type</Label>
              <Select 
                value={formData.verificationType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, verificationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select verification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breeder">Professional Breeder</SelectItem>
                  <SelectItem value="shelter">Animal Shelter</SelectItem>
                  <SelectItem value="rescue">Rescue Organization</SelectItem>
                  <SelectItem value="individual">Individual Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocumentUpload
                onDocumentUploaded={handleDocumentUpload}
                documentType="business_license"
                title="Business License"
                description="Upload your business license or registration"
                currentDocument={formData.businessLicense}
              />

              <DocumentUpload
                onDocumentUploaded={handleDocumentUpload}
                documentType="id_document"
                title="ID Document"
                description="Upload a government-issued ID"
                currentDocument={formData.idDocument}
              />

              <DocumentUpload
                onDocumentUploaded={handleDocumentUpload}
                documentType="address_proof"
                title="Address Proof"
                description="Upload utility bill or bank statement"
                currentDocument={formData.addressProof}
              />
            </div>

            <div>
              <Label htmlFor="experienceDetails">Experience Details</Label>
              <Textarea
                id="experienceDetails"
                value={formData.experienceDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceDetails: e.target.value }))}
                placeholder="Describe your experience with animals, breeding, or rescue work..."
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting || !formData.verificationType}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Verification Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationWorkflow;
