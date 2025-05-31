
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { User, Share2, Shield, CheckCircle, BarChart3 } from 'lucide-react';
import BasicInfoFormWithAvatar from './BasicInfoFormWithAvatar';
import SocialMediaManager from './SocialMediaManager';
import PrivacySettings from './PrivacySettings';
import EnhancedVerificationManager from './EnhancedVerificationManager';
import ProfileAnalytics from './ProfileAnalytics';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';

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
  const watchedValues = form.watch();

  const tabItems = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'verification', label: 'Verification', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Simple menu-style navigation */}
      <div className="bg-gray-50 border rounded-lg mb-6">
        {tabItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-gray-200 last:border-b-0 ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} className={activeTab === item.id ? 'text-blue-500' : 'text-gray-500'} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <TabsContent value="basic" className="space-y-4 mt-4">
        <ProfileCompletionIndicator 
          profile={watchedValues} 
          className="mb-4"
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicInfoFormWithAvatar />

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
        <EnhancedVerificationManager
          isVerified={profile?.verified || false}
          verificationRequests={[]}
          onSubmitVerification={handleVerificationSubmit}
        />
      </TabsContent>

      <TabsContent value="analytics" className="mt-4">
        <ProfileAnalytics />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileEditTabsEnhanced;
