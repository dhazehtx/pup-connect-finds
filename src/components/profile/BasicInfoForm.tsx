
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import AvatarUpload from './AvatarUpload';

const BasicInfoForm = () => {
  const form = useFormContext();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateUsername = async (username: string) => {
    if (!username) return;
    
    // Basic validation - can be enhanced with actual API call
    if (username.length < 3) {
      setFieldErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters' }));
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setFieldErrors(prev => ({ ...prev, username: 'Username can only contain letters, numbers, and underscores' }));
      return;
    }
  };

  const validateWebsiteUrl = (url: string) => {
    if (!url) return;
    
    try {
      new URL(url);
    } catch {
      setFieldErrors(prev => ({ ...prev, websiteUrl: 'Please enter a valid URL (e.g., https://example.com)' }));
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="avatarUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">Profile Picture</FormLabel>
            <FormControl>
              <AvatarUpload
                currentAvatar={field.value}
                onAvatarChange={field.onChange}
                userName={form.watch('fullName')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Full Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your full name" 
                  className="text-black border-gray-300" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('fullName', e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Username *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your username" 
                  className="text-black border-gray-300" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('username', e.target.value);
                    validateUsername(e.target.value);
                  }}
                />
              </FormControl>
              {fieldErrors.username && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle size={12} />
                  {fieldErrors.username}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="userType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">User Type *</FormLabel>
            <Select onValueChange={(value) => {
              field.onChange(value);
              handleFieldChange('userType', value);
            }} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="text-black border-gray-300">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="breeder">Breeder</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">Bio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us about yourself..." 
                className="resize-none text-black border-gray-300" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  handleFieldChange('bio', e.target.value);
                }}
              />
            </FormControl>
            <div className="text-xs text-gray-500 mt-1">
              {field.value?.length || 0}/500 characters
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="City, State" 
                  className="text-black border-gray-300" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('location', e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(555) 123-4567" 
                  className="text-black border-gray-300" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleFieldChange('phone', e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="websiteUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-black">Website</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://yourwebsite.com" 
                className="text-black border-gray-300" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  handleFieldChange('websiteUrl', e.target.value);
                  validateWebsiteUrl(e.target.value);
                }}
              />
            </FormControl>
            {fieldErrors.websiteUrl && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} />
                {fieldErrors.websiteUrl}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('userType') === 'breeder' && (
        <FormField
          control={form.control}
          name="yearsExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Years of Experience</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="text-black border-gray-300"
                  {...field} 
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    field.onChange(value);
                    handleFieldChange('yearsExperience', value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {Object.keys(fieldErrors).length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the errors above before proceeding.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BasicInfoForm;
