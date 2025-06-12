
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface FollowRequestItemProps {
  request: {
    id: string;
    requesterId: string;
    requesterName: string;
    requesterUsername: string;
    requesterAvatar?: string;
    requesterVerified: boolean;
    requestedAt: string;
  };
  onAction: (requestId: string, action: 'approve' | 'decline') => void;
  isProcessing?: boolean;
}

const FollowRequestItem = ({ request, onAction, isProcessing = false }: FollowRequestItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={request.requesterAvatar} />
          <AvatarFallback>
            {request.requesterName?.charAt(0) || request.requesterUsername?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-deep-navy">{request.requesterName || request.requesterUsername}</span>
            {request.requesterVerified && (
              <Badge variant="secondary" className="text-xs bg-royal-blue text-white">
                ✓
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">@{request.requesterUsername}</p>
          <p className="text-xs text-gray-500">
            wants to follow you • {new Date(request.requestedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAction(request.id, 'decline')}
          disabled={isProcessing}
          className="text-gray-600 border-gray-200 hover:bg-gray-50 px-4"
        >
          Delete
        </Button>
        <Button
          size="sm"
          onClick={() => onAction(request.id, 'approve')}
          disabled={isProcessing}
          className="bg-royal-blue hover:bg-royal-blue/90 text-white px-4"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default FollowRequestItem;
