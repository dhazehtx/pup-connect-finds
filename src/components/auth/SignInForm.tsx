
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignInData {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSubmit: (data: SignInData) => Promise<void>;
  loading: boolean;
}

const SignInForm = ({ onSubmit, loading }: SignInFormProps) => {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof SignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`mt-1 h-11 ${errors.email ? 'border-destructive' : ''}`}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-destructive text-xs mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`mt-1 h-11 pr-10 ${errors.password ? 'border-destructive' : ''}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-foreground"
            disabled={loading}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-destructive text-xs mt-1">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-6"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Signing In...
          </>
        ) : (
          <>
            <Lock size={16} className="mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
};

export default SignInForm;
