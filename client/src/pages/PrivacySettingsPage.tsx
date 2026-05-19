import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Download, 
  Trash2, 
  Cookie, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteAccountWithPassword } from '@/lib/deleteAccount';
import { supabase } from '@/integrations/supabase/client';

const PrivacySettingsPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const { toast } = useToast();

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-user-data', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mypup-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Data Export Complete",
          description: "Your data has been downloaded successfully.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Export failed');
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Unable to export your data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({
        title: 'Password required',
        description: 'Enter your password to permanently delete your account.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccountWithPassword(deletePassword);
      await supabase.auth.signOut();
      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to delete your account.';
      toast({
        title: 'Deletion Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const clearCookiePreferences = () => {
    localStorage.removeItem('mypup-cookie-consent');
    toast({
      title: "Cookie Preferences Cleared",
      description: "You'll see the cookie consent banner again on your next page load.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Privacy Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your privacy preferences and data rights
          </p>
        </div>

        <div className="space-y-6">
          {/* GDPR Rights Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Under GDPR and CCPA, you have the following rights regarding your personal data:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    Right to Access
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Request a copy of all personal data we hold about you
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="text-blue-700 border-blue-200">
                    Right to Rectification
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Correct any inaccurate or incomplete personal data
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="text-red-700 border-red-200">
                    Right to Erasure
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Request deletion of your personal data and account
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge variant="outline" className="text-purple-700 border-purple-200">
                    Right to Portability
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Export your data in a machine-readable format
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Export Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                      Download Your Data
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      Get a complete copy of your personal data including profile information, 
                      listings, messages, comments, and activity history.
                    </p>
                    <Button 
                      onClick={handleDataExport}
                      disabled={isExporting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Preparing Export...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export My Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>• Data exports are available once every 24 hours</p>
                <p>• Your export will include all data from the last 3 years</p>
                <p>• File will be downloaded in JSON format</p>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-blue-600" />
                Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Manage your cookie consent preferences and tracking settings.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={clearCookiePreferences}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Reset Cookie Preferences
                </Button>
                
                <Link to="/privacy">
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View Privacy Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <strong>Warning:</strong> This action cannot be undone. All your data, 
                  including listings, messages, and account information will be permanently deleted.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Deleting your account will permanently remove:
                </p>
                
                <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                  <li>Your profile and personal information</li>
                  <li>All pet listings and photos</li>
                  <li>Message history and conversations</li>
                  <li>Reviews, ratings, and social interactions</li>
                  <li>Saved posts and bookmarks</li>
                  <li>Transaction and payment history</li>
                </ul>

                {!showDeleteConfirm ? (
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Are you absolutely sure?
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This will permanently delete your account and all associated data. 
                      This action cannot be undone.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="privacy-delete-password">Password</Label>
                      <Input
                        id="privacy-delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Your account password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Deleting...
                          </>
                        ) : (
                          'Yes, Delete Permanently'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                For questions about your privacy rights or data handling:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Privacy Officer:</strong> privacy@mypup.com
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Response Time:</strong> Within 30 days
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Data Protection Officer:</strong> Available for EU/UK residents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;