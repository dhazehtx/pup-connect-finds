
import React from 'react';
import Layout from '@/components/Layout';
import { Shield, Users, AlertTriangle, CheckCircle, Eye, Lock } from 'lucide-react';

const TrustSafety = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Trust & Safety</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your safety and security are our top priorities. Learn about our comprehensive measures to ensure a trusted community.
            </p>
          </div>

          {/* Safety Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Users className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Breeders</h3>
              <p className="text-gray-600">All breeders undergo identity verification and background checks before joining our platform.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <CheckCircle className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Guarantees</h3>
              <p className="text-gray-600">All puppies come with health certificates and genetic testing from licensed veterinarians.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Lock className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Protected payment processing with escrow services and fraud prevention.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Eye className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Facility Inspections</h3>
              <p className="text-gray-600">Regular inspections of breeding facilities to ensure proper care and conditions.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <AlertTriangle className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report System</h3>
              <p className="text-gray-600">Easy reporting system for suspicious activity with 24/7 monitoring and response.</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <Shield className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Standards</h3>
              <p className="text-gray-600">Clear community guidelines and policies to maintain a safe environment for all users.</p>
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Guidelines for Buyers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✅ Do:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Verify breeder credentials and certifications</li>
                  <li>• Visit the breeding facility in person</li>
                  <li>• Ask for health records and genetic testing</li>
                  <li>• Use our secure payment system</li>
                  <li>• Report any suspicious activity</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">❌ Don't:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Wire money or send cash payments</li>
                  <li>• Buy from unverified sellers</li>
                  <li>• Skip health screenings</li>
                  <li>• Rush into purchasing decisions</li>
                  <li>• Ignore red flags or warnings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center bg-white p-8 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help or Want to Report an Issue?</h2>
            <p className="text-gray-600 mb-6">Our trust and safety team is available 24/7 to assist you.</p>
            <div className="space-y-2">
              <p className="text-gray-900"><strong>Email:</strong> safety@mypup.com</p>
              <p className="text-gray-900"><strong>Phone:</strong> 1-800-MYPUP-SAFE</p>
              <p className="text-gray-900"><strong>Emergency Line:</strong> Available 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrustSafety;
