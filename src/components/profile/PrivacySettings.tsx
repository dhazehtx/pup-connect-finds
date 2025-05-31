
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface PrivacySettingsProps {
  settings: {
    show_email: boolean;
    show_phone: boolean;
    show_location: boolean;
    show_bio: boolean;
    show_social_links: boolean;
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
      key: 'show_email',
      label: 'Email Address',
      description: 'Allow others to see your email address',
    },
    {
      key: 'show_phone',
      label: 'Phone Number',
      description: 'Allow others to see your phone number',
    },
    {
      key: 'show_location',
      label: 'Location',
      description: 'Allow others to see your location',
    },
    {
      key: 'show_bio',
      label: 'Bio',
      description: 'Allow others to see your bio',
    },
    {
      key: 'show_social_links',
      label: 'Social Media Links',
      description: 'Allow others to see your social media links',
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
        {privacyOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {settings[option.key as keyof typeof settings] ? (
                  <Eye size={16} className="text-green-500" />
                ) : (
                  <EyeOff size={16} className="text-gray-400" />
                )}
                <Label htmlFor={option.key} className="font-medium">
                  {option.label}
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </div>
            <Switch
              id={option.key}
              checked={settings[option.key as keyof typeof settings]}
              onCheckedChange={(checked) => updateSetting(option.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
