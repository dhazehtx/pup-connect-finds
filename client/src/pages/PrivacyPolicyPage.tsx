import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText, Cookie, Database, Users, Mail, Eye, Globe } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                MY PUP ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Your Rights Under GDPR & CCPA
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You have the right to access, correct, delete, and port your personal data. 
                  You can exercise these rights through your Privacy Settings or by contacting us.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Personal Information
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4 space-y-1">
                    <li>Name, email address, and contact information</li>
                    <li>Profile information and photos</li>
                    <li>Location data (with your consent)</li>
                    <li>Payment information (processed securely through Stripe)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Content & Activity
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4 space-y-1">
                    <li>Pet listings, posts, comments, and messages</li>
                    <li>Reviews, ratings, and social interactions</li>
                    <li>Search queries and browsing behavior</li>
                    <li>Device information and IP address</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Service Provision
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4">
                    <li>Account management and authentication</li>
                    <li>Facilitating pet listings and transactions</li>
                    <li>Enabling messaging and communication</li>
                    <li>Processing payments and refunds</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Improvement & Safety
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4">
                    <li>Analyzing usage to improve our platform</li>
                    <li>Fraud detection and prevention</li>
                    <li>Customer support and issue resolution</li>
                    <li>Legal compliance and safety measures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-yellow-600" />
                Cookies & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We use cookies and similar technologies to enhance your experience:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Essential Cookies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Required for basic website functionality, authentication, and security.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Analytics Cookies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Help us understand how you use our site to improve performance.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You can manage your cookie preferences through our cookie banner or privacy settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Data Sharing & Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We may share your information in the following circumstances:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Service Providers
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We work with trusted third parties like Stripe (payments), SendGrid (emails), 
                    and Supabase (database) who help us provide our services.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Legal Requirements
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We may disclose information when required by law, to protect our rights, 
                    or to ensure user safety.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    GDPR Rights (EU/UK)
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4">
                    <li>Right to access your data</li>
                    <li>Right to rectification (correction)</li>
                    <li>Right to erasure (deletion)</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    CCPA Rights (California)
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-4">
                    <li>Know what data we collect</li>
                    <li>Delete personal information</li>
                    <li>Opt-out of data sales</li>
                    <li>Non-discrimination for exercising rights</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Exercise Your Rights:</strong> Visit your Privacy Settings to export your data, 
                  delete your account, or contact us at privacy@mypup.com.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We implement industry-standard security measures to protect your information:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    Encryption
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Data encrypted in transit and at rest
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    Access Control
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Strict access controls and monitoring
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    Secure Storage
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Data stored in secure, compliant facilities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                For questions about this Privacy Policy or to exercise your rights:
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Email:</strong> privacy@mypup.com
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Response Time:</strong> We respond to privacy inquiries within 30 days
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Data Protection Officer:</strong> Available for EU/UK inquiries
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

export default PrivacyPolicyPage;