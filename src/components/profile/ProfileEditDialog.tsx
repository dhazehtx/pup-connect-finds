
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProfilePreview from './ProfilePreview';
import ProfileEditTabsEnhanced from './ProfileEditTabsEnhanced';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  username: z.string().min(1, 'Username is required').max(50, 'Username is too long'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  phone: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  userType: z.enum(['buyer', 'breeder', 'shelter', 'admin']),
  yearsExperience: z.number().min(0).max(50, 'Years of experience seems too high').optional(),
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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const watchedValues = form.watch();

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
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validate required fields
      if (!data.fullName.trim()) {
        throw new Error('Full name is required');
      }
      if (!data.username.trim()) {
        throw new Error('Username is required');
      }

      const updateData = {
        full_name: data.fullName.trim(),
        username: data.username.trim(),
        bio: data.bio?.trim() || '',
        location: data.location?.trim() || '',
        phone: data.phone?.trim() || '',
        website_url: data.websiteUrl?.trim() || '',
        user_type: data.userType,
        years_experience: data.yearsExperience || 0,
        avatar_url: data.avatarUrl || '',
        social_links: socialLinks,
        privacy_settings: privacySettings,
      };

      await updateProfile(updateData);
      
      setSubmitSuccess(true);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      setSubmitError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (verificationData: any) => {
    console.log('Verification submitted:', verificationData);
    toast({
      title: "Verification Submitted",
      description: "Your verification request has been submitted for review.",
    });
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing during submission
    setSubmitError(null);
    setSubmitSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Profile</DialogTitle>
        </DialogHeader>
        
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profile updated successfully! Closing dialog...
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileEditTabsEnhanced
              form={form}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
              privacySettings={privacySettings}
              setPrivacySettings={setPrivacySettings}
              profile={profile}
              isLoading={isLoading}
              onSubmit={onSubmit}
              onClose={handleClose}
              handleVerificationSubmit={handleVerificationSubmit}
            />
          </div>

          <div className="lg:sticky lg:top-4">
            <ProfilePreview formData={watchedValues} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
