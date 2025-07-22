
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Globe, 
  Shield, 
  DollarSign, 
  Mail, 
  Bell,
  Users,
  MessageSquare,
  Database,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PlatformSettings = () => {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'MY PUP',
    platformDescription: 'The premier marketplace for connecting dog lovers',
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    maxListingsPerUser: 10
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforceStrongPasswords: true,
    enableTwoFactor: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableRateLimiting: true,
    blockSuspiciousIPs: true
  });

  const [monetizationSettings, setMonetizationSettings] = useState({
    commissionRate: 8.0,
    listingFee: 2.99,
    premiumSubscriptionFee: 19.99,
    enablePaymentPlans: true,
    minTransactionAmount: 50.0,
    maxTransactionAmount: 10000.0
  });

  const [communicationSettings, setCommunicationSettings] = useState({
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: true,
    moderateAllMessages: false,
    autoFlagSuspiciousContent: true,
    maxMessagesPerHour: 20
  });

  const [systemSettings, setSystemSettings] = useState({
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    backupFrequency: 'daily',
    logRetentionDays: 30,
    enableDebugMode: false
  });

  const handleSaveSettings = (category: string) => {
    toast({
      title: "Settings Saved",
      description: `${category} settings have been updated successfully.`,
    });
  };

  const handleGeneralSettingChange = (key: string, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleMonetizationSettingChange = (key: string, value: any) => {
    setMonetizationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCommunicationSettingChange = (key: string, value: any) => {
    setCommunicationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="monetization" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Monetization
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Platform Name</label>
                  <Input
                    value={generalSettings.platformName}
                    onChange={(e) => handleGeneralSettingChange('platformName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Max Listings Per User</label>
                  <Input
                    type="number"
                    value={generalSettings.maxListingsPerUser}
                    onChange={(e) => handleGeneralSettingChange('maxListingsPerUser', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Platform Description</label>
                <Input
                  value={generalSettings.platformDescription}
                  onChange={(e) => handleGeneralSettingChange('platformDescription', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">Temporarily disable public access</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => handleGeneralSettingChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Allow New Registrations</h4>
                    <p className="text-sm text-gray-600">Enable new user sign-ups</p>
                  </div>
                  <Switch
                    checked={generalSettings.allowNewRegistrations}
                    onCheckedChange={(checked) => handleGeneralSettingChange('allowNewRegistrations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Require Email Verification</h4>
                    <p className="text-sm text-gray-600">Users must verify email before accessing features</p>
                  </div>
                  <Switch
                    checked={generalSettings.requireEmailVerification}
                    onCheckedChange={(checked) => handleGeneralSettingChange('requireEmailVerification', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('General')}>
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session Timeout (hours)</label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Max Login Attempts</label>
                  <Input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enforce Strong Passwords</h4>
                    <p className="text-sm text-gray-600">Require complex passwords for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.enforceStrongPasswords}
                    onCheckedChange={(checked) => handleSecuritySettingChange('enforceStrongPasswords', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableTwoFactor}
                    onCheckedChange={(checked) => handleSecuritySettingChange('enableTwoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Rate Limiting</h4>
                    <p className="text-sm text-gray-600">Prevent API abuse and spam</p>
                  </div>
                  <Switch
                    checked={securitySettings.enableRateLimiting}
                    onCheckedChange={(checked) => handleSecuritySettingChange('enableRateLimiting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Block Suspicious IPs</h4>
                    <p className="text-sm text-gray-600">Automatically block known malicious IP addresses</p>
                  </div>
                  <Switch
                    checked={securitySettings.blockSuspiciousIPs}
                    onCheckedChange={(checked) => handleSecuritySettingChange('blockSuspiciousIPs', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Security')}>
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Monetization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Commission Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={monetizationSettings.commissionRate}
                    onChange={(e) => handleMonetizationSettingChange('commissionRate', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Listing Fee ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monetizationSettings.listingFee}
                    onChange={(e) => handleMonetizationSettingChange('listingFee', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Premium Subscription Fee ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monetizationSettings.premiumSubscriptionFee}
                    onChange={(e) => handleMonetizationSettingChange('premiumSubscriptionFee', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Min Transaction Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monetizationSettings.minTransactionAmount}
                    onChange={(e) => handleMonetizationSettingChange('minTransactionAmount', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max Transaction Amount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monetizationSettings.maxTransactionAmount}
                    onChange={(e) => handleMonetizationSettingChange('maxTransactionAmount', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Payment Plans</h4>
                    <p className="text-sm text-gray-600">Allow buyers to pay in installments</p>
                  </div>
                  <Switch
                    checked={monetizationSettings.enablePaymentPlans}
                    onCheckedChange={(checked) => handleMonetizationSettingChange('enablePaymentPlans', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Monetization')}>
                Save Monetization Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Communication Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Max Messages Per Hour</label>
                <Input
                  type="number"
                  value={communicationSettings.maxMessagesPerHour}
                  onChange={(e) => handleCommunicationSettingChange('maxMessagesPerHour', parseInt(e.target.value))}
                  className="mt-1 max-w-xs"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Email Notifications</h4>
                    <p className="text-sm text-gray-600">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={communicationSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleCommunicationSettingChange('enableEmailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Send critical notifications via SMS</p>
                  </div>
                  <Switch
                    checked={communicationSettings.enableSMSNotifications}
                    onCheckedChange={(checked) => handleCommunicationSettingChange('enableSMSNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Push Notifications</h4>
                    <p className="text-sm text-gray-600">Send real-time push notifications</p>
                  </div>
                  <Switch
                    checked={communicationSettings.enablePushNotifications}
                    onCheckedChange={(checked) => handleCommunicationSettingChange('enablePushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Moderate All Messages</h4>
                    <p className="text-sm text-gray-600">Require admin approval for all messages</p>
                  </div>
                  <Switch
                    checked={communicationSettings.moderateAllMessages}
                    onCheckedChange={(checked) => handleCommunicationSettingChange('moderateAllMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-flag Suspicious Content</h4>
                    <p className="text-sm text-gray-600">Use AI to detect potentially problematic messages</p>
                  </div>
                  <Switch
                    checked={communicationSettings.autoFlagSuspiciousContent}
                    onCheckedChange={(checked) => handleCommunicationSettingChange('autoFlagSuspiciousContent', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('Communication')}>
                Save Communication Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Log Retention (days)</label>
                  <Input
                    type="number"
                    value={systemSettings.logRetentionDays}
                    onChange={(e) => handleSystemSettingChange('logRetentionDays', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Backup Frequency</label>
                  <select
                    value={systemSettings.backupFrequency}
                    onChange={(e) => handleSystemSettingChange('backupFrequency', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Analytics</h4>
                    <p className="text-sm text-gray-600">Collect usage analytics and metrics</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableAnalytics}
                    onCheckedChange={(checked) => handleSystemSettingChange('enableAnalytics', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Error Reporting</h4>
                    <p className="text-sm text-gray-600">Automatically report system errors</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableErrorReporting}
                    onCheckedChange={(checked) => handleSystemSettingChange('enableErrorReporting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Performance Monitoring</h4>
                    <p className="text-sm text-gray-600">Monitor system performance and uptime</p>
                  </div>
                  <Switch
                    checked={systemSettings.enablePerformanceMonitoring}
                    onCheckedChange={(checked) => handleSystemSettingChange('enablePerformanceMonitoring', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Debug Mode</h4>
                    <p className="text-sm text-gray-600">Show detailed error messages (development only)</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableDebugMode}
                    onCheckedChange={(checked) => handleSystemSettingChange('enableDebugMode', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('System')}>
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformSettings;
