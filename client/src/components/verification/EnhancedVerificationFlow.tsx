
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Camera, 
  Shield, 
  CheckCircle, 
  FileText, 
  Award,
  User,
  Home,
  Phone,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  completed: boolean;
}

const EnhancedVerificationFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const verificationSteps: VerificationStep[] = [
    {
      id: 'id_document',
      title: 'Government ID',
      description: 'Upload a valid government-issued photo ID (driver\'s license, passport, or state ID)',
      icon: <User className="h-5 w-5" />,
      required: true,
      completed: false
    },
    {
      id: 'selfie_with_id',
      title: 'Selfie with ID',
      description: 'Take a selfie holding your ID next to your face for identity verification',
      icon: <Camera className="h-5 w-5" />,
      required: true,
      completed: false
    },
    {
      id: 'address_proof',
      title: 'Address Verification',
      description: 'Upload a utility bill, bank statement, or lease agreement (dated within 90 days)',
      icon: <Home className="h-5 w-5" />,
      required: true,
      completed: false
    },
    {
      id: 'business_license',
      title: 'Business License',
      description: 'Upload your breeder license, kennel permit, or business registration (if applicable)',
      icon: <Building className="h-5 w-5" />,
      required: false,
      completed: false
    },
    {
      id: 'veterinary_records',
      title: 'Veterinary Credentials',
      description: 'Upload veterinary health certificates or professional certifications',
      icon: <Award className="h-5 w-5" />,
      required: false,
      completed: false
    }
  ];

  const uploadDocument = async (documentType: string, file: File) => {
    if (!user) return;

    try {
      setLoading(true);

      // In a real implementation, you would upload to Supabase Storage
      const mockFileUrl = `https://example.com/documents/${documentType}_${Date.now()}`;

      const { error } = await supabase
        .from('verification_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_url: mockFileUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Document Uploaded",
        description: `${documentType.replace('_', ' ')} uploaded successfully`,
      });

      // Mark step as completed
      const stepIndex = verificationSteps.findIndex(step => step.id === documentType);
      if (stepIndex !== -1) {
        verificationSteps[stepIndex].completed = true;
      }

    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitVerificationRequest = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_type: 'full_verification',
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted for review. We'll notify you within 2-3 business days.",
      });

    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = verificationSteps.filter(step => step.completed).length;
  const requiredSteps = verificationSteps.filter(step => step.required).length;
  const completedRequired = verificationSteps.filter(step => step.required && step.completed).length;
  const progress = (completedSteps / verificationSteps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Verification Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{completedSteps}/{verificationSteps.length} steps completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedRequired}</div>
              <div className="text-sm text-gray-600">Required Steps</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{completedSteps - completedRequired}</div>
              <div className="text-sm text-gray-600">Optional Steps</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {completedRequired >= requiredSteps ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600">Ready to Submit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-5">
          {verificationSteps.map((step, index) => (
            <TabsTrigger
              key={step.id}
              value={index.toString()}
              className={`text-xs ${step.completed ? 'text-green-600' : ''}`}
            >
              {step.completed ? <CheckCircle className="h-4 w-4" /> : step.icon}
            </TabsTrigger>
          ))}
        </TabsList>

        {verificationSteps.map((step, index) => (
          <TabsContent key={step.id} value={index.toString()}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {step.icon}
                    {step.title}
                    {step.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </CardTitle>
                  {step.completed && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">{step.description}</p>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="font-medium">Upload your document</p>
                      <p className="text-sm text-gray-500">
                        Accepted formats: JPG, PNG, PDF (Max 10MB)
                      </p>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFiles(prev => ({ ...prev, [step.id]: file }));
                          }
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {files[step.id] && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{files[step.id]?.name}</p>
                            <p className="text-sm text-gray-500">
                              {files[step.id] ? (files[step.id]!.size / 1024 / 1024).toFixed(2) : 0} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => files[step.id] && uploadDocument(step.id, files[step.id]!)}
                          disabled={loading}
                          size="sm"
                        >
                          {loading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step-specific requirements */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Requirements for this step:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {step.id === 'id_document' && (
                      <>
                        <li>• Document must be current and not expired</li>
                        <li>• All text must be clearly visible and readable</li>
                        <li>• Full document must be visible in the image</li>
                      </>
                    )}
                    {step.id === 'selfie_with_id' && (
                      <>
                        <li>• Hold your ID next to your face</li>
                        <li>• Both your face and ID must be clearly visible</li>
                        <li>• Use good lighting and avoid shadows</li>
                      </>
                    )}
                    {step.id === 'address_proof' && (
                      <>
                        <li>• Document must be dated within the last 90 days</li>
                        <li>• Address must match your profile information</li>
                        <li>• Your name must be visible on the document</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(Math.min(verificationSteps.length - 1, currentStep + 1))}
                    disabled={currentStep === verificationSteps.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Submit Section */}
      {completedRequired >= requiredSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Ready to Submit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">
                Great! You've completed all required verification steps. Your submission will be reviewed within 2-3 business days.
              </p>
            </div>
            
            <Button 
              onClick={submitVerificationRequest}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedVerificationFlow;
