import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  BarChart3,
  Wallet
} from 'lucide-react';

interface SellerEarningsCardProps {
  sellerId: string;
  showDetailed?: boolean;
}

interface SellerEarnings {
  total_sales: number;
  platform_fees: number;
  net_earnings: number;
  pending_payouts: number;
  completed_payouts: number;
  transaction_count: number;
}

export const SellerEarningsCard: React.FC<SellerEarningsCardProps> = ({
  sellerId,
  showDetailed = true
}) => {
  const { data: earningsData, isLoading } = useQuery({
    queryKey: [`/api/commissions/seller/${sellerId}/earnings`],
    queryFn: async () => {
      const response = await fetch(`/api/commissions/seller/${sellerId}/earnings`);
      if (!response.ok) throw new Error('Failed to fetch earnings');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnings: SellerEarnings = earningsData?.earnings || {
    total_sales: 0,
    platform_fees: 0,
    net_earnings: 0,
    pending_payouts: 0,
    completed_payouts: 0,
    transaction_count: 0
  };

  const effectiveCommissionRate = earnings.total_sales > 0 
    ? (earnings.platform_fees / earnings.total_sales) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Your Earnings Summary
        </CardTitle>
        <CardDescription>
          Track your sales performance and commission breakdown
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Sales */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${earnings.total_sales.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              From {earnings.transaction_count} transactions
            </p>
          </div>

          {/* Net Earnings */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Net Earnings</p>
                <p className="text-2xl font-bold text-green-900">
                  ${earnings.net_earnings.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              After platform fees
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        {showDetailed && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Commission Breakdown
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Platform Fees:</span>
                  <span className="font-medium text-red-600">
                    -${earnings.platform_fees.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Effective Commission Rate:</span>
                  <Badge variant="outline">
                    {effectiveCommissionRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payout Status */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Payout Status</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Pending</span>
                  </div>
                  <span className="font-semibold text-amber-900">
                    ${earnings.pending_payouts.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Completed</span>
                  </div>
                  <span className="font-semibold text-green-900">
                    ${earnings.completed_payouts.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            {earnings.transaction_count > 0 && (
              <>
                <Separator />
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Performance Insights</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Average Sale:</span>
                      <span className="ml-2 font-medium">
                        ${(earnings.total_sales / earnings.transaction_count).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Average Fee:</span>
                      <span className="ml-2 font-medium">
                        ${(earnings.platform_fees / earnings.transaction_count).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Empty State */}
        {earnings.transaction_count === 0 && (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales yet</h3>
            <p className="text-gray-600">
              Start selling to see your earnings and commission breakdown here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};