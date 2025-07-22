
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Star, Lock } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import AddPaymentMethodDialog from './AddPaymentMethodDialog';

const PaymentMethodsManager = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { paymentMethods, loading, removePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-muted-foreground">Manage your saved payment methods</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground mb-6">
              Add a payment method to make secure purchases
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`${method.is_default ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getCardIcon(method.brand || '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">
                          {method.brand} •••• {method.last_four}
                        </span>
                        {method.is_default && (
                          <Badge className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {method.type.replace('_', ' ')}
                      </p>
                    </div>
                    <Lock className="w-4 h-4 text-green-600" />
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultPaymentMethod(method.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPaymentMethodDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default PaymentMethodsManager;
