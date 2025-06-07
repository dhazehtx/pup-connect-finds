
import React from 'react';
import { Shield, Eye, AlertTriangle, CheckCircle, Flag, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const TrustSafety = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Verified Breeders',
      description: 'All breeders undergo thorough verification including identity confirmation, facility inspection, and reference checks.',
      status: 'Active'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payments',
      description: 'Protected payment processing with escrow services to ensure safe transactions for both buyers and sellers.',
      status: 'Active'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Review System',
      description: 'Transparent review system allowing buyers to share experiences and help others make informed decisions.',
      status: 'Active'
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Fraud Detection',
      description: 'Advanced monitoring systems to detect and prevent fraudulent activity and protect our community.',
      status: 'Active'
    }
  ];

  const safetyTips = [
    {
      category: 'Before You Buy',
      tips: [
        'Always verify the breeder\'s credentials and certifications',
        'Ask for health certificates and vaccination records',
        'Request to see the puppy\'s parents if possible',
        'Research the breed and understand their specific needs',
        'Check reviews and ratings from other buyers'
      ]
    },
    {
      category: 'During Communication',
      tips: [
        'Keep all communications within the MY PUP platform',
        'Be wary of sellers who ask for immediate payment',
        'Ask detailed questions about the puppy\'s health and history',
        'Request additional photos and videos',
        'Arrange to meet the puppy in person when possible'
      ]
    },
    {
      category: 'Payment Safety',
      tips: [
        'Use only our secure payment system',
        'Never send money through wire transfers or cryptocurrency',
        'Be cautious of deals that seem too good to be true',
        'Understand our refund and dispute resolution process',
        'Keep records of all communications and transactions'
      ]
    },
    {
      category: 'Red Flags',
      tips: [
        'Seller refuses video calls or in-person meetings',
        'Pressures you to make immediate decisions',
        'Prices significantly below market value',
        'Unable to provide proper documentation',
        'Requests payment outside our platform'
      ]
    }
  ];

  const reportTypes = [
    { type: 'Fraud', description: 'Suspicious or fraudulent activity' },
    { type: 'Scam', description: 'Attempts to deceive or steal money' },
    { type: 'Fake Listing', description: 'Misleading or false information' },
    { type: 'Harassment', description: 'Inappropriate or threatening behavior' },
    { type: 'Safety Concern', description: 'Animal welfare or safety issues' }
  ];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
          <h2 className="text-2xl font-bold text-black mb-6">Our Safety Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="border-royal-blue">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-royal-blue">{feature.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-black">{feature.title}</h3>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-black/70 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Safety Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {safetyTips.map((section, index) => (
              <Card key={index} className="border-royal-blue">
                <CardHeader>
                  <CardTitle className="text-black">{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-royal-blue flex-shrink-0 mt-0.5" />
                        <span className="text-black/70">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Report Issues */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Report Safety Issues</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-royal-blue">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-3">
                  <Flag className="w-5 h-5 text-royal-blue" />
                  Report Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportTypes.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-royal-blue/5 rounded-lg">
                      <div>
                        <h4 className="font-medium text-black">{report.type}</h4>
                        <p className="text-sm text-black/70">{report.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-royal-blue text-black hover:bg-royal-blue/20"
                      >
                        Report
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-royal-blue bg-royal-blue/5">
              <CardHeader>
                <CardTitle className="text-black">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-black mb-2">For Immediate Safety Concerns:</h4>
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-royal-blue text-white hover:bg-royal-blue/90"
                        onClick={() => window.open('tel:1-800-MY-PUPPY')}
                      >
                        <Phone className="mr-2" size={16} />
                        Call Emergency Hotline
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-royal-blue text-black hover:bg-royal-blue/20"
                        onClick={() => window.open('mailto:emergency@mypup.com')}
                      >
                        <Mail className="mr-2" size={16} />
                        Email Emergency Team
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-black/70">
                      Our emergency team is available 24/7 for urgent safety matters. 
                      We respond to emergency reports immediately.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Guidelines */}
        <Card className="border-royal-blue bg-royal-blue/5">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-3">
              <Shield className="w-6 h-6 text-royal-blue" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-black mb-3">We Expect All Users To:</h4>
                <ul className="space-y-2 text-sm text-black/70">
                  <li>• Provide accurate and truthful information</li>
                  <li>• Treat all community members with respect</li>
                  <li>• Follow all applicable laws and regulations</li>
                  <li>• Report suspicious or harmful activity</li>
                  <li>• Maintain the privacy of others</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black mb-3">We Do Not Tolerate:</h4>
                <ul className="space-y-2 text-sm text-black/70">
                  <li>• Fraudulent or deceptive practices</li>
                  <li>• Harassment or threatening behavior</li>
                  <li>• Spam or unsolicited communications</li>
                  <li>• Violation of animal welfare standards</li>
                  <li>• Attempts to circumvent our safety measures</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/contact')}
                  className="bg-royal-blue text-white hover:bg-royal-blue/90"
                >
                  Contact Trust & Safety Team
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/terms')}
                  className="border-royal-blue text-black hover:bg-royal-blue/20"
                >
                  View Community Guidelines
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
