
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  MessageSquare,
  Flag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TrustSafetyTools = () => {
  const [safetyMetrics] = useState({
    totalReports: 145,
    pendingReviews: 23,
    resolvedToday: 12,
    suspendedUsers: 8,
    verificationRequests: 34,
    fraudAttempts: 3
  });

  const [activeIncidents, setActiveIncidents] = useState([
    {
      id: '1',
      type: 'fraud_attempt',
      severity: 'high',
      description: 'Suspicious payment pattern detected',
      user: 'user_12345',
      timestamp: '2024-01-20T14:30:00Z',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'harassment',
      severity: 'medium',
      description: 'Multiple reports of inappropriate messaging',
      user: 'user_67890',
      timestamp: '2024-01-20T13:15:00Z',
      status: 'pending'
    },
    {
      id: '3',
      type: 'fake_listing',
      severity: 'high',
      description: 'Listing using stolen photos',
      user: 'user_54321',
      timestamp: '2024-01-20T12:00:00Z',
      status: 'investigating'
    }
  ]);

  const [riskScores] = useState([
    { user: 'user_12345', score: 85, factors: ['Multiple failed payments', 'New account'] },
    { user: 'user_67890', score: 72, factors: ['Rapid messaging', 'Negative feedback'] },
    { user: 'user_54321', score: 91, factors: ['Duplicate photos', 'Unrealistic pricing'] },
    { user: 'user_98765', score: 68, factors: ['VPN usage', 'Incomplete profile'] }
  ]);

  const { toast } = useToast();

  const handleIncidentAction = (incidentId: string, action: string) => {
    setActiveIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: action === 'resolve' ? 'resolved' : 'investigating' }
        : incident
    ));
    
    toast({
      title: `Incident ${action === 'resolve' ? 'Resolved' : 'Updated'}`,
      description: `Incident ${incidentId} has been ${action === 'resolve' ? 'resolved' : 'updated'}.`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'investigating': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Safety Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{safetyMetrics.totalReports}</p>
              </div>
              <Flag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold">{safetyMetrics.pendingReviews}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold">{safetyMetrics.resolvedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended Users</p>
                <p className="text-2xl font-bold">{safetyMetrics.suspendedUsers}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verification Requests</p>
                <p className="text-2xl font-bold">{safetyMetrics.verificationRequests}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fraud Attempts</p>
                <p className="text-2xl font-bold">{safetyMetrics.fraudAttempts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIncidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">#{incident.id}</span>
                        </div>
                        <h4 className="font-medium mb-1">{incident.description}</h4>
                        <p className="text-sm text-gray-600">
                          User: {incident.user} | {new Date(incident.timestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIncidentAction(incident.id, 'investigate')}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleIncidentAction(incident.id, 'resolve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskScores.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{user.user}</span>
                        <Badge className={getRiskColor(user.score)}>
                          Risk: {user.score}%
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.factors.map((factor, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                      {user.score >= 80 && (
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Ban className="w-3 h-3 mr-1" />
                          Restrict
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Fraud Pattern Detected</p>
                      <p className="text-xs text-gray-600">Multiple failed payment attempts</p>
                    </div>
                    <span className="text-xs text-gray-500">2m ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Spam Messages</p>
                      <p className="text-xs text-gray-600">Bulk messaging detected</p>
                    </div>
                    <span className="text-xs text-gray-500">5m ago</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Unusual Account Activity</p>
                      <p className="text-xs text-gray-600">Multiple accounts from same IP</p>
                    </div>
                    <span className="text-xs text-gray-500">8m ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fraud Detection AI</span>
                      <span className="text-green-600">99.2% Uptime</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Content Scanning</span>
                      <span className="text-green-600">98.7% Uptime</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Verification</span>
                      <span className="text-yellow-600">95.1% Uptime</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Prevention Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Auto-flag suspicious pricing</p>
                      <p className="text-sm text-gray-600">Flag listings 50% below market rate</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Rate limit messaging</p>
                      <p className="text-sm text-gray-600">Max 10 messages per hour for new users</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Image verification</p>
                      <p className="text-sm text-gray-600">Check for duplicate/stolen photos</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Run Security Scan
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Safety Report
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Bulk User Review
                  </Button>
                  
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Lockdown
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrustSafetyTools;
