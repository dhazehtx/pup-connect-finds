import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  Eye,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ProviderApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
  front_image_url?: string;
  back_image_url?: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
  providers: {
    id: string;
    legal_name: string;
    phone: string;
    service_types?: string[];
  };
}

export function ProviderApplicationInbox() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewingApp, setReviewingApp] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedApp, setSelectedApp] = useState<ProviderApplication | null>(null);

  // Fetch applications
  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['/api/provider-applications', activeTab === 'all' ? undefined : activeTab],
  });

  const applications: ProviderApplication[] = (applicationsData as any)?.applications || [];

  // Review application mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ applicationId, action, notes }: { 
      applicationId: string; 
      action: 'approve' | 'reject'; 
      notes?: string;
    }) => {
      const response = await fetch('/api/provider-applications/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action, notes }),
      });
      if (!response.ok) throw new Error('Failed to review application');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider-applications'] });
      setReviewingApp(null);
      setReviewNotes('');
      toast({
        title: 'Application reviewed',
        description: 'The provider application has been reviewed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Review failed',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  const handleReview = (applicationId: string, action: 'approve' | 'reject') => {
    reviewMutation.mutate({
      applicationId,
      action,
      notes: reviewNotes.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  return (
    <div className="space-y-6" data-testid="provider-application-inbox">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Provider Applications</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{applications.length} total</Badge>
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {activeTab === 'all' ? '' : activeTab} applications found.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>{application.providers?.legal_name || 'Provider Application'}</span>
                      </CardTitle>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted {formatDistanceToNow(new Date(application.submitted_at), { addSuffix: true })}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="w-4 h-4" />
                          <span>{application.profiles?.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4" />
                          <span>{application.profiles?.email}</span>
                        </div>
                        {application.providers?.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4" />
                            <span>{application.providers.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {application.providers?.service_types && application.providers.service_types.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Services:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {application.providers.service_types.map((service, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {application.review_notes && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <span className="text-sm font-medium">Review Notes:</span>
                        <p className="text-sm mt-1">{application.review_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApp(application)}
                            data-testid={`view-application-${application.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Provider Application Details</DialogTitle>
                          </DialogHeader>
                          {selectedApp && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Personal Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Name:</strong> {selectedApp.profiles?.full_name}</p>
                                    <p><strong>Email:</strong> {selectedApp.profiles?.email}</p>
                                    <p><strong>Phone:</strong> {selectedApp.providers?.phone}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Business Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Legal Name:</strong> {selectedApp.providers?.legal_name}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedApp.status)}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* ID Documents */}
                              {(selectedApp.front_image_url || selectedApp.back_image_url) && (
                                <div>
                                  <h4 className="font-medium mb-2">ID Documents</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    {selectedApp.front_image_url && (
                                      <div>
                                        <p className="text-sm font-medium mb-1">Front of ID</p>
                                        <img 
                                          src={selectedApp.front_image_url} 
                                          alt="ID Front"
                                          className="w-full h-auto object-contain border rounded bg-gray-50"
                                          data-testid="id-front-image"
                                        />
                                        <a 
                                          href={selectedApp.front_image_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                          View full size
                                        </a>
                                      </div>
                                    )}
                                    {selectedApp.back_image_url && (
                                      <div>
                                        <p className="text-sm font-medium mb-1">Back of ID</p>
                                        <img 
                                          src={selectedApp.back_image_url} 
                                          alt="ID Back"
                                          className="w-full h-auto object-contain border rounded bg-gray-50"
                                          data-testid="id-back-image"
                                        />
                                        <a 
                                          href={selectedApp.back_image_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                          View full size
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReviewingApp(application.id);
                              setReviewNotes('');
                            }}
                            data-testid={`review-application-${application.id}`}
                          >
                            Review
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {reviewingApp && (
        <Dialog open={true} onOpenChange={() => setReviewingApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Review Notes (optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                  className="mt-1"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleReview(reviewingApp, 'approve')}
                  disabled={reviewMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="approve-button"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview(reviewingApp, 'reject')}
                  disabled={reviewMutation.isPending}
                  variant="destructive"
                  data-testid="reject-button"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => setReviewingApp(null)}
                  variant="outline"
                  data-testid="cancel-review-button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}