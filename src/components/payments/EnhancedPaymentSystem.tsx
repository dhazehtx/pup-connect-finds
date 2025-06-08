
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Shield, DollarSign, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PaymentIntegration from './PaymentIntegration';

interface EnhancedPaymentSystemProps {
  listingId: string;
  price: number;
  sellerName: string;
  dogName: string;
  onPaymentSuccess?: () => void;
}

const EnhancedPaymentSystem = ({ 
  listingId, 
  price, 
  sellerName, 
  dogName, 
  onPaymentSuccess 
}: EnhancedPaymentSystemProps) => {
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'confirmation'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'instant' | 'escrow' | 'financing'>('instant');
  const { toast } = useToast();

  const paymentMethods = [
    {
      id: 'instant',
      name: 'Instant Payment',
      description: 'Pay now with credit/debit card',
      icon: CreditCard,
      processingFee: price * 0.029,
      recommended: false
    },
    {
      id: 'escrow',
      name: 'Escrow Protection',
      description: 'Secure payment held until delivery',
      icon: Shield,
      processingFee: price * 0.035,
      recommended: true
    },
    {
      id: 'financing',
      name: 'Payment Plan',
      description: 'Split into 3-6 monthly payments',
      icon: DollarSign,
      processingFee: price * 0.05,
      recommended: false
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId as any);
    setPaymentStep('details');
  };

  const handlePaymentSubmit = () => {
    setPaymentStep('confirmation');
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: `Your ${selectedMethod} payment for ${dogName} has been processed.`,
      });
      onPaymentSuccess?.();
    }, 2000);
  };

  if (paymentStep === 'confirmation') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Payment Confirmed!</h3>
          <p className="text-gray-600 mb-4">
            Your payment for {dogName} has been successfully processed.
          </p>
          <Badge className="mb-4">Transaction ID: {listingId.slice(0, 8).toUpperCase()}</Badge>
          <div className="space-y-2">
            <Button className="w-full">View Transaction Details</Button>
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'details') {
    return (
      <PaymentIntegration
        listingId={listingId}
        price={price}
        sellerName={sellerName}
        dogName={dogName}
        onPaymentSuccess={handlePaymentSubmit}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Choose Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Purchase Summary */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg">{dogName}</span>
            <Badge variant="outline" className="text-lg">${price}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            Seller: {sellerName}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const total = price + method.processingFee;
            
            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  method.recommended ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.recommended && (
                            <Badge variant="secondary">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        +${method.processingFee.toFixed(2)} fee
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Shield className="w-4 h-4" />
            <span>All payments are secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPaymentSystem;
