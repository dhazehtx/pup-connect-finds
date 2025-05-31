
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import ProfilePreview from './ProfilePreview';
import ProfileEditTabs from './ProfileEditTabs';

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
    console.log('Verification submitted:', verificationData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileEditTabs
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
              onClose={onClose}
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
