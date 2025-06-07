
import React from 'react';
import { Shield, Eye, Lock, Database, AlertCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'overview',
      title: '1. Overview',
      icon: <Eye className="w-5 h-5" />,
      content: `MY PUP ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully.`
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect',
      icon: <Database className="w-5 h-5" />,
      content: `We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes personal information like your name, email address, phone number, address, and payment information. We also collect information automatically through your use of our platform, including IP address, browser type, and usage patterns.`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      icon: <Lock className="w-5 h-5" />,
      content: `We use the information we collect to: provide, maintain, and improve our services; process transactions and send related information; send you technical notices, updates, security alerts, and support messages; respond to your comments, questions, and requests; monitor and analyze trends, usage, and activities; and detect, investigate, and prevent fraudulent transactions and other illegal activities.`
    },
    {
      id: 'information-sharing',
      title: '4. Information Sharing and Disclosure',
      icon: <Shield className="w-5 h-5" />,
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with: service providers who assist us in operating our platform; law enforcement or other authorities when required by law; other parties in connection with a merger, acquisition, or sale of assets.`
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      icon: <Lock className="w-5 h-5" />,
      content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.`
    },
    {
      id: 'your-rights',
      title: '6. Your Rights and Choices',
      icon: <Eye className="w-5 h-5" />,
      content: `You have the right to: access, update, or delete your personal information; opt out of receiving promotional communications; request that we limit the use and disclosure of your personal information; and withdraw consent where we rely on your consent to process your personal information.`
    },
    {
      id: 'cookies',
      title: '7. Cookies and Tracking Technologies',
      icon: <Database className="w-5 h-5" />,
      content: `We use cookies and similar tracking technologies to collect and track information about your use of our platform. Cookies are small data files stored on your device. You can control cookies through your browser settings, but disabling cookies may affect the functionality of our platform.`
    },
    {
      id: 'children',
      title: '8. Children\'s Privacy',
      icon: <Shield className="w-5 h-5" />,
      content: `Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information as quickly as possible.`
    },
    {
      id: 'international',
      title: '9. International Data Transfers',
      icon: <Lock className="w-5 h-5" />,
      content: `Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws than your country. We take steps to ensure that your information receives an adequate level of protection in the jurisdictions in which we process it.`
    },
    {
      id: 'retention',
      title: '10. Data Retention',
      icon: <Database className="w-5 h-5" />,
      content: `We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law. When we no longer need your personal information, we will securely delete or destroy it.`
    },
    {
      id: 'changes',
      title: '11. Changes to This Privacy Policy',
      icon: <Eye className="w-5 h-5" />,
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "last updated" date. You are advised to review this privacy policy periodically for any changes.`
    },
    {
      id: 'contact',
      title: '12. Contact Us',
      icon: <Mail className="w-5 h-5" />,
      content: `If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@mypup.com or through our contact form. We will respond to your inquiry within a reasonable timeframe.`
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-xl opacity-90">Last updated: December 7, 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <Card className="mb-8 border-royal-blue bg-royal-blue/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-royal-blue flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-black mb-2">Your Privacy Matters</h3>
                <p className="text-black/70">
                  We are committed to protecting your privacy and being transparent about how we collect, 
                  use, and share your information. This policy explains our practices in detail.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id} className="border-royal-blue">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-3">
                  <div className="text-royal-blue">{section.icon}</div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70 leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Your Rights Summary */}
        <Card className="mt-12 border-royal-blue bg-royal-blue/5">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-3">
              <Eye className="w-6 h-6 text-royal-blue" />
              Quick Summary: Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-black">You can:</h4>
                <ul className="space-y-1 text-sm text-black/70">
                  <li>• Access your personal data</li>
                  <li>• Update or correct your information</li>
                  <li>• Delete your account and data</li>
                  <li>• Opt out of marketing communications</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-black">We commit to:</h4>
                <ul className="space-y-1 text-sm text-black/70">
                  <li>• Protecting your data with strong security</li>
                  <li>• Never selling your personal information</li>
                  <li>• Being transparent about our practices</li>
                  <li>• Responding promptly to your requests</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <Card className="mt-8 border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-royal-blue" />
              <h3 className="text-xl font-bold text-black">Questions About Your Privacy?</h3>
            </div>
            <p className="text-black/70 mb-6">
              If you have any questions about this privacy policy or how we handle your data, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-royal-blue text-white hover:bg-royal-blue/90"
              >
                Contact Privacy Team
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/terms')}
                className="border-royal-blue text-black hover:bg-royal-blue/20"
              >
                View Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
