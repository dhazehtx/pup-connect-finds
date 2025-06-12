
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import FollowRequestItem from '@/components/notifications/FollowRequestItem';

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
        title: action === 'approve' ? "Follow request confirmed" : "Follow request deleted",
        description: action === 'approve' 
          ? "They can now see your posts and stories."
          : "The follow request has been removed.",
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
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-deep-navy font-semibold text-base">Follow Requests</h3>
        <span className="text-sm text-gray-600">{requests.length}</span>
      </div>
      
      <div className="space-y-3">
        {requests.map((request) => (
          <FollowRequestItem
            key={request.id}
            request={request}
            onAction={handleRequestAction}
            isProcessing={processingRequests.has(request.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FollowRequestsManager;
