
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Upload, CheckCircle, Clock, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const verificationSchema = z.object({
  verificationType: z.enum(['breeder', 'shelter', 'veterinarian']),
  businessLicense: z.string().optional(),
  experienceDetails: z.string().min(50, 'Please provide at least 50 characters about your experience'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface VerificationRequest {
  id: string;
  verification_type: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

interface VerificationManagerProps {
  isVerified: boolean;
  verificationRequests: VerificationRequest[];
  onSubmitVerification: (data: VerificationFormData) => void;
}

const VerificationManager = ({ isVerified, verificationRequests, onSubmitVerification }: VerificationManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationType: 'breeder',
      businessLicense: '',
      experienceDetails: '',
    },
  });

  const onSubmit = (data: VerificationFormData) => {
    onSubmitVerification(data);
    form.reset();
    setIsOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <X size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const hasPendingRequest = verificationRequests.some(req => req.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} />
            Verification Status
          </div>
          {isVerified && (
            <Badge className="bg-green-500 text-white">
              <Award size={12} className="mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={20} />
            <span className="font-medium">Your account is verified!</span>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Get verified to build trust with potential buyers and unlock additional features.
            </p>
            
            {!hasPendingRequest && (
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Shield size={16} className="mr-2" />
                    Start Verification Process
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Account Verification</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="verificationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select verification type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="breeder">Professional Breeder</SelectItem>
                                <SelectItem value="shelter">Animal Shelter</SelectItem>
                                <SelectItem value="veterinarian">Veterinarian</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business License (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="License number or registration ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experienceDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience & Qualifications</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your experience, qualifications, and why you should be verified..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Verification Process</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• We'll review your application within 2-3 business days</li>
                          <li>• You may be contacted for additional documentation</li>
                          <li>• Verified accounts get a special badge and increased visibility</li>
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Submit Application</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {verificationRequests.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Verification History</h4>
            {verificationRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className="capitalize font-medium">{request.verification_type}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(request.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationManager;
