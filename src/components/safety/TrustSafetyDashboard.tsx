
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Flag, CheckCircle, Users, Book } from 'lucide-react';
import ReportButton from '@/components/features/ReportButton';

const TrustSafetyDashboard = () => {
  const [safetyScore, setSafetyScore] = useState(85);

  const safetyTips = [
    {
      title: "Meet in Public Places",
      description: "Always meet potential buyers/sellers in safe, public locations with good lighting and foot traffic.",
      icon: Users
    },
    {
      title: "Verify Identity",
      description: "Ask for identification and verify seller credentials before making any payments.",
      icon: CheckCircle
    },
    {
      title: "Use Escrow Services",
      description: "Use our secure escrow service to protect your payment until the transaction is complete.",
      icon: Shield
    },
    {
      title: "Check Health Records",
      description: "Always request and verify health certificates and vaccination records.",
      icon: Book
    }
  ];

  const fraudIndicators = [
    "Unusually low prices for purebred dogs",
    "Seller refuses to meet in person or video chat",
    "Requests payment via wire transfer or cryptocurrency",
    "No health certificates or veterinary records",
    "Pressures for immediate payment or decision",
    "Multiple listings with similar photos but different locations"
  ];

  return (
    <div className="space-y-6">
      {/* Safety Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="text-green-600" size={24} />
            Your Safety Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600">{safetyScore}</div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${safetyScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Great! You're following most safety best practices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tips" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tips">Safety Tips</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Prevention</TabsTrigger>
          <TabsTrigger value="report">Report Issues</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyTips.map((tip, index) => {
              const IconComponent = tip.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <IconComponent className="text-blue-600 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold mb-2">{tip.title}</h3>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={20} />
                Red Flags to Watch Out For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fraudIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm">{indicator}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What to Do If You Suspect Fraud</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">1. <strong>Stop all communication</strong> with the suspicious party</p>
                <p className="text-sm">2. <strong>Do not send money</strong> or provide personal information</p>
                <p className="text-sm">3. <strong>Report the user</strong> using our reporting system</p>
                <p className="text-sm">4. <strong>Contact support</strong> if you've already sent payment</p>
              </div>
              <Button variant="outline">
                <Flag className="mr-2" size={16} />
                Report Suspicious Activity
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Safety Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Help keep our community safe by reporting suspicious listings, users, or activities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Report a User</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Report suspicious behavior, harassment, or fraud
                    </p>
                    <ReportButton 
                      reportType="user"
                      targetId="sample-user-id"
                      size="sm"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Report a Listing</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Report fake listings, puppy mills, or other violations
                    </p>
                    <ReportButton 
                      reportType="listing"
                      targetId="sample-listing-id"
                      size="sm"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Prohibited Activities</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Selling dogs from puppy mills</li>
                    <li>• Misrepresenting dog breed, age, or health status</li>
                    <li>• Harassment or inappropriate communication</li>
                    <li>• Fraudulent payment schemes</li>
                    <li>• Selling underage puppies (under 8 weeks)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Best Practices</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Provide accurate, detailed descriptions</li>
                    <li>• Include multiple recent photos</li>
                    <li>• Maintain all health records</li>
                    <li>• Communicate respectfully</li>
                    <li>• Honor agreements and commitments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrustSafetyDashboard;
