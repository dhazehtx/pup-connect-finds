import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Trash2, Star, Apple, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethod {
  id: string;
  type: string;
  last_four: string;
  brand: string;
  is_default: boolean;
  stripe_payment_method_id: string;
}

interface PaymentMethodManagerProps {
  onMethodSelected?: (method: PaymentMethod) => void;
  showAddNew?: boolean;
}

const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({
  onMethodSelected,
  showAddNew = true
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardDetails, setNewCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const addPaymentMethod = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Simulate Stripe payment method creation
      const mockPaymentMethod = {
        user_id: user.id,
        stripe_payment_method_id: 'pm_' + Math.random().toString(36).substr(2, 9),
        type: 'card',
        last_four: newCardDetails.number.slice(-4),
        brand: 'visa',
        is_default: paymentMethods.length === 0
      };

      const { error } = await supabase
        .from('payment_methods')
        .insert(mockPaymentMethod);

      if (error) throw error;

      toast({
        title: "Payment Method Added",
        description: "Your card has been saved successfully",
      });

      setShowAddForm(false);
      setNewCardDetails({ number: '', expiry: '', cvc: '', name: '' });
      fetchPaymentMethods();

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setDefaultMethod = async (methodId: string) => {
    try {
      // Remove default from all methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Set new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      if (error) throw error;

      toast({
        title: "Default Updated",
        description: "Default payment method updated",
      });

      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update default method",
        variant: "destructive",
      });
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed",
      });

      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return <CreditCard className="h-4 w-4" />;
      case 'mastercard':
        return <CreditCard className="h-4 w-4" />;
      case 'amex':
        return <CreditCard className="h-4 w-4" />;
      case 'apple_pay':
        return <Apple className="h-4 w-4" />;
      case 'google_pay':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Methods</span>
          {showAddNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Payment Methods */}
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
              method.is_default ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => onMethodSelected?.(method)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getCardIcon(method.brand)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {method.brand.toUpperCase()} •••• {method.last_four}
                    </span>
                    {method.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{method.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultMethod(method.id);
                    }}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePaymentMethod(method.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Payment Method Form */}
        {showAddForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Add New Card</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={newCardDetails.number}
                  onChange={(e) => setNewCardDetails(prev => ({
                    ...prev,
                    number: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={newCardDetails.expiry}
                  onChange={(e) => setNewCardDetails(prev => ({
                    ...prev,
                    expiry: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={newCardDetails.cvc}
                  onChange={(e) => setNewCardDetails(prev => ({
                    ...prev,
                    cvc: e.target.value
                  }))}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={newCardDetails.name}
                  onChange={(e) => setNewCardDetails(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addPaymentMethod} disabled={loading}>
                {loading ? 'Adding...' : 'Add Card'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {paymentMethods.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No payment methods</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add a payment method to make purchases
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodManager;
