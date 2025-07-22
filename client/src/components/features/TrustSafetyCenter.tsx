
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TrustSafetyCenter = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Verified Sellers',
      description: 'All sellers undergo identity verification and background checks',
      status: 'Active'
    },
    {
      icon: Eye,
      title: '24/7 Monitoring',
      description: 'AI-powered content moderation and human review team',
      status: 'Active'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Protected transactions with buyer guarantees',
      status: 'Active'
    },
    {
      icon: Users,
      title: 'Community Reports',
      description: 'User-powered reporting system for suspicious activity',
      status: 'Active'
    }
  ];

  const reportingStats = [
    { label: 'Reports Resolved', value: '1,247', change: '+12%' },
    { label: 'Response Time', value: '< 2 hours', change: '-15%' },
    { label: 'User Satisfaction', value: '98.5%', change: '+2%' },
    { label: 'Prevented Fraud', value: '$45K+', change: '+8%' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trust & Safety Center</h2>
        <p className="text-gray-600">Our commitment to keeping your pet marketplace safe and secure</p>
      </div>

      {/* Safety Features */}
      <div className="grid md:grid-cols-2 gap-4">
        {safetyFeatures.map((feature, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <feature.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reporting Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Safety Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportingStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-xs text-green-600">{stat.change}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-red-900 mb-2">Emergency Animal Welfare Concerns</h3>
          <p className="text-red-700 mb-4">
            If you witness animal abuse or urgent welfare issues, contact local authorities immediately.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="border-red-300 text-red-700">
              Local Animal Control
            </Button>
            <Button className="bg-red-600 hover:bg-red-700">
              Report Emergency
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustSafetyCenter;
