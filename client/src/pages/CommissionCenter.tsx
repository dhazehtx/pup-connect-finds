import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CommissionCalculator } from '@/components/commissions/CommissionCalculator';
import { SellerEarningsCard } from '@/components/commissions/SellerEarningsCard';
import { AdminCommissionPanel } from '@/components/commissions/AdminCommissionPanel';
import { DollarSign, Calculator, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const CommissionCenter: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin] = React.useState(true); // TODO: Get from auth context

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access the commission center.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Center</h1>
          <p className="text-gray-600">
            Track earnings, calculate fees, and manage commission settings
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="earnings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            My Earnings
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Commission Calculator
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin Panel
            </TabsTrigger>
          )}
        </TabsList>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <SellerEarningsCard sellerId={user.id} showDetailed={true} />
          
          {/* Information Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">How Commission Works</CardTitle>
              <CardDescription className="text-blue-700">
                Understanding our transparent fee structure
              </CardDescription>
            </CardHeader>
            <CardContent className="text-blue-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Commission Rates:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Puppy Listings: 10% commission</li>
                    <li>• Pet Services: 15% commission</li>
                    <li>• Rehoming: $19.99 flat fee</li>
                    <li>• Premium Features: Direct platform revenue</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Payout Timeline:</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Transaction completed: Commission calculated</li>
                    <li>• 7-day holding period: Fraud protection</li>
                    <li>• Weekly payouts: Every Tuesday</li>
                    <li>• Bank transfer: 2-5 business days</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Commission helps us maintain platform security, customer support, 
                  payment processing, and continuous improvements to keep PAWS the best marketplace for pets.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <CommissionCalculator />
          
          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference Guide</CardTitle>
              <CardDescription>
                Common scenarios and their commission calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">$500 Puppy Sale</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Price:</span>
                      <span>$500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission (10%):</span>
                      <span className="text-red-600">-$50.00</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-800">Your Earnings:</span>
                      <span className="text-green-600">$450.00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">$100 Pet Service</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Price:</span>
                      <span>$100.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission (15%):</span>
                      <span className="text-red-600">-$15.00</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-800">Your Earnings:</span>
                      <span className="text-green-600">$85.00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Rehoming Fee</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Any Amount:</span>
                      <span>$X.XX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flat Fee:</span>
                      <span className="text-red-600">-$19.99</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-800">Your Earnings:</span>
                      <span className="text-green-600">$X.XX - $19.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Panel Tab */}
        {isAdmin && (
          <TabsContent value="admin">
            <AdminCommissionPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};