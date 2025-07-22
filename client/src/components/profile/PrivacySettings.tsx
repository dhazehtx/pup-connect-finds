
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';

interface PrivacySettingsProps {
  settings: {
    show_email: boolean;
    show_phone: boolean;
    show_location: boolean;
    show_bio: boolean;
    show_social_links: boolean;
    private_account: boolean;
  };
  onUpdate: (settings: any) => void;
}

const PrivacySettings = ({ settings, onUpdate }: PrivacySettingsProps) => {
  const updateSetting = (key: string, value: boolean) => {
    onUpdate({
      ...settings,
      [key]: value,
    });
  };

  const privacyOptions = [
    {
      key: 'private_account',
      label: 'Private Account',
      description: 'Only approved followers can see your posts and profile details',
      icon: Lock,
      isHighlighted: true,
    },
    {
      key: 'show_email',
      label: 'Email Address',
      description: 'Allow others to see your email address',
      icon: Eye,
    },
    {
      key: 'show_phone',
      label: 'Phone Number',
      description: 'Allow others to see your phone number',
      icon: Eye,
    },
    {
      key: 'show_location',
      label: 'Location',
      description: 'Allow others to see your location',
      icon: Eye,
    },
    {
      key: 'show_bio',
      label: 'Bio',
      description: 'Allow others to see your bio',
      icon: Eye,
    },
    {
      key: 'show_social_links',
      label: 'Social Media Links',
      description: 'Allow others to see your social media links',
      icon: Eye,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {privacyOptions.map((option) => {
          const IconComponent = option.icon;
          const isEnabled = settings[option.key as keyof typeof settings];
          
          return (
            <div 
              key={option.key} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                option.isHighlighted 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-100'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {option.key === 'private_account' ? (
                    <Lock size={16} className={isEnabled ? "text-blue-600" : "text-gray-400"} />
                  ) : (
                    <>
                      {isEnabled ? (
                        <Eye size={16} className="text-green-500" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </>
                  )}
                  <Label htmlFor={option.key} className="font-medium">
                    {option.label}
                  </Label>
                </div>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              </div>
              <Switch
                id={option.key}
                checked={isEnabled}
                onCheckedChange={(checked) => updateSetting(option.key, checked)}
              />
            </div>
          );
        })}

        {settings.private_account && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Lock size={16} />
              <span className="font-medium text-sm">Private Account Active</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              New followers will need to send a follow request that you can approve or decline. 
              Your posts and profile details will only be visible to approved followers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
