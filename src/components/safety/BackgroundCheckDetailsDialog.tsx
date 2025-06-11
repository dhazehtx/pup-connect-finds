
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, FileText, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackgroundCheck {
  id: string;
  user_id: string;
  provider: string;
  check_type: string;
  status: string;
  external_id?: string;
  results: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  user_profile?: {
    full_name: string;
    email: string;
    user_type: string;
  };
}

interface BackgroundCheckDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  check: BackgroundCheck;
  isAdmin: boolean;
  onRefresh: () => void;
}

const BackgroundCheckDetailsDialog: React.FC<BackgroundCheckDetailsDialogProps> = ({
  open,
  onOpenChange,
  check,
  isAdmin,
  onRefresh
}) => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'in_progress': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired': return <AlertTriangle className="w-5 h-5 text-gray-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const updateCheckStatus = async (newStatus: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('background_checks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(notes && { results: { ...check.results, admin_notes: notes } })
        })
        .eq('id', check.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Background check status updated to ${newStatus}`,
      });

      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderResults = () => {
    if (!check.results || Object.keys(check.results).length === 0) {
      return <div className="text-gray-500 text-sm">No results available</div>;
    }

    return (
      <div className="space-y-3">
        {Object.entries(check.results).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
            <span className={typeof value === 'boolean' 
              ? (value ? 'text-green-600' : 'text-red-600') 
              : 'text-gray-900'
            }>
              {typeof value === 'boolean' ? (value ? 'Pass' : 'Fail') : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            Background Check Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h3 className="font-semibold capitalize">
                      {check.check_type.replace('_', ' ')} Check
                    </h3>
                    <p className="text-sm text-gray-600">ID: {check.id}</p>
                  </div>
                </div>
                <Badge className={
                  check.status === 'completed' ? 'bg-green-100 text-green-800' :
                  check.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  check.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  check.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {check.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Provider:</span>
                  <p className="text-gray-600 capitalize">{check.provider}</p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-gray-600">{new Date(check.created_at).toLocaleString()}</p>
                </div>
                {check.external_id && (
                  <div>
                    <span className="font-medium">External ID:</span>
                    <p className="text-gray-600">{check.external_id}</p>
                  </div>
                )}
                {check.expires_at && (
                  <div>
                    <span className="font-medium">Expires:</span>
                    <p className="text-gray-600">{new Date(check.expires_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info (Admin Only) */}
          {isAdmin && check.user_profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-gray-600">{check.user_profile.full_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-600">{check.user_profile.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">User Type:</span>
                    <p className="text-gray-600 capitalize">{check.user_profile.user_type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              {renderResults()}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {isAdmin && check.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Notes:</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this background check..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateCheckStatus('completed')}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateCheckStatus('failed')}
                    disabled={updating}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateCheckStatus('in_progress')}
                    disabled={updating}
                    variant="outline"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Mark In Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundCheckDetailsDialog;
