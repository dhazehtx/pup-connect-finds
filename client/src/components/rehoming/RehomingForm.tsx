
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

const RehomingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    dog_name: '',
    breed: '',
    age: '',
    reason: '',
    location: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a rehoming listing",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the rehoming terms to continue",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (!formData.dog_name || !formData.breed || !formData.age || !formData.reason) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    // Here we would implement the payment flow and listing creation
    // For now, we'll just show a success message
    setTimeout(() => {
      toast({
        title: "Rehoming listing created!",
        description: "Your listing will be reviewed and published shortly",
      });
      navigate('/profile');
      setLoading(false);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="border-blue-200 shadow-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to create a rehoming listing</p>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rehome Your Pup</h1>
          <p className="text-gray-600">Help find a loving new home for your dog</p>
        </div>

        {/* Form */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle>Rehoming Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dog Name */}
              <div className="space-y-2">
                <Label htmlFor="dog_name">Dog's Name *</Label>
                <Input
                  id="dog_name"
                  name="dog_name"
                  value={formData.dog_name}
                  onChange={handleInputChange}
                  placeholder="Enter dog's name"
                  required
                />
              </div>

              {/* Breed */}
              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="Enter breed"
                  required
                />
              </div>

              {/* Age and Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 years"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Rehoming *</Label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="moving">Moving/Relocation</option>
                    <option value="allergies">Family Allergies</option>
                    <option value="time">Lack of Time</option>
                    <option value="financial">Financial Hardship</option>
                    <option value="health">Owner Health Issues</option>
                    <option value="behavioral">Behavioral Issues</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell potential adopters about your dog's personality, health, training, and any special needs..."
                  rows={4}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Dog Photo</Label>
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {imageFile ? imageFile.name : 'Click to upload a photo'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum file size: 5MB
                    </p>
                  </label>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Rehoming Policy</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    By creating this rehoming listing, you agree that:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>You are the legal owner of this dog</li>
                    <li>The dog is in good health and up to date on vaccinations</li>
                    <li>You will conduct proper screening of potential adopters</li>
                    <li>You understand this is a one-time payment of $29.99 for listing</li>
                    <li>All information provided is accurate and truthful</li>
                  </ul>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the rehoming policy and terms above
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={loading || !agreedToTerms}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Create Rehoming Listing ($29.99)'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RehomingForm;
