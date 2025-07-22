
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Clock, DollarSign, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EscrowPaymentFlowProps {
  listing: any;
  onPaymentComplete?: (escrowId: string) => void;
}

const EscrowPaymentFlow: React.FC<EscrowPaymentFlowProps> = ({ listing, onPaymentComplete }) => {
  const [amount, setAmount] = useState(listing?.price || 0);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const commissionRate = 0.08;
  const commissionAmount = amount * commissionRate;
  const sellerAmount = amount - commissionAmount;

  const handleCreateEscrow = async () => {
    try {
      setLoading(true);

      if (!meetingLocation || !meetingTime) {
        toast({
          title: "Missing Information",
          description: "Please provide meeting location and time",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-escrow-payment', {
        body: {
          listingId: listing.id,
          amount,
          meetingLocation,
          meetingTime: new Date(meetingTime).toISOString()
        }
      });

      if (error) throw error;

      // In a real implementation, you would integrate with Stripe Elements here
      // For now, we'll simulate successful payment setup
      toast({
        title: "Escrow Payment Created",
        description: "Your secure payment has been set up. Complete payment to hold funds safely.",
      });

      if (onPaymentComplete) {
        onPaymentComplete(data.escrowTransactionId);
      }

    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Unable to create escrow payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="text-green-600" size={24} />
          Secure Escrow Payment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your payment is held securely until both parties confirm the transaction
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span>Purchase Amount:</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Platform Fee (8%):</span>
            <span>${commissionAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Seller Receives:</span>
            <span>${sellerAmount.toFixed(2)}</span>
          </div>
          <hr />
          <div className="flex justify-between items-center font-bold">
            <span>Total Payment:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="meetingLocation" className="flex items-center gap-2">
              <MapPin size={16} />
              Meeting Location
            </Label>
            <Input
              id="meetingLocation"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              placeholder="Enter safe public meeting location"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="meetingTime" className="flex items-center gap-2">
              <Calendar size={16} />
              Preferred Meeting Time
            </Label>
            <Input
              id="meetingTime"
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            How Escrow Protects You
          </h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Funds are held securely until both parties confirm</li>
            <li>• Meet in person to verify the puppy before confirming</li>
            <li>• Dispute resolution available if issues arise</li>
            <li>• Full refund if transaction is cancelled</li>
          </ul>
        </div>

        <Button 
          onClick={handleCreateEscrow}
          disabled={loading || !meetingLocation || !meetingTime}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <Clock className="animate-spin mr-2" size={16} />
          ) : (
            <DollarSign className="mr-2" size={16} />
          )}
          {loading ? 'Creating Secure Payment...' : 'Create Escrow Payment'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EscrowPaymentFlow;
