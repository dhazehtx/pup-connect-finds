
import React from 'react';
import { FileText, Users, Shield, AlertTriangle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 2024
          </p>
        </div>

        {/* Terms Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">User Responsibilities</h3>
            <p className="text-sm text-gray-600">Your obligations when using our platform</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Platform Rules</h3>
            <p className="text-sm text-gray-600">Guidelines for safe and ethical use</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Important Notices</h3>
            <p className="text-sm text-gray-600">Key terms and limitations</p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using MY PUP ("the Platform"), you accept and agree to be bound by 
                the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our website, mobile application, 
                and related services provided by MY PUP.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts and Verification</h2>
            <div className="space-y-4 text-gray-700">
              <p>To use certain features of our platform, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Comply with our verification requirements for sellers</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prohibited Activities</h2>
            <div className="space-y-4 text-gray-700">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>List sick, injured, or mistreated animals</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious content or spam</li>
                <li>Circumvent our payment or security systems</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Animal Welfare Standards</h2>
            <div className="space-y-4 text-gray-700">
              <p>All users must adhere to the highest standards of animal welfare:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Animals must be healthy and properly cared for</li>
                <li>Breeding practices must be ethical and responsible</li>
                <li>Health records and certifications must be accurate</li>
                <li>Living conditions must meet or exceed industry standards</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment and Fees</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our payment terms include:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Transaction fees as outlined in our fee schedule</li>
                <li>Escrow services for buyer protection</li>
                <li>Refund policies for qualified transactions</li>
                <li>Premium subscription options and billing</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                MY PUP acts as a platform connecting buyers and sellers. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The quality, health, or condition of animals listed</li>
                <li>Disputes between buyers and sellers</li>
                <li>Compliance with local laws and regulations</li>
                <li>Third-party services or external websites</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>For questions about these Terms of Service, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@mypup.com</p>
                <p><strong>Mail:</strong> MY PUP Legal Department<br />123 Puppy Lane<br />Pet City, CA 90210</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
