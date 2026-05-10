import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Plus, 
  Paperclip,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Shield,
  ChevronRight,
  RefreshCw,
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
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';
import { APP_SHELL_CONTAINER_CLASS } from '@/lib/appShell';

const SUPPORT_CATEGORIES = [
  { value: 'bug_report', label: 'Bug Report', icon: AlertCircle },
  { value: 'payment_issue', label: 'Payment Issue', icon: XCircle },
  { value: 'rehoming_request', label: 'Rehoming Request', icon: User },
  { value: 'account_issue', label: 'Account Issue', icon: User },
  { value: 'listing_problem', label: 'Listing Problem', icon: MessageSquare },
  { value: 'safety_concern', label: 'Safety Concern', icon: AlertCircle },
  { value: 'feature_request', label: 'Feature Request', icon: Plus },
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

const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    document.title = 'Support tickets — PAWS';
  }, []);

  const { data: ticketsData, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['support-tickets', statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      return apiRequest(`/api/support/tickets?${params.toString()}`);
    },
    enabled: !!user,
  });

  const tickets = Array.isArray(ticketsData?.tickets) ? ticketsData.tickets : [];

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      return apiRequest('/api/support/tickets', {
        method: 'POST',
        body: ticketData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setShowCreateModal(false);
      toast({
        title: "Support ticket created",
        description: "We'll get back to you as soon as possible.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create ticket",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 pb-24">
        <Card className="w-full max-w-md border-slate-200 p-8 text-center shadow-sm">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-blue-500" />
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Sign in to use support tickets</h2>
          <p className="mb-6 text-sm text-slate-600">
            Track requests and replies in one place. For general questions, anyone can visit the Help Center.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="bg-royal-blue hover:bg-royal-blue/90" onClick={() => navigate('/auth')}>
              Sign in
            </Button>
            <Button variant="outline" asChild>
              <Link to="/help-center">Help Center</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white">
        <div className={`${APP_SHELL_CONTAINER_CLASS} py-8 sm:py-10`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-blue-100">
                <Shield className="h-3.5 w-3.5" />
                PAWS support
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Support tickets</h1>
              <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">
                Create a ticket for account issues, orders, or safety. We prioritize urgent and safety-related
                requests.
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="shrink-0 bg-white text-blue-700 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              New ticket
            </Button>
          </div>
        </div>
      </div>

      <div className={`${APP_SHELL_CONTAINER_CLASS} py-8`}>
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          <Link
            to="/help-center"
            className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-2 hover:underline"
          >
            Help Center
            <ChevronRight className="h-4 w-4" />
          </Link>
          <span className="text-slate-300">·</span>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 font-medium text-blue-600 underline-offset-2 hover:underline"
          >
            Contact form
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 space-y-2">
                <Label className="text-slate-700">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <Label className="text-slate-700">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {SUPPORT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-600">Loading your tickets…</p>
          </div>
        ) : isError ? (
          <Card className="border-red-200 bg-red-50/80 shadow-sm">
            <CardContent className="space-y-4 p-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Couldn&apos;t load tickets</h3>
              <p className="text-sm text-red-800/90">
                {(error as Error)?.message || 'Check your connection and try again.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" className="border-red-200 bg-white" onClick={() => void refetch()}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/contact">Contact page</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket: any) => {
              const StatusIcon = getStatusIcon(ticket.status);
              const CategoryIcon = getCategoryIcon(ticket.category);
              
              return (
                <Card 
                  key={ticket.id} 
                  className="cursor-pointer border-slate-200 shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => setSelectedTicket(ticket)}
                >
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
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
            })}
          </div>
        ) : (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-10 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <MessageSquare className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No tickets yet</h3>
              <p className="mx-auto max-w-md text-sm text-slate-600">
                When something needs follow-up from our team, open a ticket. For quick answers, start with the Help
                Center — it covers orders, safety, and account basics.
              </p>
              <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <Button className="bg-royal-blue hover:bg-royal-blue/90" onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create ticket
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/help-center">Browse Help Center</Link>
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Urgent safety concern? Choose <strong>Safety Concern</strong> when creating a ticket so it routes
                with higher priority.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => createTicketMutation.mutate(data)}
        isSubmitting={createTicketMutation.isPending}
      />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

// Create Ticket Modal Component
const CreateTicketModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    attachment_url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.description) return;
    
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      subject: '',
      description: '',
      priority: 'medium',
      attachment_url: ''
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide detailed information about your issue..."
              rows={5}
              maxLength={2000}
            />
          </div>

          <div>
            <Label htmlFor="attachment">Attachment URL (optional)</Label>
            <Input
              id="attachment"
              type="url"
              value={formData.attachment_url}
              onChange={(e) => setFormData(prev => ({ ...prev, attachment_url: e.target.value }))}
              placeholder="https://example.com/screenshot.png"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.category || !formData.description}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Ticket Detail Modal Component
const TicketDetailModal: React.FC<{
  ticket: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ ticket, isOpen, onClose }) => {
  const StatusIcon = STATUS_OPTIONS.find(s => s.value === ticket.status)?.icon || Clock;
  const CategoryIcon = SUPPORT_CATEGORIES.find(c => c.value === ticket.category)?.icon || MessageSquare;
  const getStatusColor = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'bg-gray-100 text-gray-800';
  };
  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CategoryIcon className="w-5 h-5 text-blue-600" />
            {ticket.subject || `${ticket.category.replace('_', ' ')} Issue`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(ticket.status)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Attachment */}
          {ticket.attachment_url && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Attachment</h4>
              <a
                href={ticket.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Paperclip className="w-4 h-4" />
                View Attachment
              </a>
            </div>
          )}

          {/* Admin Response */}
          {ticket.resolution && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resolution</h4>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {ticket.resolution}
                </p>
                {ticket.resolved_at && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Resolved {formatDistanceToNow(new Date(ticket.resolved_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {ticket.admin_notes && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Admin Notes</h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                  {ticket.admin_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportPage;