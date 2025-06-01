
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Mail, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GuestCheckoutProps {
  onComplete?: (guestInfo: any) => void;
  listingPrice?: number;
}

const GuestCheckout: React.FC<GuestCheckoutProps> = ({ onComplete, listingPrice }) => {
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    confirmEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createGuestUser = async () => {
    try {
      setLoading(true);

      if (guestInfo.email !== guestInfo.confirmEmail) {
        toast({
          title: "Email Mismatch",
          description: "Please ensure both email addresses match",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('guest_users')
        .insert({
          full_name: guestInfo.fullName,
          email: guestInfo.email,
          phone: guestInfo.phone
        })
        .select()
        .single();

      if (error) throw error;

      // Store guest info in localStorage for the session
      localStorage.setItem('guest_user', JSON.stringify(data));
      localStorage.setItem('guest_checkout', 'true');

      toast({
        title: "Guest Account Created",
        description: "You can now proceed with your purchase",
      });

      onComplete?.(data);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create guest account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Guest Checkout
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">No account required</Badge>
          <Badge variant="outline">Limited features</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Guest Checkout Benefits</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Quick purchase without account creation</li>
            <li>• Same buyer protection and escrow services</li>
            <li>• Email updates on your purchase</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                placeholder="John Doe"
                value={guestInfo.fullName}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, fullName: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="confirmEmail">Confirm Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmEmail"
                type="email"
                placeholder="john@example.com"
                value={guestInfo.confirmEmail}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, confirmEmail: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span>Purchase Total:</span>
            <span className="font-semibold text-lg">
              {listingPrice ? `$${listingPrice.toLocaleString()}` : 'TBD'}
            </span>
          </div>
          
          <Button
            onClick={createGuestUser}
            disabled={loading || !guestInfo.fullName || !guestInfo.email || !guestInfo.confirmEmail}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Continue as Guest'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Want full features? <Button variant="link" className="p-0 h-auto">Create an account</Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestCheckout;
