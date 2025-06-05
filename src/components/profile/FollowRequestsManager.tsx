
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterUsername: string;
  requesterAvatar?: string;
  requesterVerified: boolean;
  requestedAt: string;
}

interface FollowRequestsManagerProps {
  requests: FollowRequest[];
  onRequestAction: (requestId: string, action: 'approve' | 'decline') => void;
}

const FollowRequestsManager = ({ requests, onRequestAction }: FollowRequestsManagerProps) => {
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleRequestAction = async (requestId: string, action: 'approve' | 'decline') => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await onRequestAction(requestId, action);
      
      toast({
        title: action === 'approve' ? "Request approved" : "Request declined",
        description: action === 'approve' 
          ? "The user can now follow you and see your content."
          : "The follow request has been declined.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Follow Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No pending follow requests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          Follow Requests
          <Badge variant="secondary" className="ml-2">
            {requests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.requesterAvatar} />
                <AvatarFallback>
                  {request.requesterName?.charAt(0) || request.requesterUsername?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{request.requesterName || request.requesterUsername}</span>
                  {request.requesterVerified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">@{request.requesterUsername}</p>
                <p className="text-xs text-gray-500">
                  Requested {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRequestAction(request.id, 'decline')}
                disabled={processingRequests.has(request.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <UserX size={16} />
              </Button>
              <Button
                size="sm"
                onClick={() => handleRequestAction(request.id, 'approve')}
                disabled={processingRequests.has(request.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <UserCheck size={16} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default FollowRequestsManager;
