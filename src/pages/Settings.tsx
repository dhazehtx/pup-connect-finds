
import React, { useState } from 'react';
import { User, Bell, Shield, MapPin, CreditCard, HelpCircle, LogOut, ChevronRight, Edit3 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SocialMediaConnections from '@/components/settings/SocialMediaConnections';
import DarkModeToggle from '@/components/settings/DarkModeToggle';

const Settings = () => {
  const [bio, setBio] = useState("Passionate dog breeder specializing in Golden Retrievers and Labradors. Health tested puppies with health guarantees. Member since March 2023.");
  const [isEditingBio, setIsEditingBio] = useState(false);

  const handleBioSave = () => {
    setIsEditingBio(false);
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
    <div className="max-w-4xl mx-auto px-4 py-6 bg-background text-foreground min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl p-6 border border-border mb-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-card-foreground">John Smith</h2>
            <p className="text-muted-foreground">Verified Breeder</p>
            <p className="text-sm text-muted-foreground mt-1">Member since March 2023</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Bio Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Bio</CardTitle>
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
                <span className="text-sm text-muted-foreground">{bio.length}/300 characters</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditingBio(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBioSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Save Bio
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-card-foreground leading-relaxed">{bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Connections */}
      <div className="mb-6">
        <SocialMediaConnections />
      </div>

      {/* Dark Mode Toggle */}
      <div className="mb-6">
        <DarkModeToggle />
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-card-foreground">{group.title}</h3>
            </div>
            <div className="divide-y divide-border">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIndex}
                    className="px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">{item.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <ChevronRight size={20} className="text-muted-foreground" />
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
        <button className="w-full bg-card border border-red-200 text-red-600 py-3 px-4 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center justify-center gap-2">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
