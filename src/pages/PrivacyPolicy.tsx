
import React from 'react';
import { Shield, Eye, Lock, FileText, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: <FileText className="h-5 w-5" />,
      content: [
        'Personal information you provide when creating an account (name, email, phone)',
        'Profile information including photos, bio, and location',
        'Listing information for puppies you post for sale',
        'Messages and communications between users',
        'Payment information processed through secure third-party providers',
        'Device information and usage analytics to improve our service'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: <Users className="h-5 w-5" />,
      content: [
        'To provide and maintain our platform services',
        'To facilitate connections between buyers and sellers',
        'To process payments and transactions securely',
        'To send important account and service notifications',
        'To improve our platform through analytics and research',
        'To comply with legal obligations and prevent fraud'
      ]
    },
    {
      title: 'Information Sharing',
      icon: <Globe className="h-5 w-5" />,
      content: [
        'We never sell your personal information to third parties',
        'Profile information is visible to other users as part of the service',
        'We may share information with service providers who help operate our platform',
        'We may disclose information when required by law or to protect our users',
        'Anonymous, aggregated data may be used for research and analytics',
        'In case of business transfer, user data may be transferred to new owners'
      ]
    },
    {
      title: 'Data Security',
      icon: <Lock className="h-5 w-5" />,
      content: [
        'We use industry-standard encryption to protect your data',
        'Payment information is processed through PCI-compliant providers',
        'Regular security audits and penetration testing',
        'Secure data centers with 24/7 monitoring',
        'Two-factor authentication available for enhanced security',
        'Immediate notification of any suspected security breaches'
      ]
    },
    {
      title: 'Your Privacy Rights',
      icon: <Eye className="h-5 w-5" />,
      content: [
        'Access and review your personal information',
        'Update or correct your account information',
        'Delete your account and associated data',
        'Opt out of marketing communications',
        'Request a copy of your data in portable format',
        'File complaints with data protection authorities'
      ]
    },
    {
      title: 'Cookies and Tracking',
      icon: <Shield className="h-5 w-5" />,
      content: [
        'We use cookies to improve your browsing experience',
        'Analytics cookies help us understand user behavior',
        'You can control cookie preferences in your browser',
        'Third-party cookies may be used for advertising',
        'We respect "Do Not Track" browser settings',
        'Cookie consent is required for non-essential cookies'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-cloud-white" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl opacity-90">How we protect and handle your personal information</p>
            <p className="text-sm opacity-75 mt-4">Last updated: December 2024</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <Card className="border-soft-sky mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-deep-navy mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-deep-navy/70 mb-4">
              At MY PUP, we understand that your privacy is important. This Privacy Policy explains how we collect, 
              use, and protect your personal information when you use our platform to connect with puppy breeders 
              and find your perfect companion.
            </p>
            <p className="text-deep-navy/70">
              We are committed to transparency in our data practices and giving you control over your personal information. 
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index} className="border-soft-sky">
              <CardHeader>
                <CardTitle className="text-deep-navy flex items-center">
                  <div className="text-royal-blue mr-3">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-royal-blue mt-2 flex-shrink-0" />
                      <span className="text-deep-navy/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Age Requirements */}
        <Card className="border-soft-sky mt-8">
          <CardHeader>
            <CardTitle className="text-deep-navy">Age Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-deep-navy/70 mb-4">
              Our service is intended for users who are at least 18 years old. We do not knowingly collect 
              personal information from children under 18. If you are a parent or guardian and you are aware 
              that your child has provided us with personal information, please contact us immediately.
            </p>
            <p className="text-deep-navy/70">
              If we discover that a child under 18 has provided us with personal information, we will delete 
              such information from our servers immediately.
            </p>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="border-soft-sky mt-6">
          <CardHeader>
            <CardTitle className="text-deep-navy">Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-deep-navy/70 mb-4">
              We retain your personal information only as long as necessary to provide our services and 
              fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will 
              remove your personal information within 30 days, except where we are required to retain 
              certain information for legal or regulatory purposes.
            </p>
            <p className="text-deep-navy/70">
              Some information may be retained in anonymized form for analytical purposes to improve our services.
            </p>
          </CardContent>
        </Card>

        {/* International Users */}
        <Card className="border-soft-sky mt-6">
          <CardHeader>
            <CardTitle className="text-deep-navy">International Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-deep-navy/70 mb-4">
              MY PUP is based in the United States. If you are accessing our service from outside the US, 
              please be aware that your information may be transferred to, stored, and processed in the 
              United States where our servers are located and our central database is operated.
            </p>
            <p className="text-deep-navy/70">
              We take appropriate measures to ensure your data is protected in accordance with this 
              Privacy Policy regardless of where it is processed.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-soft-sky mt-6">
          <CardHeader>
            <CardTitle className="text-deep-navy">Questions About Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-deep-navy/70 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact our 
              Privacy Team:
            </p>
            <div className="space-y-2 text-deep-navy/70">
              <p><strong>Email:</strong> privacy@mypup.com</p>
              <p><strong>Mail:</strong> MY PUP Privacy Team, 123 Puppy Lane, Austin, TX 78701</p>
              <p><strong>Phone:</strong> 1-800-MY-PRIVACY</p>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="border-soft-sky mt-6">
          <CardHeader>
            <CardTitle className="text-deep-navy">Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-deep-navy/70">
              We may update this Privacy Policy from time to time. We will notify you of any significant 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
