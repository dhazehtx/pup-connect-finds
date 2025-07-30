import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Download, Trash2, FileText, Cookie } from 'lucide-react';
import DataExportButton from '@/components/privacy/DataExportButton';
import DeleteAccountButton from '@/components/privacy/DeleteAccountButton';
import { Link } from 'react-router-dom';

const PrivacySettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Privacy & Data Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your privacy preferences and exercise your data rights.
          </p>
        </div>

        <div className="space-y-6">
          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                Export Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Download a complete copy of all your personal data from MY PUP, including your profile, 
                listings, messages, and activity history in JSON format.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  What's included:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc pl-4">
                  <li>Profile information and settings</li>
                  <li>Pet listings and descriptions</li>
                  <li>Messages and conversations</li>
                  <li>Comments, posts, and social interactions</li>
                  <li>Reviews, favorites, and notifications</li>
                  <li>Account activity and metadata</li>
                </ul>
              </div>

              <div className="flex items-center gap-4">
                <DataExportButton />
                <span className="text-xs text-gray-500">
                  Limited to once every 24 hours for security
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Privacy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Learn how we collect, use, and protect your personal information.
              </p>
              
              <div className="flex gap-3">
                <Link 
                  to="/privacy" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Read Privacy Policy
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-orange-600" />
                Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Manage your cookie consent and preferences for a personalized experience.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    localStorage.removeItem('mypup-cookie-consent');
                    window.location.reload();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  <Cookie className="w-4 h-4" />
                  Manage Cookie Settings
                </button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                  Permanently Delete Account
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  Once you delete your account, there is no going back. This will permanently delete 
                  your profile, listings, messages, and all associated data.
                </p>
                
                <div className="text-xs text-red-600 dark:text-red-400 mb-4">
                  <strong>⚠️ This action cannot be undone</strong>
                </div>
                
                <DeleteAccountButton />
              </div>
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p className="mb-2">
                  <strong>Your Privacy Rights:</strong> Under GDPR and CCPA, you have the right to access, 
                  correct, delete, and port your personal data.
                </p>
                <p>
                  For questions or assistance with your privacy rights, contact us at{' '}
                  <a href="mailto:privacy@mypup.com" className="text-blue-600 hover:underline">
                    privacy@mypup.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;