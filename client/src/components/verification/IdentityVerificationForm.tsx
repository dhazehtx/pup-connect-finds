
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useVerification } from '@/hooks/useVerification';

interface IdentityVerificationFormProps {
  onClose: () => void;
}

const IdentityVerificationForm = ({ onClose }: IdentityVerificationFormProps) => {
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: ''
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
    
    if (documents.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    await submitVerificationRequest('identity', documents, formData);
    onClose();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Identity Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={formData.documentType} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, documentType: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="state_id">State ID</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                value={formData.documentNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                placeholder="Enter document number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Full name as on document"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Current Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Full current address"
              required
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">ID Document (Front)</p>
                  <p className="text-xs text-gray-500 mb-3">Upload front of your ID</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('id_front', file);
                    }}
                    className="hidden"
                    id="id-front"
                  />
                  <label htmlFor="id-front">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">ID Document (Back)</p>
                  <p className="text-xs text-gray-500 mb-3">Upload back of your ID</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('id_back', file);
                    }}
                    className="hidden"
                    id="id-back"
                  />
                  <label htmlFor="id-back">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>{doc.file.name} ({doc.type})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Important Information</p>
                <ul className="text-blue-800 mt-1 space-y-1">
                  <li>• Ensure documents are clear and legible</li>
                  <li>• All four corners of the document must be visible</li>
                  <li>• Review typically takes 1-3 business days</li>
                  <li>• Your information is encrypted and secure</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || documents.length === 0} className="flex-1">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IdentityVerificationForm;
