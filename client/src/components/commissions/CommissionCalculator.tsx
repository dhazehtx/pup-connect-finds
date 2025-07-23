import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator, DollarSign, Percent, TrendingUp } from 'lucide-react';

interface CommissionCalculation {
  total_amount: number;
  commission_percent: number;
  platform_fee: number;
  seller_payout: number;
  applied_rule: string;
}

export const CommissionCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(100);
  const [listingType, setListingType] = useState<string>('puppy');
  const [calculation, setCalculation] = useState<CommissionCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch commission settings
  const { data: settingsData } = useQuery({
    queryKey: ['/api/commissions/settings'],
    queryFn: async () => {
      const response = await fetch('/api/commissions/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  const handleCalculate = async () => {
    if (!amount || amount <= 0) return;
    
    setIsCalculating(true);
    try {
      const response = await fetch('/api/commissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, listing_type: listingType })
      });
      
      if (!response.ok) throw new Error('Calculation failed');
      
      const data = await response.json();
      setCalculation(data.calculation);
    } catch (error) {
      console.error('Error calculating commission:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const listingTypeOptions = [
    { value: 'puppy', label: 'Puppy Listing' },
    { value: 'service', label: 'Pet Service' },
    { value: 'rehoming', label: 'Rehoming Fee' },
    { value: 'premium', label: 'Premium Feature' },
    { value: 'subscription', label: 'Subscription' }
  ];

  const getSettingForType = (type: string) => {
    return settingsData?.settings?.find((s: any) => s.listing_type === type);
  };

  const currentSetting = getSettingForType(listingType);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Commission Calculator
        </CardTitle>
        <CardDescription>
          Calculate platform fees and seller payouts for different listing types
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Transaction Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="listing-type">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                {listingTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Setting Display */}
        {currentSetting && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Current Rate</h4>
            <div className="text-sm text-gray-700">
              {currentSetting.flat_fee ? (
                <span>Flat fee: ${parseFloat(currentSetting.flat_fee).toFixed(2)}</span>
              ) : (
                <span>{parseFloat(currentSetting.commission_percent).toFixed(1)}% commission</span>
              )}
              {currentSetting.description && (
                <p className="mt-1 text-gray-600">{currentSetting.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          disabled={isCalculating || !amount || amount <= 0}
          className="w-full"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Commission'}
        </Button>

        {/* Results */}
        {calculation && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Commission Breakdown
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Transaction Amount:</span>
                    <span className="font-semibold text-blue-900">
                      ${calculation.total_amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Commission Rate:</span>
                    <span className="font-semibold text-blue-900 flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {calculation.commission_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Platform Fee:</span>
                    <span className="font-semibold text-red-600">
                      -${calculation.platform_fee.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Seller Payout:</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {calculation.seller_payout.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Applied Rule:</strong> {calculation.applied_rule}
                </p>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Visual Breakdown</h5>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ 
                    width: `${(calculation.seller_payout / calculation.total_amount) * 100}%` 
                  }}
                >
                  Seller: {((calculation.seller_payout / calculation.total_amount) * 100).toFixed(1)}%
                </div>
                <div 
                  className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ 
                    width: `${(calculation.platform_fee / calculation.total_amount) * 100}%`,
                    marginTop: '-24px'
                  }}
                >
                  Platform: {((calculation.platform_fee / calculation.total_amount) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};