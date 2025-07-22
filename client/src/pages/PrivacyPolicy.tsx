
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p className="text-gray-600">
                We collect information you provide directly to us, such as when you create an account, post a listing, or contact other users.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Information</h2>
              <p className="text-gray-600">
                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h2>
              <p className="text-gray-600">
                We do not sell, trade, or rent your personal information to third parties. We may share information in certain limited circumstances as outlined in this policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p className="text-gray-600">
                You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@mypup.com.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
