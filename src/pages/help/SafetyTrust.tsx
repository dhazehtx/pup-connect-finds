
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SafetyTrust = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      title: 'Verified Breeders',
      icon: <Shield className="h-6 w-6" />,
      description: 'All breeders undergo thorough verification including background checks, license verification, and reference validation.',
      benefits: [
        'Background checks and identity verification',
        'License and permit validation',
        'Reference checks from previous customers',
        'Ongoing monitoring and review process'
      ]
    },
    {
      title: 'Secure Payments',
      icon: <Lock className="h-6 w-6" />,
      description: 'Our escrow system protects your payment until you meet your puppy and confirm the transaction.',
      benefits: [
        'Payments held securely until transaction completion',
        'Protection against fraud and misrepresentation',
        'Dispute resolution process available',
        'Multiple secure payment methods accepted'
      ]
    },
    {
      title: 'Content Moderation',
      icon: <Eye className="h-6 w-6" />,
      description: 'AI-powered and human moderation ensures all listings meet our quality and safety standards.',
      benefits: [
        '24/7 automated content screening',
        'Human review of flagged content',
        'Removal of suspicious or fraudulent listings',
        'Continuous improvement of safety measures'
      ]
    }
  ];

  const safetyTips = [
    {
      category: 'Before Meeting',
      tips: [
        'Verify the breeder\'s credentials and reviews',
        'Ask for references from previous customers',
        'Request video calls to see the puppy and facilities',
        'Research the breed and typical pricing',
        'Never send money before meeting the puppy'
      ]
    },
    {
      category: 'During the Meeting',
      tips: [
        'Meet in a safe, public location or at the breeder\'s facility',
        'Bring a friend or family member if possible',
        'Inspect health certificates and vaccination records',
        'Observe the puppy\'s behavior and health',
        'Ask to meet the mother and learn about the father'
      ]
    },
    {
      category: 'Making Payment',
      tips: [
        'Use our secure escrow payment system only',
        'Never pay with wire transfers, gift cards, or cryptocurrency',
        'Get all agreements in writing',
        'Ensure you receive all documentation',
        'Schedule a vet visit within 48 hours'
      ]
    }
  ];

  const redFlags = [
    'Sellers who refuse to meet in person or show facilities',
    'Requests for unusual payment methods',
    'Prices significantly below market value',
    'Multiple different breeds available from same seller',
    'Puppies under 8 weeks old',
    'No health certificates or vaccination records',
    'Pressure to buy immediately',
    'Poor communication or evasive answers'
  ];

  const reportingProcess = [
    'Click the "Report" button on any suspicious listing',
    'Provide detailed information about the concern',
    'Our moderation team reviews within 24 hours',
    'Listings are investigated and action taken if needed',
    'You\'ll receive updates on the status of your report'
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/help-center')}
            className="text-cloud-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Help Center
          </Button>
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Safety & Trust</h1>
          </div>
          <p className="text-xl opacity-90">Learn how we keep you safe and how to protect yourself</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <Card className="border-soft-sky">
            <CardHeader>
              <CardTitle className="text-deep-navy">Our Safety Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {safetyFeatures.map((feature, index) => (
                  <div key={index} className="border-l-4 border-royal-blue pl-4">
                    <div className="flex items-center mb-2">
                      <div className="text-royal-blue mr-3">{feature.icon}</div>
                      <h3 className="font-semibold text-deep-navy">{feature.title}</h3>
                    </div>
                    <p className="text-deep-navy/70 mb-3">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-deep-navy/70">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {safetyTips.map((section, index) => (
              <Card key={index} className="border-soft-sky">
                <CardHeader>
                  <CardTitle className="text-deep-navy text-base">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-royal-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-deep-navy/70">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Red Flags to Watch For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{flag}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">How to Report Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportingProcess.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-blue-700">{step}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <p className="text-blue-800 font-medium">Need immediate help?</p>
                <p className="text-blue-700 text-sm">
                  Visit our <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-700 underline"
                    onClick={() => navigate('/trust-safety')}
                  >
                    Trust & Safety Center
                  </Button> to report emergencies or serious concerns.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SafetyTrust;
