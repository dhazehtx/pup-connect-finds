import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, MapPin, DollarSign, Shield, Eye, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useNavigate } from 'react-router-dom';

interface ServiceApplication {
  id: string;
  user_id: string;
  service_type: string;
  bio: string;
  price: string;
  availability?: string;
  location?: string;
  verification_status: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface DetailedApplication {
  id: string;
  user_id: string;
  provider_id?: string;
  status: string;
  verification_status: string;
  submitted_at: string;
  bgcheck_consent: boolean;
  bgcheck_status?: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    location?: string;
  };
  provider?: any;
  front_image_url?: string;
  back_image_url?: string;
}

function ServiceProviderApplications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [zoomImage, setZoomImage] = useState<{ url: string; label: string } | null>(null);

  const { data: applicationsData, isLoading } = useQuery<{ data: ServiceApplication[] }>({
    queryKey: ['/api/admin/service-applications'],
  });

  // Extract applications array from the response
  const applications = applicationsData?.data || [];

  // Fetch detailed application data when drawer opens
  const { data: detailedAppResponse, isLoading: loadingDetails } = useQuery<{ ok: boolean; data: DetailedApplication }>({
    queryKey: [`/api/admin/service-applications/${selectedAppId}`],
    enabled: !!selectedAppId,
  });
  
  const detailedApp = detailedAppResponse?.data;

  const reviewApplication = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'verified' | 'rejected'; notes?: string }) => {
      return apiRequest(`/api/admin/service-applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'verified' ? "Application Approved" : "Application Rejected",
        description: `The service provider application has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-applications'] });
      setSelectedAppId(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message || "Failed to review application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const serviceTypeIcons: Record<string, string> = {
    grooming: '✂️',
    walking: '🚶',
    sitting: '🏠',
    training: '🎓',
    boarding: '🏨',
    veterinary: '🏥',
  };

  const serviceTypeLabels: Record<string, string> = {
    grooming: 'Dog Grooming',
    walking: 'Dog Walking',
    sitting: 'Pet Sitting',
    training: 'Dog Training',
    boarding: 'Pet Boarding',
    veterinary: 'Veterinary Care',
  };

  const ApplicationCard = ({ application }: { application: ServiceApplication }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.user.avatar_url} alt={application.user.full_name} />
              <AvatarFallback>
                {application.user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <button 
                onClick={() => {
                  setSelectedAppId(null); // Close drawer if open
                  navigate(`/profile/${application.user.id}`);
                }}
                className="font-semibold text-lg hover:text-primary transition-colors text-left"
                data-testid={`link-profile-${application.user_id}`}
              >
                {application.user.full_name}
              </button>
              <p className="text-sm text-muted-foreground">
                @{application.user.username}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <span>{serviceTypeIcons[application.service_type] || '🐕'}</span>
                <span>{serviceTypeLabels[application.service_type] || application.service_type}</span>
              </div>
            </div>
          </div>

          <Badge 
            variant="outline" 
            className={
              application.verification_status === 'pending' 
                ? 'border-blue-300 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700'
            }
          >
            <Clock className="w-3 h-3 mr-1" />
            {application.verification_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <div>
          <p className="font-medium text-sm mb-1">About their service:</p>
          <p className="text-sm text-muted-foreground">{application.bio}</p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span><strong>${application.price}/hour</strong></span>
          </div>
          
          {application.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{application.location}</span>
            </div>
          )}
        </div>

        {application.availability && (
          <div>
            <p className="font-medium text-sm mb-1">Availability:</p>
            <p className="text-sm text-muted-foreground">{application.availability}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => setSelectedAppId(application.id)}
            variant="outline"
            className="flex-1"
            data-testid={`button-review-${application.id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details & Review
          </Button>
        </div>

        {/* Application Date */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Applied on {new Date(application.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Service Provider Applications</h1>
        </div>
        
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter((app: ServiceApplication) => 
    app.verification_status === 'pending'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Service Provider Applications</h1>
        </div>
        
        <Badge variant="outline" className="text-sm">
          {pendingApplications.length} pending review
        </Badge>
      </div>

      {/* Applications */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Applications ({applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.length > 0 ? (
            <div className="grid gap-6">
              {pendingApplications.map((application: ServiceApplication) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No pending service provider applications to review.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {applications.length > 0 ? (
            <div className="grid gap-6">
              {applications.map((application: ServiceApplication) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground">
                Service provider applications will appear here for review.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Drawer */}
      <Sheet open={!!selectedAppId} onOpenChange={(open) => !open && setSelectedAppId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Review Provider Application</SheetTitle>
            <SheetDescription>
              Review the applicant's information and ID verification documents
            </SheetDescription>
          </SheetHeader>

          {loadingDetails ? (
            <div className="space-y-4 mt-6">
              <div className="h-20 bg-muted rounded animate-pulse" />
              <div className="h-40 bg-muted rounded animate-pulse" />
              <div className="h-40 bg-muted rounded animate-pulse" />
            </div>
          ) : detailedApp ? (
            <div className="space-y-6 mt-6">
              {/* User Info */}
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={detailedApp.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(detailedApp.user?.full_name || detailedApp.user?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {detailedApp.user?.id ? (
                    <button 
                      onClick={() => {
                        setSelectedAppId(null); // Close drawer
                        navigate(`/profile/${detailedApp.user.id}`);
                      }}
                      className="font-semibold text-lg hover:text-primary transition-colors text-left block"
                      data-testid={`link-detailed-profile-${detailedApp.user_id}`}
                    >
                      {detailedApp.user.full_name || detailedApp.user.username}
                    </button>
                  ) : (
                    <p className="font-semibold text-lg">User Information Unavailable</p>
                  )}
                  {detailedApp.user?.username && (
                    <button
                      onClick={() => {
                        setSelectedAppId(null); // Close drawer
                        navigate(`/profile/${detailedApp.user.id}`);
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`link-detailed-username-${detailedApp.user_id}`}
                    >
                      @{detailedApp.user.username}
                    </button>
                  )}
                  {detailedApp.user?.phone && (
                    <p className="text-sm text-muted-foreground mt-1">📞 {detailedApp.user.phone}</p>
                  )}
                  {detailedApp.user?.location && (
                    <p className="text-sm text-muted-foreground">📍 {detailedApp.user.location}</p>
                  )}
                </div>
              </div>

              {/* Provider Info */}
              {detailedApp.provider && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold mb-2">Provider Business Info</h4>
                  <div className="space-y-1 text-sm">
                    {detailedApp.provider.business_name && (
                      <p><strong>Business:</strong> {detailedApp.provider.business_name}</p>
                    )}
                    {detailedApp.provider.service_type && (
                      <p><strong>Service:</strong> {detailedApp.provider.service_type}</p>
                    )}
                    {detailedApp.provider.description && (
                      <p className="mt-2">{detailedApp.provider.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ID Verification Photos */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ID Verification Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedApp.front_image_url ? (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Front of ID</Label>
                      <button
                        onClick={() => setZoomImage({ url: detailedApp.front_image_url!, label: 'Front of ID' })}
                        className="w-full rounded-lg border-2 border-border overflow-hidden hover:border-primary transition-colors group"
                        aria-label="View front of ID"
                        data-testid="button-zoom-front"
                      >
                        <img
                          src={detailedApp.front_image_url}
                          alt="ID Front"
                          className="w-full h-auto cursor-pointer group-hover:opacity-90 transition"
                          data-testid="image-id-front"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No front ID image uploaded</div>
                  )}

                  {detailedApp.back_image_url ? (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Back of ID</Label>
                      <button
                        onClick={() => setZoomImage({ url: detailedApp.back_image_url!, label: 'Back of ID' })}
                        className="w-full rounded-lg border-2 border-border overflow-hidden hover:border-primary transition-colors group"
                        aria-label="View back of ID"
                        data-testid="button-zoom-back"
                      >
                        <img
                          src={detailedApp.back_image_url}
                          alt="ID Back"
                          className="w-full h-auto cursor-pointer group-hover:opacity-90 transition"
                          data-testid="image-id-back"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No back ID image uploaded</div>
                  )}
                </div>
              </div>

              {/* Application Status */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Status</span>
                  <Badge variant="outline">{detailedApp.verification_status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Applied: {new Date(detailedApp.submitted_at).toLocaleString()}</p>
                  {detailedApp.bgcheck_consent && (
                    <p className="text-xs mt-1">✓ Background check consent provided</p>
                  )}
                </div>
              </div>

              {/* Admin Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="review-notes">Admin Review Notes (optional)</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Add any notes about this application review..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  data-testid="textarea-admin-notes"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => reviewApplication.mutate({ 
                    id: detailedApp.id, 
                    status: 'verified',
                    notes: reviewNotes 
                  })}
                  disabled={reviewApplication.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-approve"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  onClick={() => reviewApplication.mutate({ 
                    id: detailedApp.id, 
                    status: 'rejected',
                    notes: reviewNotes 
                  })}
                  disabled={reviewApplication.isPending}
                  variant="destructive"
                  className="flex-1"
                  data-testid="button-reject"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Application details not available
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Image Zoom Modal */}
      <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{zoomImage?.label}</DialogTitle>
          </DialogHeader>
          <div className="relative p-6">
            {zoomImage && (
              <img
                src={zoomImage.url}
                alt={zoomImage.label}
                className="w-full h-auto rounded-lg"
                data-testid="image-zoom-preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServiceProviderApplications;