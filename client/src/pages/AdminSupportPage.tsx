import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MessageCircle,
  Settings,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';

const SUPPORT_CATEGORIES = [
  { value: 'bug_report', label: 'Bug Report', icon: AlertTriangle },
  { value: 'payment_issue', label: 'Payment Issue', icon: XCircle },
  { value: 'rehoming_request', label: 'Rehoming Request', icon: User },
  { value: 'account_issue', label: 'Account Issue', icon: User },
  { value: 'listing_problem', label: 'Listing Problem', icon: MessageSquare },
  { value: 'safety_concern', label: 'Safety Concern', icon: AlertTriangle },
  { value: 'feature_request', label: 'Feature Request', icon: TrendingUp },
  { value: 'other', label: 'Other', icon: MessageSquare }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', icon: XCircle, color: 'bg-gray-100 text-gray-800' }
];

const AdminSupportPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    assigned: 'all',
    search: ''
  });

  // Fetch admin support tickets
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['admin-support-tickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'all' && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest(`/api/support/admin/tickets?${params.toString()}`);
      return response.json();
    },
    enabled: !!user?.is_admin,
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: any }) => {
      return apiRequest(`/api/support/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        body: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({
        title: "Ticket updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update ticket",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Add admin reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ ticketId, message, updateStatus }: { ticketId: string; message: string; updateStatus?: string }) => {
      return apiRequest(`/api/support/admin/tickets/${ticketId}/replies`, {
        method: 'POST',
        body: {
          message,
          updateStatus
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setShowReplyModal(false);
      toast({
        title: "Reply sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send reply",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (ticketId: string, status: string) => {
    updateTicketMutation.mutate({
      ticketId,
      updates: { status }
    });
  };

  const handleAssignTicket = (ticketId: string) => {
    updateTicketMutation.mutate({
      ticketId,
      updates: { assigned_admin_id: user?.id }
    });
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return statusConfig ? statusConfig.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = SUPPORT_CATEGORIES.find(c => c.value === category);
    return categoryConfig ? categoryConfig.icon : MessageSquare;
  };

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need admin privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                Admin Support Center
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and respond to user support tickets
              </p>
            </div>
            
            {ticketsData?.stats && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ticketsData.stats.open}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ticketsData.stats.in_progress}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{ticketsData.stats.resolved}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Resolved</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {SUPPORT_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {PRIORITY_OPTIONS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assignment</Label>
                <Select 
                  value={filters.assigned} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, assigned: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tickets</SelectItem>
                    <SelectItem value="me">Assigned to Me</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading tickets...</span>
          </div>
        ) : ticketsData?.tickets && ticketsData.tickets.length > 0 ? (
          <div className="space-y-4">
            {ticketsData.tickets.map((ticket: any) => {
              const StatusIcon = getStatusIcon(ticket.status);
              const CategoryIcon = getCategoryIcon(ticket.category);
              
              return (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  StatusIcon={StatusIcon}
                  CategoryIcon={CategoryIcon}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onView={() => setSelectedTicket(ticket)}
                  onStatusChange={(status) => handleStatusChange(ticket.id, status)}
                  onAssign={() => handleAssignTicket(ticket.id)}
                  onReply={() => {
                    setSelectedTicket(ticket);
                    setShowReplyModal(true);
                  }}
                />
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No support tickets found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your filters to see more tickets.
            </p>
          </Card>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && !showReplyModal && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onReply={() => setShowReplyModal(true)}
        />
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <ReplyModal
          ticket={selectedTicket}
          isOpen={showReplyModal}
          onClose={() => {
            setShowReplyModal(false);
            setSelectedTicket(null);
          }}
          onSubmit={(message, updateStatus) => 
            addReplyMutation.mutate({ 
              ticketId: selectedTicket.id, 
              message, 
              updateStatus 
            })
          }
          isSubmitting={addReplyMutation.isPending}
        />
      )}
    </div>
  );
};

// Ticket Card Component  
const TicketCard: React.FC<any> = ({
  ticket,
  StatusIcon,
  CategoryIcon,
  getStatusColor,
  getPriorityColor,
  onView,
  onStatusChange,
  onAssign,
  onReply
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <CategoryIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {ticket.subject || `${ticket.category.replace('_', ' ')} Issue`}
              </h3>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {ticket.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{ticket.user_name} ({ticket.user_email})</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              </div>
              {ticket.assigned_admin_name && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Assigned to {ticket.assigned_admin_name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={onReply}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Reply
              </Button>
              {!ticket.assigned_admin_id && (
                <Button size="sm" variant="outline" onClick={onAssign}>
                  <User className="w-4 h-4 mr-2" />
                  Assign to Me
                </Button>
              )}
              <Select onValueChange={onStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(ticket.status)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {ticket.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Ticket Detail Modal Component
const TicketDetailModal: React.FC<any> = ({ ticket, isOpen, onClose, onReply }) => {
  const StatusIcon = STATUS_OPTIONS.find(s => s.value === ticket.status)?.icon || Clock;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${STATUS_OPTIONS.find(s => s.value === ticket.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${PRIORITY_OPTIONS.find(p => p.value === ticket.priority)?.color || 'bg-gray-100 text-gray-800'}`}>
                {ticket.priority}
              </Badge>
            </div>
            <Button onClick={onReply}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">User Information</h4>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={ticket.user_avatar} />
                  <AvatarFallback>{ticket.user_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ticket.user_name}</p>
                  <p className="text-sm text-gray-500">{ticket.user_email}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Ticket Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Category:</span> {ticket.category.replace('_', ' ')}</p>
                <p><span className="font-medium">Created:</span> {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</p>
                {ticket.updated_at && (
                  <p><span className="font-medium">Updated:</span> {formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
          
          {ticket.attachment_url && (
            <div>
              <h4 className="font-medium mb-2">Attachment</h4>
              <a 
                href={ticket.attachment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                View Attachment
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reply Modal Component
const ReplyModal: React.FC<any> = ({ ticket, isOpen, onClose, onSubmit, isSubmitting }) => {
  const [message, setMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSubmit(message, updateStatus || undefined);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to Ticket</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your response..."
              rows={5}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="status">Update Status (optional)</Label>
            <Select value={updateStatus} onValueChange={setUpdateStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Keep current status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSupportPage;