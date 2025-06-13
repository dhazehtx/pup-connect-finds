
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PaymentMethod } from '@/types/payment';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPaymentMethods = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const addPaymentMethod = useCallback(async (stripePaymentMethodId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-method', {
        body: {
          payment_method_id: stripePaymentMethodId,
          user_id: user.id
        }
      });

      if (error) throw error;

      await loadPaymentMethods();
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
      return null;
    }
  }, [user, loadPaymentMethods, toast]);

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      toast({
        title: "Success",
        description: "Payment method removed successfully",
      });
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    if (!user) return;

    try {
      // First, unset all default flags
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadPaymentMethods();
      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  }, [user, loadPaymentMethods, toast]);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user, loadPaymentMethods]);

  return {
    paymentMethods,
    loading,
    loadPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
  };
};
