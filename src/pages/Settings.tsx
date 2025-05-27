
import React, { useState } from 'react';
import { User, Bell, Shield, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, Palette, Edit3 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SocialMediaConnections from '@/components/settings/SocialMediaConnections';

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bio, setBio] = useState("Passionate dog breeder specializing in Golden Retrievers and Labradors. Health tested puppies with health guarantees. Member since March 2023.");
  const [isEditingBio, setIsEditingBio] = useState(false);

  const handleBioSave = () => {
    setIsEditingBio(false);
    // Here you would typically save to backend/database
    console.log('Bio saved:', bio);
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', description: 'Update your personal details' },
        { icon: Shield, label: 'Privacy & Security', description: 'Manage your privacy settings' },
        { icon: Bell, label: 'Notifications', description: 'Configure notification preferences' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: MapPin, label: 'Location Settings', description: 'Manage location and distance preferences' },
        { icon: CreditCard, label: 'Payment Methods', description: 'Add or update payment information' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', description: 'Get help or contact support' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-deep-navy">Settings</h1>
        <p className="text-deep-navy/70 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-cloud-white rounded-xl p-6 border border-soft-sky mb-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-deep-navy">John Smith</h2>
            <p className="text-deep-navy/70">Verified Breeder</p>
            <p className="text-sm text-deep-navy/50 mt-1">Member since March 2023</p>
          </div>
          <button className="px-4 py-2 bg-mint-green text-deep-navy rounded-lg font-medium hover:bg-mint-green/80 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Bio Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-deep-navy">Profile Bio</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="flex items-center gap-2"
            >
              <Edit3 size={16} />
              {isEditingBio ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditingBio ? (
            <div className="space-y-4">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself, your experience, and what makes your breeding program special..."
                className="min-h-[120px] resize-none"
                maxLength={300}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-deep-navy/60">{bio.length}/300 characters</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditingBio(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBioSave} className="bg-mint-green text-deep-navy hover:bg-mint-green/80">
                    Save Bio
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-deep-navy/80 leading-relaxed">{bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Connections */}
      <div className="mb-6">
        <SocialMediaConnections />
      </div>

      {/* Theme Settings */}
      <div className="bg-cloud-white rounded-xl border border-soft-sky overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-soft-sky">
          <h3 className="font-semibold text-deep-navy">Appearance</h3>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-soft-sky rounded-lg flex items-center justify-center">
                <Palette size={20} className="text-royal-blue" />
              </div>
              <div>
                <h4 className="font-medium text-deep-navy">Dark Mode</h4>
                <p className="text-sm text-deep-navy/70 mt-1">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch 
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-cloud-white rounded-xl border border-soft-sky overflow-hidden">
            <div className="px-6 py-4 border-b border-soft-sky">
              <h3 className="font-semibold text-deep-navy">{group.title}</h3>
            </div>
            <div className="divide-y divide-soft-sky">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIndex}
                    className="px-6 py-4 hover:bg-soft-sky/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-soft-sky rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-royal-blue" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-deep-navy">{item.label}</h4>
                        <p className="text-sm text-deep-navy/70 mt-1">{item.description}</p>
                      </div>
                      <ChevronRight size={20} className="text-deep-navy/40" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="mt-6">
        <button className="w-full bg-cloud-white border border-red-200 text-red-600 py-3 px-4 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
