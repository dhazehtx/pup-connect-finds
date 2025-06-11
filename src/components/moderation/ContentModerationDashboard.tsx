
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Flag,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModerationItem {
  id: string;
  type: 'listing' | 'message' | 'profile' | 'review';
  content: string;
  reportReason: string;
  reportedBy: string;
  targetUser: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  metadata?: any;
}

const ContentModerationDashboard = () => {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    const mockItems: ModerationItem[] = [
      {
        id: '1',
        type: 'listing',
        content: 'Beautiful Golden Retriever puppies for sale. Health guaranteed!',
        reportReason: 'Suspected puppy mill',
        reportedBy: 'user123',
        targetUser: 'breeder456',
        status: 'pending',
        severity: 'high',
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        type: 'message',
        content: 'This message contains inappropriate language...',
        reportReason: 'Harassment',
        reportedBy: 'user789',
        targetUser: 'user456',
        status: 'pending',
        severity: 'medium',
        createdAt: '2024-01-20T09:15:00Z'
      },
      {
        id: '3',
        type: 'profile',
        content: 'Professional dog breeder with 20+ years experience',
        reportReason: 'Fake credentials',
        reportedBy: 'user321',
        targetUser: 'breeder789',
        status: 'flagged',
        severity: 'low',
        createdAt: '2024-01-19T16:45:00Z'
      }
    ];

    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject' | 'flag', notes?: string) => {
    try {
      // In real app, this would call your moderation API
      setItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
          : item
      ));

      toast({
        title: "Action Completed",
        description: `Item has been ${action}d successfully`,
      });

      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to process moderation action",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flagged': return <Flag className="w-4 h-4 text-orange-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing': return <Eye className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'profile': return <User className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredItems = items.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p className="text-gray-600">Review and moderate reported content</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Items</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-gray-600">No items require moderation at this time.</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-colors ${
                  selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            <span className="text-sm capitalize">{item.status}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-medium mb-1">
                          Reported for: {item.reportReason}
                        </h3>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {item.content}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Reported by: {item.reportedBy}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedItem.type)}
                  Moderation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded border">
                    {selectedItem.content}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Report Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span>{selectedItem.reportReason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <Badge className={getSeverityColor(selectedItem.severity)}>
                        {selectedItem.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reported by:</span>
                      <span>{selectedItem.reportedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target user:</span>
                      <span>{selectedItem.targetUser}</span>
                    </div>
                  </div>
                </div>

                {selectedItem.status === 'pending' && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Moderation Actions</h4>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleModerationAction(selectedItem.id, 'approve')}
                        className="w-full"
                        variant="default"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      
                      <Button
                        onClick={() => handleModerationAction(selectedItem.id, 'flag')}
                        className="w-full"
                        variant="outline"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Flag for Review
                      </Button>
                      
                      <Button
                        onClick={() => handleModerationAction(selectedItem.id, 'reject')}
                        className="w-full"
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Notes (optional)</label>
                      <Textarea
                        placeholder="Add moderation notes..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {selectedItem.status !== 'pending' && (
                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600">
                      This item has been {selectedItem.status}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Item</h3>
                <p className="text-gray-600">
                  Choose an item from the list to review and moderate.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentModerationDashboard;
