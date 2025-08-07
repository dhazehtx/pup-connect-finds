import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: August 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Personal Information:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Name, email address, and contact information</li>
            <li>Profile information and photos</li>
            <li>Payment and billing information</li>
            <li>Address and location data</li>
          </ul>

          <h4 className="font-semibold mt-4">Platform Activity:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Listings created and viewed</li>
            <li>Messages and communications</li>
            <li>Search queries and preferences</li>
            <li>Service bookings and transactions</li>
          </ul>

          <h4 className="font-semibold mt-4">Technical Information:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Cookies and tracking technologies</li>
            <li>Usage analytics and performance data</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Platform Operations:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Facilitate connections between buyers, sellers, and service providers</li>
            <li>Process payments and manage transactions</li>
            <li>Provide customer support and resolve disputes</li>
            <li>Verify user identity and prevent fraud</li>
          </ul>

          <h4 className="font-semibold mt-4">Communication:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Send booking confirmations and updates</li>
            <li>Notify about new matches and recommendations</li>
            <li>Share platform updates and announcements</li>
            <li>Respond to support inquiries</li>
          </ul>

          <h4 className="font-semibold mt-4">Improvement and Safety:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Analyze usage patterns to improve services</li>
            <li>Detect and prevent fraudulent activity</li>
            <li>Ensure platform safety and security</li>
            <li>Personalize user experience</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Information Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">With Other Users:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Profile information visible to other platform users</li>
            <li>Contact information when bookings are confirmed</li>
            <li>Public posts and reviews</li>
          </ul>

          <h4 className="font-semibold mt-4">With Service Providers:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Payment processing services (Stripe)</li>
            <li>Email communication services (SendGrid)</li>
            <li>Analytics and performance monitoring</li>
            <li>Cloud hosting and data storage</li>
          </ul>

          <h4 className="font-semibold mt-4">Legal Requirements:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>When required by law or legal process</li>
            <li>To protect our rights and safety</li>
            <li>In case of business transfer or acquisition</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure payment processing through Stripe</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and authentication</li>
            <li>Secure cloud infrastructure</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Your Rights and Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Account Management:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Update your profile and contact information</li>
            <li>Control who can contact you</li>
            <li>Manage email and notification preferences</li>
            <li>Deactivate or delete your account</li>
          </ul>

          <h4 className="font-semibold mt-4">Data Rights (GDPR):</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Request access to your personal data</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Request data portability</li>
            <li>Object to processing</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Remember your preferences and settings</li>
            <li>Analyze site usage and performance</li>
            <li>Provide personalized content</li>
            <li>Ensure platform security</li>
          </ul>
          <p className="mt-4">
            You can manage cookie preferences through your browser settings or our cookie consent banner.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We retain your information for as long as necessary to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p className="mt-4">
            Inactive accounts may be deleted after 2 years of inactivity, with 30 days notice.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>
          <p>
            If we become aware that we have collected information from a child under 13, we will delete it promptly.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may update this privacy policy from time to time. We will notify users of significant changes via email or platform notification.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you have questions about this privacy policy or your data:
          </p>
          <ul className="space-y-1">
            <li><strong>Email:</strong> privacy@mypup.com</li>
            <li><strong>Support:</strong> support@mypup.com</li>
            <li><strong>Data Protection Officer:</strong> dpo@mypup.com</li>
          </ul>
        </CardContent>
      </Card>

      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>This privacy policy explains how My Pup collects, uses, and protects your information.</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;