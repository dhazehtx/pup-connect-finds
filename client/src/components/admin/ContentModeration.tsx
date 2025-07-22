
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Flag, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportedContent {
  id: string;
  type: 'listing' | 'message' | 'profile';
  title: string;
  reporter: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  severity: 'low' | 'medium' | 'high';
}

const ContentModeration = () => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data for demonstration
    const mockReports: ReportedContent[] = [
      {
        id: '1',
        type: 'listing',
        title: 'Golden Retriever Puppy - Suspicious Pricing',
        reporter: 'user@example.com',
        reason: 'Suspicious Activity',
        description: 'Price seems too low for this breed, might be a scam',
        status: 'pending',
        created_at: '2024-01-20',
        severity: 'high'
      },
      {
        id: '2',
        type: 'message',
        title: 'Inappropriate Message Content',
        reporter: 'buyer@example.com',
        reason: 'Inappropriate Content',
        description: 'User sent inappropriate messages during negotiation',
        status: 'pending',
        created_at: '2024-01-19',
        severity: 'medium'
      },
      {
        id: '3',
        type: 'profile',
        title: 'Fake Breeder Credentials',
        reporter: 'concerned@user.com',
        reason: 'False Information',
        description: 'Profile claims credentials that cannot be verified',
        status: 'approved',
        created_at: '2024-01-18',
        severity: 'high'
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    if (filter === 'pending') return report.status === 'pending';
    if (filter === 'resolved') return report.status !== 'pending';
    return true;
  });

  const handleApprove = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'approved' as const } : report
    ));
    toast({
      title: "Report Approved",
      description: "Content has been moderated and action taken.",
    });
  };

  const handleReject = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'rejected' as const } : report
    ));
    toast({
      title: "Report Rejected",
      description: "Report has been reviewed and dismissed.",
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <Flag className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'profile':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending ({reports.filter(r => r.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('resolved')}
            >
              Resolved ({reports.filter(r => r.status !== 'pending').length})
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Reports ({reports.length})
            </Button>
          </div>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getTypeIcon(report.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{report.title}</h3>
                        {getSeverityBadge(report.severity)}
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Reported by: {report.reporter}</span>
                        <span>Reason: {report.reason}</span>
                        <span>Date: {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {report.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(report.id)}
                        className="text-xs bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(report.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports found in this category.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentModeration;
