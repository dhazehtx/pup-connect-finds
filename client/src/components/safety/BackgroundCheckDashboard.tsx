
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle, FileText, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BackgroundCheckDetailsDialog from './BackgroundCheckDetailsDialog';
import BackgroundCheckRequestDialog from './BackgroundCheckRequestDialog';

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

const BackgroundCheckDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [activeTab, setActiveTab] = useState('my-checks');

  useEffect(() => {
    fetchBackgroundChecks();
  }, [user]);

  const fetchBackgroundChecks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('background_checks')
        .select(`
          *,
          user_profile:profiles!background_checks_user_id_fkey (
            full_name,
            email,
            user_type
          )
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show user's own checks
      if (user.email !== 'admin@example.com') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setChecks(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load background checks",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Shield className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getChecksByStatus = (status: string) => {
    return checks.filter(check => check.status === status);
  };

  const isAdmin = user?.email === 'admin@example.com';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading background checks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="text-blue-600" size={24} />
              Background Checks
            </CardTitle>
            {!isAdmin && (
              <Button onClick={() => setShowRequest(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Request Check
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {getChecksByStatus('completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {getChecksByStatus('pending').length + getChecksByStatus('in_progress').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {getChecksByStatus('failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {checks.length}
              </div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-checks">
                {isAdmin ? 'All Checks' : 'My Checks'}
              </TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="my-checks">
              <BackgroundChecksList 
                checks={checks}
                onViewDetails={(check) => {
                  setSelectedCheck(check);
                  setShowDetails(true);
                }}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="pending">
              <BackgroundChecksList 
                checks={getChecksByStatus('pending').concat(getChecksByStatus('in_progress'))}
                onViewDetails={(check) => {
                  setSelectedCheck(check);
                  setShowDetails(true);
                }}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="completed">
              <BackgroundChecksList 
                checks={getChecksByStatus('completed')}
                onViewDetails={(check) => {
                  setSelectedCheck(check);
                  setShowDetails(true);
                }}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="failed">
              <BackgroundChecksList 
                checks={getChecksByStatus('failed')}
                onViewDetails={(check) => {
                  setSelectedCheck(check);
                  setShowDetails(true);
                }}
                isAdmin={isAdmin}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedCheck && (
        <BackgroundCheckDetailsDialog
          open={showDetails}
          onOpenChange={setShowDetails}
          check={selectedCheck}
          isAdmin={isAdmin}
          onRefresh={fetchBackgroundChecks}
        />
      )}

      <BackgroundCheckRequestDialog
        open={showRequest}
        onOpenChange={setShowRequest}
        onSuccess={fetchBackgroundChecks}
      />
    </div>
  );
};

interface BackgroundChecksListProps {
  checks: BackgroundCheck[];
  onViewDetails: (check: BackgroundCheck) => void;
  isAdmin: boolean;
}

const BackgroundChecksList: React.FC<BackgroundChecksListProps> = ({
  checks,
  onViewDetails,
  isAdmin
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Shield className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (checks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No background checks found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <Card key={check.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold capitalize">
                    {check.check_type.replace('_', ' ')} Check
                  </h3>
                  <Badge className={getStatusColor(check.status)}>
                    {getStatusIcon(check.status)}
                    <span className="ml-1 capitalize">{check.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge variant="outline">{check.provider}</Badge>
                </div>
                
                {isAdmin && check.user_profile && (
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {check.user_profile.full_name} ({check.user_profile.email})
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {check.user_profile.user_type}
                    </Badge>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <div>Created: {new Date(check.created_at).toLocaleDateString()}</div>
                  {check.expires_at && (
                    <div>Expires: {new Date(check.expires_at).toLocaleDateString()}</div>
                  )}
                  {check.external_id && (
                    <div>Reference: {check.external_id}</div>
                  )}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(check)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BackgroundCheckDashboard;
