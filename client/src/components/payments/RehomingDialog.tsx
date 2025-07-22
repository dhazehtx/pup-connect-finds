import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Home, Shield, Users, CheckCircle, Star } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RehomingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RehomingDialog: React.FC<RehomingDialogProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    dogName: '',
    breed: '',
    age: '',
    reason: '',
    urgency: 'normal',
  });
  const { createPaymentIntent, processing } = usePayments();
  const { user } = useAuth();
  const { toast } = useToast();

  const urgencyLevels = {
    normal: { name: 'Normal', price: 19.99, description: 'Standard rehoming process' },
    urgent: { name: 'Urgent', price: 39.99, description: 'Priority listing and faster matching' },
    emergency: { name: 'Emergency', price: 59.99, description: 'Immediate priority with 24/7 support' },
  };

  const features = [
    {
      icon: <Heart className="w-5 h-5 text-red-500" />,
      title: 'Loving Homes',
      description: 'Vetted families ready to provide love and care',
    },
    {
      icon: <Shield className="w-5 h-5 text-green-500" />,
      title: 'Safe Process',
      description: 'Background checks and verification for all adopters',
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: 'Expert Support',
      description: 'Guidance throughout the rehoming journey',
    },
    {
      icon: <Home className="w-5 h-5 text-purple-500" />,
      title: 'Perfect Match',
      description: 'AI-powered matching with ideal families',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to use the rehoming service",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dogName || !formData.breed || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const currentLevel = urgencyLevels[formData.urgency as keyof typeof urgencyLevels];
    
    const result = await createPaymentIntent({
      amount: currentLevel.price,
      productType: 'rehoming_feature',
      metadata: {
        dogName: formData.dogName,
        breed: formData.breed,
        age: formData.age,
        urgencyLevel: formData.urgency,
        reason: formData.reason.substring(0, 200), // Limit metadata length
      },
    });

    if (result?.clientSecret) {
      toast({
        title: "Rehoming Service Activated",
        description: `Processing payment for ${currentLevel.name} rehoming service`,
      });
      onClose();
    }
  };

  const currentLevel = urgencyLevels[formData.urgency as keyof typeof urgencyLevels];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-red-500" />
            Rehoming Service
          </DialogTitle>
          <p className="text-gray-600">
            Find a loving new home for your dog with our professional rehoming service
          </p>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dog's Name *</label>
              <Input
                placeholder="Enter your dog's name"
                value={formData.dogName}
                onChange={(e) => handleInputChange('dogName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Breed *</label>
              <Input
                placeholder="e.g., Golden Retriever"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <Input
                placeholder="e.g., 3 years old"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Service Level</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
              >
                {Object.entries(urgencyLevels).map(([key, level]) => (
                  <option key={key} value={key}>
                    {level.name} - ${level.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason for Rehoming *</label>
            <Textarea
              placeholder="Please briefly explain why you need to rehome your dog..."
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Service Level Details */}
        <Card className="p-4 mb-6 border-2 border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-lg text-blue-900">
            {currentLevel.name} Service - ${currentLevel.price}
          </h3>
          <p className="text-blue-700 mb-3">{currentLevel.description}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                {feature.icon}
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* What's Included */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">What's Included:</h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Professional listing creation
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Applicant screening & verification
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Meet & greet coordination
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Transition support & follow-up
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Legal documentation assistance
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              30-day post-adoption check-in
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-left">
            <p className="font-semibold">{currentLevel.name} Rehoming Service</p>
            <p className="text-sm text-gray-600">One-time fee: ${currentLevel.price}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={processing}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              {processing ? 'Processing...' : `Get Started $${currentLevel.price}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RehomingDialog;