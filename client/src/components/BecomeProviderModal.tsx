import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';

interface BecomeProviderModalProps {
  open: boolean;
  onClose: () => void;
}

interface ProviderApplication {
  service_type: string;
  bio: string;
  price: string;
  availability?: string;
  location?: string;
  whelpingRules?: {
    yearsExperience: number;
    hasBreedingLicense: true;
    hasSecureWhelpingSpace: true;
    theftPreventionPlan: string;
    welfareCommitmentAck: true;
    legalComplianceAck: true;
    backgroundCheckAck: true;
  };
}

export function BecomeProviderModal({ open, onClose }: BecomeProviderModalProps) {
  const [formData, setFormData] = useState<ProviderApplication>({
    service_type: '',
    bio: '',
    price: '',
    availability: '',
    location: '',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [whelpingForm, setWhelpingForm] = useState({
    yearsExperience: '',
    theftPreventionPlan: '',
    hasBreedingLicense: false,
    hasSecureWhelpingSpace: false,
    welfareCommitmentAck: false,
    legalComplianceAck: false,
    backgroundCheckAck: false,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const serviceTypes = [
    { value: 'grooming', label: 'Dog Grooming', icon: '✂️' },
    { value: 'walking', label: 'Dog Walking', icon: '🚶' },
    { value: 'sitting', label: 'Pet Sitting', icon: '🏠' },
    { value: 'training', label: 'Dog Training', icon: '🎓' },
    { value: 'boarding', label: 'Pet Boarding', icon: '🏨' },
    { value: 'whelping', label: 'Whelping Care', icon: '🍼' },
    { value: 'veterinary', label: 'Veterinary Care', icon: '🏥' },
  ];

  const submitApplication = useMutation({
    mutationFn: async (data: ProviderApplication) => {
      return apiRequest('/api/services/signup', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your service provider application has been submitted for review. You'll be notified once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/search'] });
      onClose();
      setCurrentStep(1);
      setFormData({
        service_type: '',
        bio: '',
        price: '',
        availability: '',
        location: '',
      });
      setWhelpingForm({
        yearsExperience: '',
        theftPreventionPlan: '',
        hasBreedingLicense: false,
        hasSecureWhelpingSpace: false,
        welfareCommitmentAck: false,
        legalComplianceAck: false,
        backgroundCheckAck: false,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.service_type || !formData.bio || !formData.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid hourly rate.",
        variant: "destructive",
      });
      return;
    }

    const isWhelping = formData.service_type === 'whelping';
    if (isWhelping) {
      const years = Number(whelpingForm.yearsExperience);
      const strictReady =
        Number.isFinite(years) &&
        years >= 2 &&
        whelpingForm.theftPreventionPlan.trim().length >= 30 &&
        whelpingForm.hasBreedingLicense &&
        whelpingForm.hasSecureWhelpingSpace &&
        whelpingForm.welfareCommitmentAck &&
        whelpingForm.legalComplianceAck &&
        whelpingForm.backgroundCheckAck;
      if (!strictReady) {
        toast({
          title: "Whelping guardrails required",
          description: "Complete all strict safety requirements to submit a whelping application.",
          variant: "destructive",
        });
        return;
      }
      submitApplication.mutate({
        ...formData,
        whelpingRules: {
          yearsExperience: years,
          theftPreventionPlan: whelpingForm.theftPreventionPlan.trim(),
          hasBreedingLicense: true,
          hasSecureWhelpingSpace: true,
          welfareCommitmentAck: true,
          legalComplianceAck: true,
          backgroundCheckAck: true,
        },
      });
      return;
    }

    submitApplication.mutate(formData);
  };

  const isStep1Valid = formData.service_type && formData.bio.length >= 10;
  const isWhelping = formData.service_type === 'whelping';
  const whelpingStep2Valid =
    Number(whelpingForm.yearsExperience) >= 2 &&
    whelpingForm.theftPreventionPlan.trim().length >= 30 &&
    whelpingForm.hasBreedingLicense &&
    whelpingForm.hasSecureWhelpingSpace &&
    whelpingForm.welfareCommitmentAck &&
    whelpingForm.legalComplianceAck &&
    whelpingForm.backgroundCheckAck;
  const isStep2Valid = formData.price && parseFloat(formData.price) > 0 && (!isWhelping || whelpingStep2Valid);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Become a Service Provider
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`h-1 w-16 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Service Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Service Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type *</Label>
                <Select 
                  value={formData.service_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          {type.icon} {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About Your Service *</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your experience, qualifications, and what makes your service special..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters ({formData.bio.length}/10)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Availability */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing & Availability</h3>
              
              <div className="space-y-2">
                <Label htmlFor="price">Hourly Rate (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25.00"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekdays 9AM-5PM, Weekends available"
                  value={formData.availability}
                  onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Service Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Downtown Seattle, WA"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              {isWhelping && (
                <div className="space-y-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-900">Strict Whelping Guardrails</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">Years of whelping experience *</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="2"
                        value={whelpingForm.yearsExperience}
                        onChange={(e) => setWhelpingForm((prev) => ({ ...prev, yearsExperience: e.target.value }))}
                        placeholder="2+"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theftPreventionPlan">Theft prevention and emergency plan *</Label>
                    <Textarea
                      id="theftPreventionPlan"
                      rows={3}
                      value={whelpingForm.theftPreventionPlan}
                      onChange={(e) =>
                        setWhelpingForm((prev) => ({ ...prev, theftPreventionPlan: e.target.value }))
                      }
                      placeholder="Describe access controls, visitor policy, ID checks, and emergency escalation."
                    />
                  </div>
                  <div className="space-y-3 text-sm">
                    {[
                      ['hasBreedingLicense', 'I hold all required breeding/whelping licenses for my jurisdiction.'],
                      ['hasSecureWhelpingSpace', 'I maintain a secure, monitored whelping environment.'],
                      ['welfareCommitmentAck', 'I commit to animal welfare standards and humane care practices.'],
                      ['legalComplianceAck', 'I agree to legal compliance and truthful disclosure.'],
                      ['backgroundCheckAck', 'I consent to strict screening and background checks.'],
                    ].map(([key, label]) => (
                      <div key={key} className="flex items-start gap-2">
                        <Checkbox
                          id={key}
                          checked={Boolean(whelpingForm[key as keyof typeof whelpingForm])}
                          onCheckedChange={(checked) =>
                            setWhelpingForm((prev) => ({ ...prev, [key]: Boolean(checked) }))
                          }
                        />
                        <Label htmlFor={key} className="leading-5">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Application</h3>
              
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-medium">Service Type:</p>
                  <p className="text-muted-foreground">
                    {serviceTypes.find(t => t.value === formData.service_type)?.icon} {' '}
                    {serviceTypes.find(t => t.value === formData.service_type)?.label}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium">About:</p>
                  <p className="text-muted-foreground">{formData.bio}</p>
                </div>
                
                <div>
                  <p className="font-medium">Hourly Rate:</p>
                  <p className="text-muted-foreground">${formData.price}/hour</p>
                </div>
                
                {formData.availability && (
                  <div>
                    <p className="font-medium">Availability:</p>
                    <p className="text-muted-foreground">{formData.availability}</p>
                  </div>
                )}
                
                {formData.location && (
                  <div>
                    <p className="font-medium">Location:</p>
                    <p className="text-muted-foreground">{formData.location}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Application Review Process</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your application will be reviewed by our team within 2-3 business days. 
                      We'll verify your information and may request additional documentation 
                      before approving your provider status.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onClose : handleBack}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitApplication.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}