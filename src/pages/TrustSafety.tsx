
import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Eye, Users, Phone, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TrustSafety = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Breeders',
      description: 'All breeders undergo thorough verification including identity, location, and credential checks.',
      color: 'bg-green-500'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure Payments',
      description: 'Protected payment processing with escrow services and fraud protection.',
      color: 'bg-blue-500'
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Listing Monitoring',
      description: 'AI-powered monitoring of all listings for suspicious activity and policy violations.',
      color: 'bg-purple-500'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Reporting',
      description: 'Easy reporting tools for community members to flag concerning behavior.',
      color: 'bg-red-500'
    }
  ];

  const safetyTips = [
    {
      category: 'Before You Buy',
      tips: [
        'Always verify the breeder is verified on our platform',
        'Ask to see health certificates and vaccination records',
        'Request to video call or visit the breeder if possible',
        'Research the breed and typical pricing',
        'Read reviews from other buyers'
      ]
    },
    {
      category: 'During the Transaction',
      tips: [
        'Use only our secure payment system',
        'Never send money outside the platform',
        'Keep all communication within our messaging system',
        'Document all agreements in writing',
        'Report any red flags immediately'
      ]
    },
    {
      category: 'Red Flags to Watch For',
      tips: [
        'Prices significantly below market value',
        'Pressure to pay immediately or outside the platform',
        'Refusal to provide health documentation',
        'No verification badge on breeder profile',
        'Poor communication or evasive answers'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Trust & Safety</h1>
          </div>
          <p className="text-xl opacity-90">Your safety is our top priority</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Safety Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black text-center mb-8">How We Keep You Safe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="border-royal-blue text-center">
                <CardContent className="p-6">
                  <div className={`${feature.color} text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-black mb-2">{feature.title}</h3>
                  <p className="text-black/70 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black text-center mb-8">Safety Tips</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {safetyTips.map((section, index) => (
              <Card key={index} className="border-royal-blue">
                <CardHeader>
                  <CardTitle className="text-black flex items-center gap-2">
                    {index === 0 && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {index === 1 && <Lock className="w-5 h-5 text-blue-500" />}
                    {index === 2 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-black/70">
                        <div className="w-1.5 h-1.5 bg-royal-blue rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reporting Section */}
        <Card className="mb-8 border-royal-blue bg-royal-blue/5">
          <CardContent className="p-8">
            <div className="text-center">
              <Flag className="w-12 h-12 text-royal-blue mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-black mb-4">Report Suspicious Activity</h3>
              <p className="text-black/70 mb-6 max-w-2xl mx-auto">
                If you encounter suspicious behavior, fraudulent listings, or safety concerns, 
                please report it immediately. Our team investigates all reports within 24 hours.
              </p>
              <Button className="bg-royal-blue text-white hover:bg-royal-blue/90">
                <Flag className="mr-2" size={16} />
                Report an Issue
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-royal-blue">
          <CardContent className="p-8">
            <div className="text-center">
              <Phone className="w-12 h-12 text-royal-blue mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-black mb-4">Emergency Support</h3>
              <p className="text-black/70 mb-6">
                For urgent safety concerns or emergencies, contact our support team immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/contact')}
                  className="bg-royal-blue text-white hover:bg-royal-blue/90"
                >
                  <Phone className="mr-2" size={16} />
                  Call Emergency Line
                </Button>
                <Button 
                  variant="outline"
                  className="border-royal-blue text-black hover:bg-royal-blue/20"
                >
                  Live Chat Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrustSafety;
