import React from 'react';
import { Shield, FileText, MessageCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HelpCenter() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        <p className="mt-2 text-gray-600">
          Answers, resources, and safety information for every My Pup user.
        </p>
      </section>

      {/* Trust & Safety Block */}
      <section className="rounded-2xl bg-red-50 p-6 flex items-start gap-4">
        <Shield className="w-8 h-8 text-red-500 flex-shrink-0" />
        <div>
          <h2 className="text-xl font-semibold text-red-600">Trust & Safety Center</h2>
          <p className="mt-1 text-sm text-red-700">
            Tips for safe communication and transactions on My Pup.
          </p>
          <a
            href="/safety-guide.pdf"
            className="inline-block mt-3 bg-red-500 text-white text-xs font-semibold
                       px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            Download Safety Guide
          </a>
        </div>
      </section>

      {/* Help Categories */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Getting Started</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• How to create your profile</li>
              <li>• Listing your first puppy</li>
              <li>• Understanding the marketplace</li>
              <li>• Setting up messaging</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Safety & Security</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Verifying breeders</li>
              <li>• Safe payment practices</li>
              <li>• Meeting sellers safely</li>
              <li>• Reporting suspicious activity</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Account & Billing</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Managing your account</li>
              <li>• Subscription plans</li>
              <li>• Payment methods</li>
              <li>• Refund policies</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Troubleshooting</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Login issues</li>
              <li>• App not loading</li>
              <li>• Message delivery problems</li>
              <li>• Photo upload errors</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Community Guidelines</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Code of conduct</li>
              <li>• Prohibited content</li>
              <li>• Respectful communication</li>
              <li>• Reporting violations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Contact Support</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Email: support@mypup.com</li>
              <li>• Live chat (9AM-6PM PST)</li>
              <li>• Submit a ticket</li>
              <li>• FAQ database</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Emergency Contact */}
      <section className="bg-orange-50 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-orange-700 mb-2">
          Need Immediate Help?
        </h3>
        <p className="text-sm text-orange-600 mb-4">
          For urgent safety concerns or emergency situations
        </p>
        <a
          href="mailto:emergency@mypup.com"
          className="inline-block bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-600 transition"
        >
          Contact Emergency Support
        </a>
      </section>
    </main>
  );
}