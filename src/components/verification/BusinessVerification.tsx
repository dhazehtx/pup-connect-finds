
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationSystem } from '@/hooks/useVerificationSystem';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from '../profile/DocumentUpload';

interface BusinessVerificationProps {
  currentStatus?: any;
}

const BusinessVerification = ({ currentStatus }: BusinessVerificationProps) => {
  const { user } = useAuth();
  const { submitVerificationRequest, loading } = useVerificationSystem();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    businessType: '',
    businessName: '',
    licenseNumber: '',
    yearsInBusiness: '',
    businessDescription: ''
  });
  const [documents, setDocuments] = useState({
    business_license: '',
    address_proof: ''
  });

  const handleDocumentUpload = (url: string, type: string) => {
    setDocuments(prev => ({ ...prev, [type]: url }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.businessType || !formData.businessName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitVerificationRequest('business', {
        businessLicense: documents.business_license,
        experienceDetails: `Business Type: ${formData.businessType}
Business Name: ${formData.businessName}
License Number: ${formData.licenseNumber}
Years in Business: ${formData.yearsInBusiness}
Description: ${formData.businessDescription}`
      });
    } catch (error) {
      console.error('Error submitting business verification:', error);
    }
  };

  if (currentStatus?.status === 'approved') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Business Verified!
            </h3>
            <p className="text-gray-600">
              Your business has been successfully verified on {new Date(currentStatus.reviewed_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus?.status === 'pending' || currentStatus?.status === 'in_review') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">
              Under Review
            </h3>
            <p className="text-gray-600">
              Your business verification is being reviewed. We'll notify you once complete.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Submitted on {new Date(currentStatus.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="text-blue-600" />
          Business Verification
        </CardTitle>
        <p className="text-gray-600">
          Verify your business credentials to build trust with customers
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value) => handleInputChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breeder">Dog Breeder</SelectItem>
                  <SelectItem value="kennel">Kennel</SelectItem>
                  <SelectItem value="rescue">Rescue Organization</SelectItem>
                  <SelectItem value="shelter">Animal Shelter</SelectItem>
                  <SelectItem value="trainer">Dog Trainer</SelectItem>
                  <SelectItem value="groomer">Pet Groomer</SelectItem>
                  <SelectItem value="veterinary">Veterinary Clinic</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Business license or registration number"
              />
            </div>

            <div>
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                value={formData.yearsInBusiness}
                onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                placeholder="How many years have you been in business?"
              />
            </div>

            <div>
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business, specializations, and experience..."
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Supporting Documents</h4>
            
            <DocumentUpload
              onDocumentUploaded={handleDocumentUpload}
              documentType="business_license"
              title="Business License"
              description="Official business license or registration certificate"
              currentDocument={documents.business_license}
            />

            <DocumentUpload
              onDocumentUploaded={handleDocumentUpload}
              documentType="address_proof"
              title="Address Proof (Optional)"
              description="Business address verification document"
              currentDocument={documents.address_proof}
            />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Business Verification Benefits</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Verified business badge on your profile</li>
            <li>• Higher search ranking and visibility</li>
            <li>• Access to premium business tools</li>
            <li>• Increased customer trust and inquiries</li>
            <li>• Priority customer support</li>
          </ul>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.businessType || !formData.businessName}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Submit Business Verification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BusinessVerification;
