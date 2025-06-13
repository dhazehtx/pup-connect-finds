
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Building, AlertCircle } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';

interface BusinessVerificationFormProps {
  onClose: () => void;
}

const BusinessVerificationForm = ({ onClose }: BusinessVerificationFormProps) => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    licenseNumber: '',
    taxId: '',
    businessAddress: '',
    yearsInBusiness: '',
    specializations: '',
    experienceDetails: ''
  });
  const [documents, setDocuments] = useState<{ type: string; file: File }[]>([]);
  const { submitVerificationRequest, loading } = useVerification();

  const handleFileUpload = (type: string, file: File) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.type !== type);
      return [...filtered, { type, file }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await submitVerificationRequest('business', documents, {
      ...formData,
      experience_details: formData.experienceDetails
    });
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Business Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                placeholder="e.g., Kennel, Breeder, Pet Store"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="Business license number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder="Federal Tax ID or EIN"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                value={formData.yearsInBusiness}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
                placeholder="Number of years"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                value={formData.specializations}
                onChange={(e) => setFormData(prev => ({ ...prev, specializations: e.target.value }))}
                placeholder="e.g., Golden Retrievers, Training"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
              placeholder="Complete business address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceDetails">Experience & Qualifications</Label>
            <Textarea
              id="experienceDetails"
              value={formData.experienceDetails}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceDetails: e.target.value }))}
              placeholder="Describe your experience, certifications, and qualifications..."
              rows={4}
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Business Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Business License</p>
                  <p className="text-xs text-gray-500 mb-3">Upload business license</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('business_license', file);
                    }}
                    className="hidden"
                    id="business-license"
                  />
                  <label htmlFor="business-license">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Certifications</p>
                  <p className="text-xs text-gray-500 mb-3">Upload any certifications</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('certifications', file);
                    }}
                    className="hidden"
                    id="certifications"
                  />
                  <label htmlFor="certifications">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Business Verification Benefits</p>
                <ul className="text-green-800 mt-1 space-y-1">
                  <li>• Verified business badge on your profile</li>
                  <li>• Higher trust score and visibility</li>
                  <li>• Access to business features and analytics</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessVerificationForm;
