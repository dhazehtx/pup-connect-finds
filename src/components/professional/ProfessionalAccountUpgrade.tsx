import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  Star, 
  Shield, 
  Briefcase,
  FileText,
  Upload,
  Plus,
  X
} from 'lucide-react';

interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface InsuranceInfo {
  provider: string;
  policy_number: string;
  coverage_amount: string;
  expiry_date: string;
}

interface BusinessReference {
  name: string;
  contact: string;
  relationship: string;
}

interface FormData {
  business_name: string;
  business_type: string;
  license_number: string;
  business_address: BusinessAddress;
  years_in_business: string;
  certifications: string[];
  insurance_info: InsuranceInfo;
  business_references: BusinessReference[];
}

const ProfessionalAccountUpgrade = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    business_type: '',
    license_number: '',
    business_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    },
    years_in_business: '',
    certifications: [],
    insurance_info: {
      provider: '',
      policy_number: '',
      coverage_amount: '',
      expiry_date: ''
    },
    business_references: []
  });
  const [newCertification, setNewCertification] = useState('');
  const [newReference, setNewReference] = useState<BusinessReference>({ name: '', contact: '', relationship: '' });

  const businessTypes = [
    { value: 'groomer', label: 'Professional Groomer' },
    { value: 'trainer', label: 'Dog Trainer' },
    { value: 'veterinarian', label: 'Veterinarian' },
    { value: 'boarder', label: 'Boarding Facility' },
    { value: 'walker', label: 'Professional Dog Walker' },
    { value: 'sitter', label: 'Pet Sitter' }
  ];

  const professionalBenefits = [
    {
      icon: CheckCircle,
      title: 'Verified Professional Badge',
      description: 'Stand out with a verified professional badge on your profile'
    },
    {
      icon: Star,
      title: 'Priority Placement',
      description: 'Your services appear higher in search results'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Background check verification and insurance coverage'
    },
    {
      icon: Briefcase,
      title: 'Professional Tools',
      description: 'Advanced booking management and customer communication'
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addReference = () => {
    if (newReference.name.trim() && newReference.contact.trim()) {
      setFormData(prev => ({
        ...prev,
        business_references: [...prev.business_references, { ...newReference }]
      }));
      setNewReference({ name: '', contact: '', relationship: '' });
    }
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      business_references: prev.business_references.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your professional account request.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('professional_account_requests')
        .insert({
          user_id: user.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          license_number: formData.license_number,
          business_address: formData.business_address,
          years_in_business: parseInt(formData.years_in_business) || 0,
          certifications: formData.certifications,
          insurance_info: formData.insurance_info,
          business_references: formData.business_references,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your professional account request has been submitted for review."
      });

      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 4) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your professional account application. Our team will review your 
              submission within 2-3 business days and contact you with the decision.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upgrade to Professional Account</h1>
        <p className="text-gray-600">Join our verified network of professional pet service providers</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Professional Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {professionalBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <benefit.icon className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Business Documentation</h4>
                  <p className="text-sm text-gray-600">Valid business license and registration</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">Professional liability insurance required</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">Professional References</h4>
                  <p className="text-sm text-gray-600">At least 2 professional references</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Your Business Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    placeholder="Professional license number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_in_business">Years in Business</Label>
                  <Input
                    id="years_in_business"
                    type="number"
                    value={formData.years_in_business}
                    onChange={(e) => handleInputChange('years_in_business', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Business Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={formData.business_address.street}
                    onChange={(e) => handleInputChange('business_address.street', e.target.value)}
                    placeholder="Street Address"
                  />
                  <Input
                    value={formData.business_address.city}
                    onChange={(e) => handleInputChange('business_address.city', e.target.value)}
                    placeholder="City"
                  />
                  <Input
                    value={formData.business_address.state}
                    onChange={(e) => handleInputChange('business_address.state', e.target.value)}
                    placeholder="State"
                  />
                  <Input
                    value={formData.business_address.zip}
                    onChange={(e) => handleInputChange('business_address.zip', e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Insurance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Professional Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {cert}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeCertification(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Insurance Information</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={formData.insurance_info.provider}
                    onChange={(e) => handleInputChange('insurance_info.provider', e.target.value)}
                    placeholder="Insurance Provider"
                  />
                  <Input
                    value={formData.insurance_info.policy_number}
                    onChange={(e) => handleInputChange('insurance_info.policy_number', e.target.value)}
                    placeholder="Policy Number"
                  />
                  <Input
                    value={formData.insurance_info.coverage_amount}
                    onChange={(e) => handleInputChange('insurance_info.coverage_amount', e.target.value)}
                    placeholder="Coverage Amount"
                  />
                  <Input
                    type="date"
                    value={formData.insurance_info.expiry_date}
                    onChange={(e) => handleInputChange('insurance_info.expiry_date', e.target.value)}
                    placeholder="Expiry Date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional References</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={newReference.name}
                  onChange={(e) => setNewReference(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Reference Name"
                />
                <Input
                  value={newReference.contact}
                  onChange={(e) => setNewReference(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Contact Info"
                />
                <div className="flex gap-2">
                  <Input
                    value={newReference.relationship}
                    onChange={(e) => setNewReference(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="Relationship"
                  />
                  <Button type="button" onClick={addReference} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {formData.business_references.map((ref, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{ref.name}</span>
                      <span className="text-sm text-gray-600 ml-2">({ref.contact})</span>
                      {ref.relationship && (
                        <span className="text-sm text-gray-500 ml-2">- {ref.relationship}</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReference(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button onClick={() => setCurrentStep(prev => prev + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfessionalAccountUpgrade;
