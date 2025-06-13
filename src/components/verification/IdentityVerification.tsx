
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, User, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationSystem } from '@/hooks/useVerificationSystem';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from '../profile/DocumentUpload';

interface IdentityVerificationProps {
  currentStatus?: any;
}

const IdentityVerification = ({ currentStatus }: IdentityVerificationProps) => {
  const { user } = useAuth();
  const { submitVerificationRequest, loading } = useVerificationSystem();
  const { toast } = useToast();
  const [documents, setDocuments] = useState({
    id_front: '',
    id_back: '',
    address_proof: ''
  });
  const [idType, setIdType] = useState('');

  const handleDocumentUpload = (url: string, type: string) => {
    setDocuments(prev => ({ ...prev, [type]: url }));
  };

  const handleSubmit = async () => {
    if (!documents.id_front) {
      toast({
        title: "Missing Document",
        description: "Please upload your ID document",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitVerificationRequest('identity', {
        idDocument: documents.id_front,
        addressProof: documents.address_proof,
        experienceDetails: `ID Type: ${idType}`
      });
    } catch (error) {
      console.error('Error submitting identity verification:', error);
    }
  };

  if (currentStatus?.status === 'approved') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Identity Verified!
            </h3>
            <p className="text-gray-600">
              Your identity has been successfully verified on {new Date(currentStatus.reviewed_at).toLocaleDateString()}
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
              Your identity verification is being reviewed. We'll notify you once complete.
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
          <User className="text-blue-600" />
          Identity Verification
        </CardTitle>
        <p className="text-gray-600">
          Verify your identity to build trust and unlock premium features
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="idType">ID Document Type</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="national_id">National ID Card</SelectItem>
                  <SelectItem value="state_id">State ID Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Required Documents</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clear, high-resolution photo of your ID</li>
                <li>• All text must be clearly readable</li>
                <li>• No glare or shadows on the document</li>
                <li>• Document must be current and not expired</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <DocumentUpload
              onDocumentUploaded={handleDocumentUpload}
              documentType="id_front"
              title="ID Document"
              description="Upload a clear photo of your government-issued ID"
              currentDocument={documents.id_front}
            />

            <DocumentUpload
              onDocumentUploaded={handleDocumentUpload}
              documentType="address_proof"
              title="Address Proof (Optional)"
              description="Utility bill, bank statement, or lease agreement"
              currentDocument={documents.address_proof}
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your documents will be reviewed within 24-48 hours</li>
            <li>• We use secure, encrypted processing for all documents</li>
            <li>• You'll receive a notification once verification is complete</li>
            <li>• Verified accounts get a trust badge and enhanced visibility</li>
          </ul>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading || !documents.id_front || !idType}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Submit for Verification'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;
