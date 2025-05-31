import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import AvatarUpload from './AvatarUpload';
import ProfilePreview from './ProfilePreview';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';
import SocialMediaManager from './SocialMediaManager';
import PrivacySettings from './PrivacySettings';
import VerificationManager from './VerificationManager';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  userType: z.enum(['buyer', 'breeder', 'shelter', 'admin']),
  yearsExperience: z.number().min(0).optional(),
  avatarUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditDialogProps {
  profile: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditDialog = ({ profile, isOpen, onClose }: ProfileEditDialogProps) => {
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      websiteUrl: profile?.websiteUrl || profile?.website_url || '',
      userType: profile?.userType || profile?.user_type || 'buyer',
      yearsExperience: profile?.yearsExperience || profile?.years_experience || 0,
      avatarUrl: profile?.avatarUrl || profile?.avatar_url || '',
    },
  });

  // Watch all form values for real-time preview
  const watchedValues = form.watch();

  // Social media and privacy state
  const [socialLinks, setSocialLinks] = useState(profile?.social_links || {});
  const [privacySettings, setPrivacySettings] = useState(
    profile?.privacy_settings || {
      show_email: false,
      show_phone: false,
      show_location: true,
      show_bio: true,
      show_social_links: true,
    }
  );

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      // Convert camelCase to snake_case for database compatibility
      const updateData = {
        full_name: data.fullName,
        username: data.username,
        bio: data.bio,
        location: data.location,
        phone: data.phone,
        website_url: data.websiteUrl,
        user_type: data.userType,
        years_experience: data.yearsExperience,
        avatar_url: data.avatarUrl,
        social_links: socialLinks,
        privacy_settings: privacySettings,
      };
      await updateProfile(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (verificationData: any) => {
    // This would be handled by a verification service
    console.log('Verification submitted:', verificationData);
    // In a real app, this would call an API to submit the verification request
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <ProfileCompletionIndicator 
                  profile={watchedValues} 
                  className="mb-4"
                />
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            <FormLabel className="text-black">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your full name" 
                                className="text-black border-gray-300" 
                                {...field} 
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
                            <FormLabel className="text-black">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                className="text-black border-gray-300" 
                                {...field} 
                              />
                            </FormControl>
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
                          <FormLabel className="text-black">User Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            />
                          </FormControl>
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
                            />
                          </FormControl>
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
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="w-full sm:flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="social" className="mt-4">
                <SocialMediaManager
                  socialLinks={socialLinks}
                  onUpdate={setSocialLinks}
                />
              </TabsContent>

              <TabsContent value="privacy" className="mt-4">
                <PrivacySettings
                  settings={privacySettings}
                  onUpdate={setPrivacySettings}
                />
              </TabsContent>

              <TabsContent value="verification" className="mt-4">
                <VerificationManager
                  isVerified={profile?.verified || false}
                  verificationRequests={[]} // This would come from API
                  onSubmitVerification={handleVerificationSubmit}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-4">
            <ProfilePreview formData={watchedValues} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
