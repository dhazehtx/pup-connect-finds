
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, CreditCard, Shield, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentPlan {
  id: string;
  type: 'full' | 'plan_3' | 'plan_6' | 'plan_12';
  name: string;
  description: string;
  downPayment: number;
  monthlyPayment: number;
  totalAmount: number;
  months: number;
  recommended?: boolean;
}

interface PaymentPlanOptionsProps {
  listingPrice: number;
  listingId: string;
  onPlanSelected?: (plan: PaymentPlan) => void;
}

const PaymentPlanOptions: React.FC<PaymentPlanOptionsProps> = ({
  listingPrice,
  listingId,
  onPlanSelected
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('full');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generatePaymentPlans = (): PaymentPlan[] => {
    const basePrice = listingPrice;
    const interestRate = 0.05; // 5% annual interest for payment plans
    
    return [
      {
        id: 'full',
        type: 'full',
        name: 'Pay in Full',
        description: 'One-time payment with no additional fees',
        downPayment: basePrice,
        monthlyPayment: 0,
        totalAmount: basePrice,
        months: 0,
        recommended: true
      },
      {
        id: 'plan_3',
        type: 'plan_3',
        name: '3-Month Plan',
        description: 'Pay over 3 months with minimal interest',
        downPayment: basePrice * 0.4,
        monthlyPayment: (basePrice * 0.6 * (1 + interestRate * 0.25)) / 3,
        totalAmount: basePrice * (1 + interestRate * 0.25),
        months: 3
      },
      {
        id: 'plan_6',
        type: 'plan_6',
        name: '6-Month Plan',
        description: 'Spread payments over 6 months',
        downPayment: basePrice * 0.3,
        monthlyPayment: (basePrice * 0.7 * (1 + interestRate * 0.5)) / 6,
        totalAmount: basePrice * (1 + interestRate * 0.5),
        months: 6
      },
      {
        id: 'plan_12',
        type: 'plan_12',
        name: '12-Month Plan',
        description: 'Lower monthly payments over a year',
        downPayment: basePrice * 0.25,
        monthlyPayment: (basePrice * 0.75 * (1 + interestRate)) / 12,
        totalAmount: basePrice * (1 + interestRate),
        months: 12
      }
    ];
  };

  const paymentPlans = generatePaymentPlans();

  const createPaymentPlan = async (plan: PaymentPlan) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { error } = await supabase
        .from('payment_plans')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          total_amount: plan.totalAmount,
          down_payment: plan.downPayment,
          monthly_payment: plan.monthlyPayment,
          number_of_payments: plan.months,
          next_payment_date: plan.months > 0 ? nextPaymentDate.toISOString() : null,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Payment Plan Created",
        description: `Your ${plan.name} has been set up successfully`,
      });

      onPlanSelected?.(plan);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create payment plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedPlanData = paymentPlans.find(plan => plan.id === selectedPlan);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="space-y-4"
          >
            {paymentPlans.map((plan) => (
              <div key={plan.id} className="relative">
                <Label
                  htmlFor={plan.id}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{plan.name}</h4>
                        {plan.recommended && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                      </div>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(plan.totalAmount)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {plan.type !== 'full' && (
                        <>
                          <div>
                            <span className="text-gray-500">Down payment:</span>
                            <div className="font-medium">{formatCurrency(plan.downPayment)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Monthly:</span>
                            <div className="font-medium">
                              {formatCurrency(plan.monthlyPayment)} × {plan.months}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {plan.type === 'full' && (
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <div className="font-medium">{formatCurrency(plan.totalAmount)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Plan Summary */}
      {selectedPlanData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Selected Plan:</span>
              <span className="font-medium">{selectedPlanData.name}</span>
            </div>
            
            {selectedPlanData.type !== 'full' && (
              <>
                <div className="flex justify-between items-center">
                  <span>Down Payment:</span>
                  <span className="font-medium">{formatCurrency(selectedPlanData.downPayment)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Monthly Payment:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedPlanData.monthlyPayment)} × {selectedPlanData.months} months
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>First Payment Due:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount:</span>
                <span className="text-green-600">{formatCurrency(selectedPlanData.totalAmount)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Buyer Protection Included</p>
                <p>Your payment is protected by our escrow service until you confirm receipt of your puppy.</p>
              </div>
            </div>

            <Button
              onClick={() => selectedPlanData && createPaymentPlan(selectedPlanData)}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : `Proceed with ${selectedPlanData.name}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentPlanOptions;
