import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CommissionCalculator } from '@/components/commissions/CommissionCalculator';
import { SellerEarningsCard } from '@/components/commissions/SellerEarningsCard';
import { AdminCommissionPanel } from '@/components/commissions/AdminCommissionPanel';
import { TrendingUp, Calculator, Wallet, Settings } from 'lucide-react';

export const CommissionCenter: React.FC = () => {
  const [isAdmin] = useState(true); // TODO: Get from auth context
  const [currentUserId] = useState('8b7adf6a-eb74-43a0-9a26-575e658886ac5'); // TODO: Get from auth context

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Center</h1>
          <p className="text-gray-600">
            Track earnings, calculate fees, and manage commission settings
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            My Earnings
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin Panel
            </TabsTrigger>
          )}
        </TabsList>

        {/* Commission Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Calculator</CardTitle>
              <CardDescription>
                Calculate platform fees and seller payouts for different listing types before creating your listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionCalculator />
            </CardContent>
          </Card>

          {/* Commission Information */}
          <Card>
            <CardHeader>
              <CardTitle>How Commission Works</CardTitle>
              <CardDescription>
                Understanding MY PUP's commission structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Commission Rates</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Puppy Listings:</strong> 10% commission</li>
                    <li>• <strong>Pet Services:</strong> 15% commission</li>
                    <li>• <strong>Rehoming:</strong> $19.99 flat fee</li>
                    <li>• <strong>Premium Features:</strong> No commission (direct platform revenue)</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">When You Get Paid</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Earnings are pending until transaction completes</li>
                    <li>• Payouts processed weekly on Fridays</li>
                    <li>• Direct deposit to your linked bank account</li>
                    <li>• Track all payments in your earnings dashboard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <SellerEarningsCard sellerId={currentUserId} showDetailed={true} />

          {/* Quick Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Maximize Your Earnings</CardTitle>
              <CardDescription className="text-blue-700">
                Tips to increase your sales and reduce fees
              </CardDescription>
            </CardHeader>
            <CardContent className="text-blue-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Optimize Your Listings:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Use high-quality photos</li>
                    <li>• Write detailed descriptions</li>
                    <li>• Set competitive pricing</li>
                    <li>• Respond quickly to inquiries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Build Your Reputation:</h4>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Maintain excellent ratings</li>
                    <li>• Complete transactions promptly</li>
                    <li>• Provide exceptional customer service</li>
                    <li>• Get verified as a trusted seller</li>
                  </ul>
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