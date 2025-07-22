
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, MessageCircle, Heart, Star, Users, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  doNotDisturb: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    messages: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
    likes: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
    follows: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
    reviews: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
    listings: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
    payments: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
    security: { enabled: boolean; priority: 'low' | 'medium' | 'high' };
  };
  frequency: {
    instant: boolean;
    digest: 'never' | 'daily' | 'weekly';
    digestTime: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  doNotDisturb: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  categories: {
    messages: { enabled: true, priority: 'high' },
    likes: { enabled: true, priority: 'medium' },
    follows: { enabled: true, priority: 'medium' },
    reviews: { enabled: true, priority: 'high' },
    listings: { enabled: true, priority: 'medium' },
    payments: { enabled: true, priority: 'high' },
    security: { enabled: true, priority: 'high' }
  },
  frequency: {
    instant: true,
    digest: 'daily',
    digestTime: '09:00'
  }
};

const SmartNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const categoryIcons = {
    messages: <MessageCircle className="w-4 h-4" />,
    likes: <Heart className="w-4 h-4" />,
    follows: <Users className="w-4 h-4" />,
    reviews: <Star className="w-4 h-4" />,
    listings: <Bell className="w-4 h-4" />,
    payments: <AlertCircle className="w-4 h-4" />,
    security: <AlertCircle className="w-4 h-4 text-red-500" />
  };

  const categoryLabels = {
    messages: 'Messages',
    likes: 'Likes & Reactions',
    follows: 'New Followers',
    reviews: 'Reviews',
    listings: 'Listing Updates',
    payments: 'Payments & Transactions',
    security: 'Security Alerts'
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save preferences to backend
      console.log('Saving notification preferences:', preferences);
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = (category: keyof typeof preferences.categories, field: 'enabled' | 'priority', value: any) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          [field]: value
        }
      }
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            General Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <Switch
              id="sms-notifications"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, smsNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="do-not-disturb">Do Not Disturb</Label>
            <Switch
              id="do-not-disturb"
              checked={preferences.doNotDisturb}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, doNotDisturb: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            <Switch
              id="quiet-hours"
              checked={preferences.quietHours.enabled}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, enabled: checked }
                }))
              }
            />
          </div>
          
          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start">Start Time</Label>
                <Select
                  value={preferences.quietHours.start}
                  onValueChange={(value) => 
                    setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quiet-end">End Time</Label>
                <Select
                  value={preferences.quietHours.end}
                  onValueChange={(value) => 
                    setPreferences(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(preferences.categories).map(([category, settings]) => (
              <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                  <div>
                    <p className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</p>
                    <Badge className={getPriorityColor(settings.priority)}>
                      {settings.priority} priority
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Select
                    value={settings.priority}
                    onValueChange={(value) => updateCategory(category as keyof typeof preferences.categories, 'priority', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateCategory(category as keyof typeof preferences.categories, 'enabled', checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="instant-notifications">Instant Notifications</Label>
            <Switch
              id="instant-notifications"
              checked={preferences.frequency.instant}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({
                  ...prev,
                  frequency: { ...prev.frequency, instant: checked }
                }))
              }
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="digest-frequency">Digest Frequency</Label>
              <Select
                value={preferences.frequency.digest}
                onValueChange={(value) => 
                  setPreferences(prev => ({
                    ...prev,
                    frequency: { ...prev.frequency, digest: value as any }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {preferences.frequency.digest !== 'never' && (
              <div>
                <Label htmlFor="digest-time">Digest Time</Label>
                <Select
                  value={preferences.frequency.digestTime}
                  onValueChange={(value) => 
                    setPreferences(prev => ({
                      ...prev,
                      frequency: { ...prev.frequency, digestTime: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default SmartNotificationPreferences;
