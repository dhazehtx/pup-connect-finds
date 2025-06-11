
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, FileText, User, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackgroundCheckRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BackgroundCheckRequestDialog: React.FC<BackgroundCheckRequestDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkType, setCheckType] = useState('identity');
  const [provider, setProvider] = useState('internal');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checkTypes = [
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify your identity with government-issued ID',
      icon: User,
      price: 'Free'
    },
    {
      id: 'criminal',
      title: 'Criminal Background Check',
      description: 'Comprehensive criminal history check',
      icon: Shield,
      price: '$15'
    },
    {
      id: 'employment',
      title: 'Employment Verification',
      description: 'Verify employment history and references',
      icon: FileText,
      price: '$25'
    },
    {
      id: 'credit',
      title: 'Credit Check',
      description: 'Basic credit history verification',
      icon: CreditCard,
      price: '$10'
    }
  ];

  const providers = [
    { id: 'internal', name: 'Internal Review', description: 'Manual review by our team' },
    { id: 'checkr', name: 'Checkr', description: 'Professional background check service' },
    { id: 'sterling', name: 'Sterling', description: 'Enterprise background screening' }
  ];

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('background_checks')
        .insert({
          user_id: user.id,
          provider,
          check_type: checkType,
          status: 'pending',
          results: {
            notes,
            requested_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Background check request submitted successfully",
      });

      onSuccess();
      onOpenChange(false);
      setCheckType('identity');
      setProvider('internal');
      setNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCheckType = checkTypes.find(type => type.id === checkType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            Request Background Check
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Check Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Check Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={checkType} onValueChange={setCheckType}>
                <div className="space-y-3">
                  {checkTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          checkType === type.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCheckType(type.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={type.id} id={type.id} />
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <Label htmlFor={type.id} className="font-medium cursor-pointer">
                                {type.title}
                              </Label>
                              <span className="text-sm font-medium text-green-600">
                                {type.price}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={provider} onValueChange={setProvider}>
                <div className="space-y-3">
                  {providers.map((prov) => (
                    <div
                      key={prov.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        provider === prov.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setProvider(prov.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={prov.id} id={prov.id} />
                        <div>
                          <Label htmlFor={prov.id} className="font-medium cursor-pointer">
                            {prov.name}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {prov.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information about your request..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary & Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Request Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Check Type:</span>
                  <span>{selectedCheckType?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Provider:</span>
                  <span>{providers.find(p => p.id === provider)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="text-green-600 font-medium">
                    {selectedCheckType?.price}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundCheckRequestDialog;
