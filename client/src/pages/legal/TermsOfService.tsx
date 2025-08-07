import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: August 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            By accessing and using My Pup ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          <p>
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Platform Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            My Pup provides a marketplace platform that connects:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Dog buyers with verified breeders and sellers</li>
            <li>Pet owners with professional service providers</li>
            <li>Community members through social features</li>
            <li>Customers with pet product retailers</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. User Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">For Buyers:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Verify seller credentials and pet health documentation</li>
            <li>Meet pets in person before finalizing purchases</li>
            <li>Report suspicious or fraudulent activity</li>
            <li>Complete transactions through the platform for protection</li>
          </ul>

          <h4 className="font-semibold mt-4">For Sellers/Breeders:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide accurate and truthful information about pets</li>
            <li>Maintain current health certifications and documentation</li>
            <li>Follow ethical breeding and sales practices</li>
            <li>Respond promptly to buyer inquiries</li>
          </ul>

          <h4 className="font-semibold mt-4">For Service Providers:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Maintain current insurance and certifications</li>
            <li>Provide services as described and scheduled</li>
            <li>Follow platform safety guidelines</li>
            <li>Treat all pets with care and respect</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Platform Fees and Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Commission Structure:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Pet services: 10% platform commission on completed bookings</li>
            <li>Product sales: Standard marketplace fees apply</li>
            <li>Premium listings: Optional boost fees for enhanced visibility</li>
          </ul>

          <h4 className="font-semibold mt-4">Payment Processing:</h4>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>All payments processed securely through Stripe</li>
            <li>Funds held in escrow until service completion</li>
            <li>Refunds processed according to our refund policy</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Prohibited Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Users are prohibited from:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Posting false or misleading information</li>
            <li>Engaging in fraudulent transactions</li>
            <li>Harassing other users</li>
            <li>Selling sick or unhealthy animals</li>
            <li>Operating puppy mills or unethical breeding facilities</li>
            <li>Circumventing platform payment systems</li>
            <li>Spamming or sending unsolicited messages</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Account Suspension and Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in prohibited activities, or pose a risk to platform safety.
          </p>
          <p>
            Users may appeal suspensions by contacting our support team with relevant documentation.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            My Pup serves as a platform connecting users and is not responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The quality, health, or condition of pets sold through the platform</li>
            <li>The quality of services provided by third-party service providers</li>
            <li>Disputes between users</li>
            <li>Acts of fraud or misrepresentation by users</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Privacy and Data Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
          </p>
          <p>
            We comply with applicable data protection regulations including GDPR where applicable.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may update these terms from time to time. Users will be notified of significant changes via email or platform notification.
          </p>
          <p>
            Continued use of the platform after changes constitutes acceptance of updated terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you have questions about these terms, please contact us:
          </p>
          <ul className="space-y-1">
            <li><strong>Email:</strong> legal@mypup.com</li>
            <li><strong>Support:</strong> support@mypup.com</li>
            <li><strong>Address:</strong> My Pup Platform, Austin, TX</li>
          </ul>
        </CardContent>
      </Card>

      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>By using My Pup, you acknowledge that you have read and understood these Terms of Service.</p>
      </div>
    </div>
  );
}

export default TermsOfService;