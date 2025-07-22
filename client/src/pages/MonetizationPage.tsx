
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, DollarSign, Star, Zap } from 'lucide-react';

const MonetizationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Crown size={48} className="text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Premium Features</h1>
          <p className="text-gray-600">Unlock advanced features and grow your business</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Basic Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">$9.99/month</div>
              <ul className="space-y-2 text-sm">
                <li>• Up to 5 listings</li>
                <li>• Basic analytics</li>
                <li>• Email support</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Pro Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">$19.99/month</div>
              <ul className="space-y-2 text-sm">
                <li>• Unlimited listings</li>
                <li>• Advanced analytics</li>
                <li>• Priority support</li>
                <li>• Featured listings</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">$49.99/month</div>
              <ul className="space-y-2 text-sm">
                <li>• Everything in Pro</li>
                <li>• Custom branding</li>
                <li>• API access</li>
                <li>• Dedicated support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MonetizationPage;
