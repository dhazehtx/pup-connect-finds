
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { User, Share2, Shield, CheckCircle, BarChart3 } from 'lucide-react';
import BasicInfoFormWithAvatar from './BasicInfoFormWithAvatar';
import SocialMediaManager from './SocialMediaManager';
import PrivacySettings from './PrivacySettings';
import EnhancedVerificationManager from './EnhancedVerificationManager';
import ProfileAnalytics from './ProfileAnalytics';

interface ProfileEditTabsEnhancedProps {
  form: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  socialLinks: any;
  setSocialLinks: (links: any) => void;
  privacySettings: any;
  setPrivacySettings: (settings: any) => void;
  profile: any;
  isLoading: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  handleVerificationSubmit: (data: any) => void;
}

const ProfileEditTabsEnhanced = ({
  form,
  activeTab,
  setActiveTab,
  socialLinks,
  setSocialLinks,
  privacySettings,
  setPrivacySettings,
  profile,
  isLoading,
  onSubmit,
  onClose,
  handleVerificationSubmit
}: ProfileEditTabsEnhancedProps) => {
  const tabItems = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'verification', label: 'Verification', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div>
      {/* Simple text-only navigation */}
      <div className="mb-6">
        {tabItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                activeTab === item.id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={18} className={activeTab === item.id ? 'text-gray-700' : 'text-gray-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <BasicInfoFormWithAvatar />

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="w-full sm:flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:flex-1 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="mt-4">
          <SocialMediaManager
            socialLinks={socialLinks}
            onUpdate={setSocialLinks}
          />
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="mt-4">
          <PrivacySettings
            settings={privacySettings}
            onUpdate={setPrivacySettings}
          />
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="mt-4">
          <EnhancedVerificationManager
            isVerified={profile?.verified || false}
            verificationRequests={[]}
            onSubmitVerification={handleVerificationSubmit}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="mt-4">
          <ProfileAnalytics />
        </div>
      )}
    </div>
  );
};

export default ProfileEditTabsEnhanced;
