
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle, Rocket } from 'lucide-react';

interface TestItem {
  id: string;
  category: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  priority: 'high' | 'medium' | 'low';
}

const LaunchTestingChecklist = () => {
  const [testItems, setTestItems] = useState<TestItem[]>([
    // Core Messaging
    { id: '1', category: 'Messaging', description: 'Send message between users', status: 'pending', priority: 'high' },
    { id: '2', category: 'Messaging', description: 'Receive real-time message notifications', status: 'pending', priority: 'high' },
    { id: '3', category: 'Messaging', description: 'Message history loads correctly', status: 'pending', priority: 'high' },
    { id: '4', category: 'Messaging', description: 'Mobile messaging interface works', status: 'pending', priority: 'high' },
    
    // Location Features
    { id: '5', category: 'Location', description: 'Location search returns results', status: 'pending', priority: 'high' },
    { id: '6', category: 'Location', description: 'Radius filtering works correctly', status: 'pending', priority: 'medium' },
    { id: '7', category: 'Location', description: 'Current location detection works', status: 'pending', priority: 'medium' },
    
    // Payment System
    { id: '8', category: 'Payments', description: 'Payment form loads correctly', status: 'pending', priority: 'high' },
    { id: '9', category: 'Payments', description: 'Test payment processing works', status: 'pending', priority: 'high' },
    { id: '10', category: 'Payments', description: 'Escrow payment option available', status: 'pending', priority: 'medium' },
    
    // Push Notifications
    { id: '11', category: 'Notifications', description: 'Push notification permission request', status: 'pending', priority: 'high' },
    { id: '12', category: 'Notifications', description: 'New message notifications work', status: 'pending', priority: 'high' },
    { id: '13', category: 'Notifications', description: 'Notification settings accessible', status: 'pending', priority: 'medium' },
    
    // General Functionality
    { id: '14', category: 'General', description: 'User registration and login', status: 'pending', priority: 'high' },
    { id: '15', category: 'General', description: 'Create and edit dog listings', status: 'pending', priority: 'high' },
    { id: '16', category: 'General', description: 'Search and filter listings', status: 'pending', priority: 'high' },
    { id: '17', category: 'General', description: 'Mobile responsiveness', status: 'pending', priority: 'high' },
    { id: '18', category: 'General', description: 'Performance on slow connections', status: 'pending', priority: 'medium' },
  ]);

  const updateTestStatus = (id: string, status: 'passed' | 'failed') => {
    setTestItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <Check className="w-4 h-4 text-green-600" />;
      case 'failed': return <X className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  const categories = [...new Set(testItems.map(item => item.category))];
  const passedTests = testItems.filter(item => item.status === 'passed').length;
  const totalTests = testItems.length;
  const completionPercentage = Math.round((passedTests / totalTests) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Launch Testing Checklist
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800">
              {passedTests}/{totalTests} tests completed
            </Badge>
            <Badge className={completionPercentage >= 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {completionPercentage}% ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category} Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testItems
                .filter(item => item.category === category)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className="text-sm">{item.description}</span>
                      {getPriorityBadge(item.priority)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      {item.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTestStatus(item.id, 'passed')}
                            className="text-green-600 border-green-300"
                          >
                            Pass
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTestStatus(item.id, 'failed')}
                            className="text-red-600 border-red-300"
                          >
                            Fail
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {completionPercentage >= 80 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-800 mb-1">Ready for Launch!</h3>
              <p className="text-green-700">Your application has passed the critical tests and is ready for production.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LaunchTestingChecklist;
