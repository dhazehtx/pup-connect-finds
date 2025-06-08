
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentIntegrationProps {
  listingId: string;
  price: number;
  sellerName: string;
  dogName: string;
  onPaymentSuccess?: () => void;
}

const PaymentIntegration = ({ 
  listingId, 
  price, 
  sellerName, 
  dogName, 
  onPaymentSuccess 
}: PaymentIntegrationProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'escrow'>('stripe');
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: `Your payment of $${price} for ${dogName} has been processed.`,
      });
      
      onPaymentSuccess?.();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEscrowPayment = async () => {
    setLoading(true);
    try {
      // Simulate escrow setup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Escrow Payment Initiated",
        description: "Your payment is being held securely until the transaction is complete.",
      });
      
      onPaymentSuccess?.();
    } catch (error) {
      toast({
        title: "Escrow Setup Failed",
        description: "There was an issue setting up the escrow payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Purchase Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{dogName}</span>
            <Badge variant="outline">${price}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            Seller: {sellerName}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Payment Method</label>
          <div className="space-y-2">
            <Button
              variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('stripe')}
              className="w-full justify-start"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Credit/Debit Card (Stripe)
            </Button>
            
            <Button
              variant={paymentMethod === 'escrow' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('escrow')}
              className="w-full justify-start"
            >
              <Shield className="w-4 h-4 mr-2" />
              Escrow Protection
            </Button>
          </div>
        </div>

        {/* Payment Form */}
        {paymentMethod === 'stripe' && (
          <div className="space-y-3">
            <Input placeholder="Card Number" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="MM/YY" />
              <Input placeholder="CVV" />
            </div>
            <Input placeholder="Cardholder Name" />
          </div>
        )}

        {/* Payment Actions */}
        <div className="space-y-2">
          {paymentMethod === 'escrow' ? (
            <Button 
              onClick={handleEscrowPayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up Escrow...' : `Pay $${price} with Escrow`}
            </Button>
          ) : (
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : `Pay $${price}`}
            </Button>
          )}
          
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Secure 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t pt-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              <span>Buyer protection included</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentIntegration;
