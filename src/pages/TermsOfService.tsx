
import React from 'react';
import { Scale, FileText, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing and using MY PUP ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      content: `"Platform" refers to the MY PUP website and mobile application. "User" refers to any individual who accesses or uses the Platform. "Breeder" refers to users who list puppies for sale. "Buyer" refers to users who purchase puppies through the Platform.`
    },
    {
      id: 'use-license',
      title: '3. Use License',
      content: `Permission is granted to temporarily use the Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; remove any copyright or other proprietary notations from the materials.`
    },
    {
      id: 'user-accounts',
      title: '4. User Accounts',
      content: `You are responsible for safeguarding the password and for maintaining the confidentiality of your account. You agree not to disclose your password to any third party and to take sole responsibility for activities that occur under your account.`
    },
    {
      id: 'prohibited-uses',
      title: '5. Prohibited Uses',
      content: `You may not use the Platform to: violate any applicable law or regulation; transmit any harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable material; impersonate any person or entity; engage in any fraudulent activity; or attempt to gain unauthorized access to other user accounts.`
    },
    {
      id: 'transactions',
      title: '6. Transactions',
      content: `MY PUP facilitates connections between buyers and breeders but is not a party to any transaction. All transactions are between users. We provide secure payment processing but do not guarantee the quality, safety, legality, or accuracy of any listings.`
    },
    {
      id: 'fees',
      title: '7. Fees and Payments',
      content: `Basic use of the Platform is free for buyers. Breeders may be charged fees for certain services as outlined in our pricing structure. All fees are non-refundable unless otherwise stated.`
    },
    {
      id: 'content',
      title: '8. User Content',
      content: `Users retain ownership of content they post but grant MY PUP a worldwide, non-exclusive, royalty-free license to use, modify, and distribute such content for Platform operations. Users are responsible for ensuring their content does not violate any third-party rights.`
    },
    {
      id: 'privacy',
      title: '9. Privacy Policy',
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Platform. By using the Platform, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      id: 'disclaimer',
      title: '10. Disclaimer',
      content: `The materials on MY PUP are provided on an 'as is' basis. MY PUP makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`
    },
    {
      id: 'limitations',
      title: '11. Limitations of Liability',
      content: `In no event shall MY PUP or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Platform, even if MY PUP or its authorized representative has been notified orally or in writing of the possibility of such damage.`
    },
    {
      id: 'termination',
      title: '12. Termination',
      content: `We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.`
    },
    {
      id: 'changes',
      title: '13. Changes to Terms',
      content: `MY PUP reserves the right to revise these terms of service at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these Terms of Service.`
    },
    {
      id: 'contact',
      title: '14. Contact Information',
      content: `If you have any questions about these Terms of Service, please contact us at legal@mypup.com or through our contact form.`
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
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
                <h3 className="font-semibold text-black mb-2">Important Notice</h3>
                <p className="text-black/70">
                  Please read these Terms of Service carefully before using MY PUP. 
                  By accessing or using our platform, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.id} className="border-royal-blue">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-3">
                  <FileText className="w-5 h-5 text-royal-blue" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70 leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <Card className="mt-12 border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-royal-blue" />
              <h3 className="text-xl font-bold text-black">Questions About Our Terms?</h3>
            </div>
            <p className="text-black/70 mb-6">
              If you have any questions about these Terms of Service, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/contact')}
                className="bg-royal-blue text-white hover:bg-royal-blue/90"
              >
                Contact Legal Team
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/privacy-policy')}
                className="border-royal-blue text-black hover:bg-royal-blue/20"
              >
                View Privacy Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
