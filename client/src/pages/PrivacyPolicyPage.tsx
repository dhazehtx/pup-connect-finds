import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, CreditCard, Mail, Users, FileText } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "January 30, 2025";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                MY PUP ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our pet marketplace platform.
              </p>
              <p>
                By using MY PUP, you consent to the data practices described in this statement. If you do not agree with this policy, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Personal Information</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                  <li>Name, email address, and phone number</li>
                  <li>Profile information (bio, location, avatar)</li>
                  <li>Authentication data and login credentials</li>
                  <li>Payment information for transactions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content and Communications</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                  <li>Pet listings, photos, and descriptions</li>
                  <li>Messages, comments, and social interactions</li>
                  <li>Reviews and ratings</li>
                  <li>Support tickets and feedback</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Technical Information</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                  <li>IP address, browser type, and device information</li>
                  <li>Usage data and interaction patterns</li>
                  <li>Cookies and local storage data</li>
                  <li>Location data (if permitted)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-4">
                <li>Provide and maintain our pet marketplace services</li>
                <li>Process transactions and payments securely</li>
                <li>Facilitate communication between users</li>
                <li>Personalize your experience and recommendations</li>
                <li>Send important service updates and notifications</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Improve our services through analytics and feedback</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Data Storage & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Storage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your data is securely stored using Supabase infrastructure with enterprise-grade security measures. We use encryption in transit and at rest to protect your information.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Payment Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Payment processing is handled by Stripe, a PCI DSS Level 1 certified payment processor. We do not store your complete payment card information on our servers.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Data Retention</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We retain your personal information only as long as necessary to provide our services or as required by law. You can request deletion of your account and data at any time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Supabase</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Database hosting, authentication, and real-time features
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Stripe</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Payment processing, subscriptions, and financial transactions
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Analytics Services</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Usage analytics to improve our platform (anonymized data only)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights (GDPR/CCPA) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Under GDPR (EU Users)</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                  <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Data Portability:</strong> Export your data in a structured format</li>
                  <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Under CCPA (California Users)</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                  <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
                  <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                  <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (we don't sell your data)</li>
                  <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Exercise Your Rights
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can download your data or delete your account directly from your account settings, or contact us at privacy@mypup.com for assistance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Cookie Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Targeting Cookies:</strong> Provide relevant content and recommendations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@mypup.com</p>
                <p><strong>Support:</strong> Use our in-app support system</p>
                <p><strong>Data Protection Officer:</strong> dpo@mypup.com</p>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Policy Updates:</strong> We may update this Privacy Policy periodically. We will notify you of any material changes via email or platform notification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;