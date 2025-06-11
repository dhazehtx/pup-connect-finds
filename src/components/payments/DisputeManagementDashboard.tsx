
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DisputeDetailsDialog from './DisputeDetailsDialog';
import DisputeResolutionDialog from './DisputeResolutionDialog';

interface DisputeTransaction {
  id: string;
  stripe_payment_intent_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  dispute_reason: string;
  dispute_created_at: string;
  dispute_resolved_at?: string;
  dog_listings?: {
    dog_name: string;
    breed: string;
  } | null;
  buyer_profile?: {
    full_name: string;
    email: string;
  } | null;
  seller_profile?: {
    full_name: string;
    email: string;
  } | null;
}

const DisputeManagementDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<DisputeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeTransaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchDisputes();
  }, [user]);

  const fetchDisputes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('escrow_transactions')
        .select(`
          *,
          dog_listings!listing_id (
            dog_name,
            breed
          ),
          buyer_profile:profiles!buyer_id (
            full_name,
            email
          ),
          seller_profile:profiles!seller_id (
            full_name,
            email
          )
        `)
        .eq('status', 'disputed')
        .order('dispute_created_at', { ascending: false });

      // If not admin, only show user's disputes
      if (user.email !== 'admin@example.com') {
        query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        stripe_payment_intent_id: item.stripe_payment_intent_id,
        listing_id: item.listing_id,
        buyer_id: item.buyer_id,
        seller_id: item.seller_id,
        amount: item.amount,
        status: item.status,
        dispute_reason: item.dispute_reason || '',
        dispute_created_at: item.dispute_created_at || '',
        dispute_resolved_at: item.dispute_resolved_at,
        dog_listings: Array.isArray(item.dog_listings) && item.dog_listings.length > 0 
          ? item.dog_listings[0] 
          : null,
        buyer_profile: Array.isArray(item.buyer_profile) && item.buyer_profile.length > 0 
          ? item.buyer_profile[0] 
          : null,
        seller_profile: Array.isArray(item.seller_profile) && item.seller_profile.length > 0 
          ? item.seller_profile[0] 
          : null,
      }));

      setDisputes(transformedData);
    } catch (error: any) {
      toast({
        title: "Failed to load disputes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisputesByStatus = (status: string) => {
    return disputes.filter(dispute => {
      if (status === 'pending') return !dispute.dispute_resolved_at;
      if (status === 'resolved') return dispute.dispute_resolved_at;
      return true;
    });
  };

  const getStatusBadge = (dispute: DisputeTransaction) => {
    if (dispute.dispute_resolved_at) {
      return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
    }
    return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const getDisputeAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const isUserInvolved = (dispute: DisputeTransaction) => {
    return dispute.buyer_id === user?.id || dispute.seller_id === user?.id;
  };

  const getUserRole = (dispute: DisputeTransaction) => {
    if (dispute.buyer_id === user?.id) return 'buyer';
    if (dispute.seller_id === user?.id) return 'seller';
    return 'admin';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading disputes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={24} />
            Dispute Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {getDisputesByStatus('pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Disputes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getDisputesByStatus('resolved').length}
              </div>
              <div className="text-sm text-gray-600">Resolved Disputes</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {disputes.length}
              </div>
              <div className="text-sm text-gray-600">Total Disputes</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All Disputes</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <DisputesList 
                disputes={getDisputesByStatus('pending')}
                onViewDetails={(dispute) => {
                  setSelectedDispute(dispute);
                  setShowDetails(true);
                }}
                onResolve={(dispute) => {
                  setSelectedDispute(dispute);
                  setShowResolution(true);
                }}
                getUserRole={getUserRole}
                getStatusBadge={getStatusBadge}
                getDisputeAge={getDisputeAge}
                isUserInvolved={isUserInvolved}
              />
            </TabsContent>

            <TabsContent value="resolved">
              <DisputesList 
                disputes={getDisputesByStatus('resolved')}
                onViewDetails={(dispute) => {
                  setSelectedDispute(dispute);
                  setShowDetails(true);
                }}
                onResolve={() => {}}
                getUserRole={getUserRole}
                getStatusBadge={getStatusBadge}
                getDisputeAge={getDisputeAge}
                isUserInvolved={isUserInvolved}
                hideResolveButton={true}
              />
            </TabsContent>

            <TabsContent value="all">
              <DisputesList 
                disputes={disputes}
                onViewDetails={(dispute) => {
                  setSelectedDispute(dispute);
                  setShowDetails(true);
                }}
                onResolve={(dispute) => {
                  setSelectedDispute(dispute);
                  setShowResolution(true);
                }}
                getUserRole={getUserRole}
                getStatusBadge={getStatusBadge}
                getDisputeAge={getDisputeAge}
                isUserInvolved={isUserInvolved}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedDispute && (
        <>
          <DisputeDetailsDialog
            open={showDetails}
            onOpenChange={setShowDetails}
            dispute={selectedDispute}
            userRole={getUserRole(selectedDispute)}
          />
          
          <DisputeResolutionDialog
            open={showResolution}
            onOpenChange={setShowResolution}
            dispute={selectedDispute}
            onResolved={fetchDisputes}
          />
        </>
      )}
    </div>
  );
};

interface DisputesListProps {
  disputes: DisputeTransaction[];
  onViewDetails: (dispute: DisputeTransaction) => void;
  onResolve: (dispute: DisputeTransaction) => void;
  getUserRole: (dispute: DisputeTransaction) => string;
  getStatusBadge: (dispute: DisputeTransaction) => React.ReactNode;
  getDisputeAge: (createdAt: string) => string;
  isUserInvolved: (dispute: DisputeTransaction) => boolean;
  hideResolveButton?: boolean;
}

const DisputesList: React.FC<DisputesListProps> = ({
  disputes,
  onViewDetails,
  onResolve,
  getUserRole,
  getStatusBadge,
  getDisputeAge,
  isUserInvolved,
  hideResolveButton = false
}) => {
  if (disputes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No disputes found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <Card key={dispute.id} className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">
                    {dispute.dog_listings?.dog_name || 'Unknown'} - {dispute.dog_listings?.breed || 'Unknown Breed'}
                  </h3>
                  {getStatusBadge(dispute)}
                  <Badge variant="outline">{getUserRole(dispute)}</Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Amount: ${dispute.amount} • Created: {getDisputeAge(dispute.dispute_created_at)}
                </p>
                
                <p className="text-sm text-gray-800 mb-3">
                  {dispute.dispute_reason}
                </p>
                
                <div className="text-xs text-gray-500">
                  <div>Buyer: {dispute.buyer_profile?.full_name || 'Unknown'}</div>
                  <div>Seller: {dispute.seller_profile?.full_name || 'Unknown'}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(dispute)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                
                {!hideResolveButton && !dispute.dispute_resolved_at && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onResolve(dispute)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DisputeManagementDashboard;
