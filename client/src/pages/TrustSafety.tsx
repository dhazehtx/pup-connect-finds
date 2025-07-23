import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, Users, FileText, Phone, Eye, Lock } from 'lucide-react';

const TrustSafety = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Breeder Verification',
      description: 'All breeders undergo comprehensive background checks and facility inspections before joining our platform.',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'All transactions are processed through encrypted payment systems with escrow protection for qualified purchases.',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Eye,
      title: 'Content Moderation',
      description: 'Our AI-powered moderation system and human reviewers monitor all content to ensure quality and safety.',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: FileText,
      title: 'Health Documentation',
      description: 'Verified breeders provide health certificates, vaccination records, and genetic testing results.',
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const reportingGuidelines = [
    {
      title: 'Suspicious Listings',
      description: 'Report listings with unrealistic prices, poor quality photos, or missing essential information.',
      action: 'Report via listing page'
    },
    {
      title: 'Fraudulent Activity',
      description: 'Report requests for payments outside our platform, fake profiles, or scam attempts.',
      action: 'Contact support immediately'
    },
    {
      title: 'Animal Welfare Concerns',
      description: 'Report poor living conditions, sick animals, or unethical breeding practices.',
      action: 'Submit detailed report'
    },
    {
      title: 'Inappropriate Content',
      description: 'Report offensive messages, harassment, or content that violates community guidelines.',
      action: 'Use in-app reporting tools'
    }
  ];

  const verificationBadges = [
    {
      badge: 'Identity Verified',
      description: 'Breeder\'s identity has been confirmed through government-issued documents',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      badge: 'Facility Inspected',
      description: 'Professional inspection of breeding facilities and living conditions',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      badge: 'Health Certified',
      description: 'Provides comprehensive health records and genetic testing',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      badge: 'Premium Breeder',
      description: 'Highest level of verification with ongoing monitoring and support',
      icon: Shield,
      color: 'text-gold-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Trust & Safety</h1>
          <p className="text-xl text-blue-100">
            Your safety and security are our top priorities. Learn about our comprehensive protection measures.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Safety Features */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Safety Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built multiple layers of protection to ensure a safe and trustworthy experience for all users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Verification Badges */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Badges</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Look for these badges to identify verified and trusted breeders on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {verificationBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${badge.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{badge.badge}</h3>
                        <p className="text-gray-600">{badge.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Reporting Guidelines */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Concerns</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us maintain a safe community by reporting suspicious activity or safety concerns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {reportingGuidelines.map((guideline, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    {guideline.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{guideline.description}</p>
                  <Button variant="outline" size="sm">
                    {guideline.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">Emergency Reporting</h2>
            <p className="text-red-700 mb-6">
              If you encounter immediate safety concerns, animal abuse, or fraudulent activity that requires urgent attention:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Call Emergency Line
              </Button>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Submit Urgent Report
              </Button>
            </div>
          </div>
        </section>

        {/* Community Guidelines */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h4>Our Community Standards:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Treat all community members with respect and kindness</li>
                  <li>• Provide accurate and honest information in all listings and communications</li>
                  <li>• Prioritize animal welfare and ethical breeding practices</li>
                  <li>• Use secure payment methods and follow our transaction guidelines</li>
                  <li>• Report suspicious activity or safety concerns promptly</li>
                  <li>• Respect privacy and do not share personal information publicly</li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <Button>Read Full Community Guidelines</Button>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
};

export default TrustSafety;