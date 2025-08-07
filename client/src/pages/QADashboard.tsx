import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Bug, Users, Settings, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function QADashboard() {
  const qaTools = [
    {
      title: 'Testing Checklist',
      description: 'Systematic testing workflow for all app features',
      icon: TestTube,
      link: '/dashboard/test-checklist',
      status: 'active',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Bug Reports',
      description: 'View and manage reported bugs',
      icon: Bug,
      link: '/admin/bug-reports',
      status: 'active',
      color: 'bg-red-100 text-red-800',
    },
    {
      title: 'Test Accounts',
      description: 'Pre-configured accounts for testing',
      icon: Users,
      link: '/dashboard/test-checklist?tab=accounts',
      status: 'ready',
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Service Testing',
      description: 'Pet services marketplace testing tools',
      icon: Settings,
      link: '/marketplace?tab=services',
      status: 'ready',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const testScenarios = [
    {
      category: 'Store & Checkout',
      scenarios: [
        'Browse products and add to cart',
        'Complete Stripe checkout flow',
        'View order history',
        'Test payment failures',
      ],
    },
    {
      category: 'Pet Services',
      scenarios: [
        'Provider registration and approval',
        'Service booking flow',
        'Booking confirmations',
        'Provider dashboard access',
      ],
    },
    {
      category: 'Social Features',
      scenarios: [
        'Post creation and interactions',
        'Messaging between users',
        'User profiles and following',
        'Real-time notifications',
      ],
    },
    {
      category: 'Admin Panel',
      scenarios: [
        'Admin authentication',
        'Provider application reviews',
        'Bug report management',
        'System monitoring',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QA Testing Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Phase 4-A Quality Assurance and Bug Tracking System
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link to="/admin/bug-reports">
            <Button variant="outline" className="bg-red-50 border-red-200 text-red-700">
              <Bug className="w-4 h-4 mr-2" />
              View Bugs
            </Button>
          </Link>
          <Link to="/dashboard/test-checklist">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <TestTube className="w-4 h-4 mr-2" />
              Start Testing
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qaTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Card key={tool.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="h-8 w-8 text-muted-foreground" />
                  <Badge className={tool.color}>
                    {tool.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <Link to={tool.link}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Tool
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Testing Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testScenarios.map((category) => (
                <div key={category.category}>
                  <h4 className="font-semibold text-sm mb-2">{category.category}</h4>
                  <ul className="space-y-1">
                    {category.scenarios.map((scenario, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2" />
                        {scenario}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/marketplace?tab=store">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Product Store
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/marketplace?tab=services">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Pet Services
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Access Admin Panel
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/messages">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Messaging
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/home">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Test Social Feed
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QA Process Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Test Planning</h4>
              <p className="text-sm text-muted-foreground">
                Review testing checklist and select test scenarios
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Execute Tests</h4>
              <p className="text-sm text-muted-foreground">
                Run tests systematically and document results
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Report Issues</h4>
              <p className="text-sm text-muted-foreground">
                Submit bug reports and track resolution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QADashboard;