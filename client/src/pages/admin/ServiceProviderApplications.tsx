import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, MapPin, DollarSign, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
    email: string;
    avatar_url?: string;
  };
}

function ServiceProviderApplications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applicationsData, isLoading } = useQuery<{ data: ServiceApplication[] }>({
    queryKey: ['/api/admin/service-applications'],
  });

  // Extract applications array from the response
  const applications = applicationsData?.data || [];

  const reviewApplication = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'verified' | 'rejected' }) => {
      return apiRequest(`/api/admin/service-applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: status === 'verified' ? "Application Approved" : "Application Rejected",
        description: `The service provider application has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-applications'] });
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
              <h3 className="font-semibold text-lg">
                {application.user.full_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{application.user.username} • {application.user.email}
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
            onClick={() => reviewApplication.mutate({ id: application.id, status: 'verified' })}
            disabled={reviewApplication.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          
          <Button
            onClick={() => reviewApplication.mutate({ id: application.id, status: 'rejected' })}
            disabled={reviewApplication.isPending}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
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
    </div>
  );
}

export default ServiceProviderApplications;