
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using MY PUP, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use License</h2>
              <p className="text-gray-600">
                Permission is granted to temporarily download one copy of MY PUP per device for personal, non-commercial transitory viewing only.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
              <p className="text-gray-600">
                Users are responsible for maintaining the accuracy of their listings and ensuring all puppy sales comply with local and federal laws.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Payment and Transactions</h2>
              <p className="text-gray-600">
                All transactions are processed through secure payment providers. MY PUP acts as a facilitator and is not responsible for individual transactions between users.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Privacy</h2>
              <p className="text-gray-600">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at legal@mypup.com.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
