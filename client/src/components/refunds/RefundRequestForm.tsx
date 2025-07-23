import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const refundRequestSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required'),
  reason: z.enum([
    'canceled_order',
    'scam_listing', 
    'dispute_resolved',
    'service_not_delivered',
    'item_not_as_described',
    'duplicate_payment',
    'other'
  ]),
  detailed_reason: z.string().min(10, 'Please provide a detailed explanation (minimum 10 characters)'),
  refund_amount: z.number().min(0.01, 'Refund amount must be greater than 0')
});

type RefundRequestFormData = z.infer<typeof refundRequestSchema>;

interface RefundRequestFormProps {
  transactionId?: string;
  transactionAmount?: number;
  onSuccess?: (refundRequestId: string) => void;
  onCancel?: () => void;
}

const reasonLabels = {
  canceled_order: 'Order was canceled',
  scam_listing: 'Fraudulent or scam listing',
  dispute_resolved: 'Dispute resolved in my favor',
  service_not_delivered: 'Service was not delivered',
  item_not_as_described: 'Item not as described',
  duplicate_payment: 'Duplicate payment made',
  other: 'Other reason'
};

const reasonDescriptions = {
  canceled_order: 'The seller canceled the order or it was mutually canceled',
  scam_listing: 'The listing was fraudulent or a scam',
  dispute_resolved: 'A formal dispute was resolved in your favor',
  service_not_delivered: 'The paid service was never provided',
  item_not_as_described: 'The item received differs significantly from the listing',
  duplicate_payment: 'The same transaction was charged multiple times',
  other: 'Please explain your specific situation in detail'
};

export const RefundRequestForm: React.FC<RefundRequestFormProps> = ({
  transactionId,
  transactionAmount,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RefundRequestFormData>({
    resolver: zodResolver(refundRequestSchema),
    defaultValues: {
      transaction_id: transactionId || '',
      reason: undefined,
      detailed_reason: '',
      refund_amount: transactionAmount || 0
    }
  });

  const createRefundMutation = useMutation({
    mutationFn: async (data: RefundRequestFormData) => {
      const response = await fetch('/api/refunds/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create refund request');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Refund Request Submitted",
        description: "Your refund request has been submitted successfully and is being reviewed.",
      });
      
      // Invalidate refund queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/refunds/user'] });
      
      if (onSuccess) {
        onSuccess(data.refund_request_id);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Refund Request Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: RefundRequestFormData) => {
    createRefundMutation.mutate(data);
  };

  const selectedReason = form.watch('reason');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Request Refund
        </CardTitle>
        <CardDescription>
          Submit a refund request for your transaction. All requests are reviewed within 1-3 business days.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction ID */}
            <FormField
              control={form.control}
              name="transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter transaction ID" 
                      {...field}
                      disabled={!!transactionId}
                    />
                  </FormControl>
                  <FormDescription>
                    The ID of the transaction you want to refund
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Refund Amount */}
            <FormField
              control={form.control}
              name="refund_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Amount ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {transactionAmount && (
                      <>Maximum refundable amount: ${transactionAmount.toFixed(2)}</>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Refund Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Refund</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(reasonLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedReason && (
                    <FormDescription className="text-sm text-gray-600">
                      {reasonDescriptions[selectedReason]}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Explanation */}
            <FormField
              control={form.control}
              name="detailed_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Explanation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide a detailed explanation of why you're requesting this refund..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide as much detail as possible to help us process your request quickly
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Processing Time Notice */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Processing Time:</strong> Refund requests are typically reviewed within 1-3 business days. 
                Some requests may be auto-approved for faster processing. You'll receive email notifications about status updates.
              </AlertDescription>
            </Alert>

            {/* Auto-approval Notice */}
            {selectedReason && ['canceled_order', 'dispute_resolved'].includes(selectedReason) && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Fast Track:</strong> This type of refund request may be automatically approved 
                  for faster processing if it meets our auto-approval criteria.
                </AlertDescription>
              </Alert>
            )}

            {/* Warning for Scam Reports */}
            {selectedReason === 'scam_listing' && (
              <Alert>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Important:</strong> Scam reports require thorough investigation. Please provide 
                  detailed evidence and documentation to support your claim. False reports may result in account restrictions.
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={createRefundMutation.isPending}
                className="flex-1"
              >
                {createRefundMutation.isPending ? 'Submitting...' : 'Submit Refund Request'}
              </Button>
              
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={createRefundMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};