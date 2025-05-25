
import React, { useState } from 'react';
import { Shield, Upload, CheckCircle, Camera, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const Verification = () => {
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
      completed: idUploaded,
      required: true
    },
    {
      id: 'vet',
      title: 'Veterinarian License',
      description: 'Upload your veterinary license or breeder certification',
      icon: <Award className="w-5 h-5" />,
      completed: vetLicenseUploaded,
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Breeder Verification</h1>
        <p className="text-gray-600">Complete your verification to earn trust badges and increase buyer confidence</p>
      </div>

      {/* Verification Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Basic Verification</h3>
                <p className="text-sm text-gray-600">2 of 4 steps completed</p>
              </div>
            </div>
            <Badge variant="secondary">In Progress</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Verification Items */}
      <div className="grid gap-6 mb-8">
        {verificationItems.map((item) => (
          <Card key={item.id} className={`border ${item.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-6">
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

      {/* Terms and Ethics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Terms and Ethics Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Switch checked={termsAccepted} onCheckedChange={setTermsAccepted} />
            <div className="flex-1">
              <Label className="font-medium">Terms of Service Agreement</Label>
              <p className="text-sm text-gray-600">I agree to the platform's terms of service and seller guidelines</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Switch checked={ethicsAccepted} onCheckedChange={setEthicsAccepted} />
            <div className="flex-1">
              <Label className="font-medium">Ethical Breeding Practices</Label>
              <p className="text-sm text-gray-600">I commit to following ethical breeding practices and animal welfare standards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
        <Button 
          size="lg" 
          disabled={!idUploaded || !termsAccepted || !ethicsAccepted}
          className="px-8"
        >
          Submit for Review
        </Button>
        <p className="text-sm text-gray-500 mt-2">Review typically takes 2-3 business days</p>
      </div>
    </div>
  );
};

export default Verification;
