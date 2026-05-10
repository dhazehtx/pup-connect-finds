import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bug, 
  Search, 
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  TrendingUp,
  Monitor,
  Smartphone,
  Camera
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

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', icon: XCircle, color: 'bg-gray-100 text-gray-800' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const AdminBugsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBug, setSelectedBug] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assigned: 'all',
    search: ''
  });

  // Fetch admin bug reports
  const { data: bugsData, isLoading } = useQuery({
    queryKey: ['admin-bug-reports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== 'all' && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await apiRequest(`/api/bugs/admin/reports?${params.toString()}`);
      return response.json();
    },
    enabled: !!(user as any)?.is_admin,
  });

  // Update bug mutation
  const updateBugMutation = useMutation({
    mutationFn: async ({ bugId, updates }: { bugId: string; updates: any }) => {
      return apiRequest(`/api/bugs/admin/reports/${bugId}`, {
        method: 'PATCH',
        body: updates
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bug-reports'] });
      toast({
        title: "Bug report updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update bug report",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Assign bug mutation
  const assignBugMutation = useMutation({
    mutationFn: async (bugId: string) => {
      return apiRequest(`/api/bugs/admin/reports/${bugId}/assign`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bug-reports'] });
      toast({
        title: "Bug report assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign bug report",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (bugId: string, status: string) => {
    updateBugMutation.mutate({
      bugId,
      updates: { status }
    });
  };

  const handleAssignBug = (bugId: string) => {
    assignBugMutation.mutate(bugId);
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

  if (!(user as any)?.is_admin) {
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
                <Bug className="w-8 h-8 text-red-600" />
                Bug Reports Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and resolve bug reports from users
              </p>
            </div>
            
            {bugsData?.stats && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bugsData.stats.open}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bugsData.stats.in_progress}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{bugsData.stats.critical}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{bugsData.stats.resolved}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="me">Assigned to Me</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Search</Label>
                <Input
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bug Reports List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading bug reports...</span>
          </div>
        ) : bugsData?.reports && bugsData.reports.length > 0 ? (
          <div className="space-y-4">
            {bugsData.reports.map((bug: any) => {
              const StatusIcon = getStatusIcon(bug.status);
              
              return (
                <BugCard
                  key={bug.id}
                  bug={bug}
                  StatusIcon={StatusIcon}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  onView={() => setSelectedBug(bug)}
                  onStatusChange={(status: string) => handleStatusChange(bug.id, status)}
                  onAssign={() => handleAssignBug(bug.id)}
                />
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bug reports found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your filters to see more reports.
            </p>
          </Card>
        )}
      </div>

      {/* Bug Detail Modal */}
      {selectedBug && (
        <BugDetailModal
          bug={selectedBug}
          isOpen={!!selectedBug}
          onClose={() => setSelectedBug(null)}
          onUpdate={(updates: Record<string, unknown>) => {
            updateBugMutation.mutate({ bugId: selectedBug.id, updates });
            setSelectedBug(null);
          }}
        />
      )}
    </div>
  );
};

// Bug Card Component
const BugCard: React.FC<any> = ({
  bug,
  StatusIcon,
  getStatusColor,
  getPriorityColor,
  onView,
  onStatusChange,
  onAssign
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Bug className="w-5 h-5 text-red-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {bug.subject}
              </h3>
              <Badge className={getPriorityColor(bug.priority)}>
                {bug.priority}
              </Badge>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {bug.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{bug.user_name} ({bug.user_email})</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</span>
              </div>
              {bug.screenshot_url && (
                <div className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  <span>Has screenshot</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              {!bug.assigned_admin_id && (
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
          <Badge className={getStatusColor(bug.status)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {bug.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Bug Detail Modal Component
const BugDetailModal: React.FC<any> = ({ bug, isOpen, onClose, onUpdate }) => {
  const [resolution, setResolution] = useState(bug.resolution || '');
  const [adminNotes, setAdminNotes] = useState(bug.admin_notes || '');
  
  const handleUpdate = () => {
    onUpdate({
      resolution,
      admin_notes: adminNotes,
      status: 'resolved',
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bug Report Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${STATUS_OPTIONS.find(s => s.value === bug.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                {bug.status.replace('_', ' ')}
              </Badge>
              <Badge className={`${PRIORITY_OPTIONS.find(p => p.value === bug.priority)?.color || 'bg-gray-100 text-gray-800'}`}>
                {bug.priority}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">User Information</h4>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={bug.user_avatar} />
                  <AvatarFallback>{bug.user_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{bug.user_name}</p>
                  <p className="text-sm text-gray-500">{bug.user_email}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Bug Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Priority:</span> {bug.priority}</p>
                <p><span className="font-medium">Created:</span> {formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</p>
                {bug.updated_at && (
                  <p><span className="font-medium">Updated:</span> {formatDistanceToNow(new Date(bug.updated_at), { addSuffix: true })}</p>
                )}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
              <TabsTrigger value="resolution">Resolution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Bug Description</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{bug.description}</p>
                </div>
              </div>
              
              {bug.steps_to_reproduce && (
                <div>
                  <h4 className="font-medium mb-2">Steps to Reproduce</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{bug.steps_to_reproduce}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bug.expected_behavior && (
                  <div>
                    <h4 className="font-medium mb-2">Expected Behavior</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{bug.expected_behavior}</p>
                    </div>
                  </div>
                )}
                
                {bug.actual_behavior && (
                  <div>
                    <h4 className="font-medium mb-2">Actual Behavior</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{bug.actual_behavior}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="technical">
              <div className="space-y-4">
                {bug.browser_info && (
                  <div>
                    <h4 className="font-medium mb-2">Browser Information</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm font-mono">{bug.browser_info}</p>
                    </div>
                  </div>
                )}
                
                {bug.device_info && (
                  <div>
                    <h4 className="font-medium mb-2">Device Information</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{bug.device_info}</pre>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="screenshot">
              {bug.screenshot_url ? (
                <div>
                  <h4 className="font-medium mb-2">Screenshot</h4>
                  <img 
                    src={bug.screenshot_url} 
                    alt="Bug screenshot" 
                    className="max-w-full rounded-lg border"
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No screenshot provided</p>
              )}
            </TabsContent>
            
            <TabsContent value="resolution" className="space-y-4">
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this bug was resolved..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this bug..."
                  rows={3}
                />
              </div>
              
              <Button onClick={handleUpdate} className="w-full">
                Update & Mark Resolved
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBugsPage;