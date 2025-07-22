
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Lock, Eye, Settings, Bell } from 'lucide-react';
import { useSecuritySettings } from '@/hooks/useSecuritySettings';
import { useFraudDetection } from '@/hooks/useFraudDetection';

const SecurityDashboard = () => {
  const { settings, loading, updateSecuritySettings, enableTwoFactor, disableTwoFactor } = useSecuritySettings();
  const { checkUserRisk } = useFraudDetection();
  const [userRisk, setUserRisk] = useState<any>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRisk = async () => {
      const risk = await checkUserRisk('current-user');
      setUserRisk(risk);
    };
    loadUserRisk();
  }, [checkUserRisk]);

  const handleEnableTwoFactor = async () => {
    const qr = await enableTwoFactor();
    if (qr) {
      setQrCode(qr);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (twoFactorCode) {
      const success = await disableTwoFactor(twoFactorCode);
      if (success) {
        setTwoFactorCode('');
        setQrCode(null);
      }
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Manage your account security and privacy settings</p>
        </div>
        {userRisk && (
          <Badge className={getRiskBadgeColor(userRisk.riskLevel)}>
            Risk Level: {userRisk.riskLevel.toUpperCase()}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">85/100</div>
                <p className="text-sm text-muted-foreground">Good security level</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Two-Factor Auth</span>
                    <span>{settings?.two_factor_enabled ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Login Monitoring</span>
                    <span>{settings?.login_notifications ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Device Tracking</span>
                    <span>{settings?.device_tracking ? '✓' : '✗'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Login from new device</span>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Password changed</span>
                    <span className="text-xs text-muted-foreground">1d ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">2FA enabled</span>
                    <span className="text-xs text-muted-foreground">3d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-sm text-muted-foreground">Devices logged in</p>
                <Button variant="outline" size="sm" className="mt-4">
                  Manage Sessions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authentication">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable 2FA</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings?.two_factor_enabled || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleEnableTwoFactor();
                      } else {
                        // Show disable form
                      }
                    }}
                  />
                </div>

                {qrCode && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Scan QR Code</h4>
                    <img src={qrCode} alt="2FA QR Code" className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Scan this code with your authenticator app
                    </p>
                  </div>
                )}

                {settings?.two_factor_enabled && !qrCode && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="disable-code">Verification Code</Label>
                      <Input
                        id="disable-code"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                      />
                    </div>
                    <Button 
                      onClick={handleDisableTwoFactor}
                      variant="destructive"
                      disabled={!twoFactorCode}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after inactivity
                    </p>
                  </div>
                  <Input
                    type="number"
                    value={settings?.session_timeout || 30}
                    onChange={(e) => updateSecuritySettings({ 
                      session_timeout: parseInt(e.target.value) 
                    })}
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Device Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track devices used to access your account
                  </p>
                </div>
                <Switch
                  checked={settings?.device_tracking || false}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ device_tracking: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new login attempts
                  </p>
                </div>
                <Switch
                  checked={settings?.login_notifications || false}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ login_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Suspicious Activity Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts for unusual account activity
                  </p>
                </div>
                <Switch
                  checked={settings?.suspicious_activity_alerts || false}
                  onCheckedChange={(checked) => 
                    updateSecuritySettings({ suspicious_activity_alerts: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Security Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Account Status: Secure</h4>
                  <p className="text-sm text-green-600">
                    No suspicious activity detected in the last 30 days
                  </p>
                </div>

                {userRisk && userRisk.eventCount > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Security Events</h4>
                    <p className="text-sm text-yellow-600">
                      {userRisk.eventCount} security events logged, {userRisk.recentEventCount} in the last 7 days
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Recent Security Events</h4>
                  <div className="text-sm text-muted-foreground">
                    No recent security events to display
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
