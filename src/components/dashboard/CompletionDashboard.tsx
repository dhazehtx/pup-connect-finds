
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Shield,
  Upload,
  Smartphone,
  Search,
  CreditCard,
  Users,
  Settings,
  Database
} from 'lucide-react';

interface FeatureStatus {
  name: string;
  percentage: number;
  status: 'completed' | 'in-progress' | 'pending';
  icon: React.ElementType;
  description: string;
  completedItems: string[];
  pendingItems: string[];
}

const CompletionDashboard = () => {
  const features: FeatureStatus[] = [
    {
      name: 'Messaging System',
      percentage: 85,
      status: 'in-progress',
      icon: MessageSquare,
      description: 'Real-time chat functionality',
      completedItems: [
        'Message bubbles with read status',
        'Chat header with user info',
        'Message input with media support',
        'Live chat interface',
        'Chat page structure'
      ],
      pendingItems: [
        'Message persistence to database',
        'Real-time message sync',
        'Typing indicators'
      ]
    },
    {
      name: 'User Verification',
      percentage: 70,
      status: 'in-progress',
      icon: Shield,
      description: 'Document upload and identity verification',
      completedItems: [
        'Verification status component',
        'Verification workflow',
        'Document upload interface',
        'Verification dashboard'
      ],
      pendingItems: [
        'Backend verification processing',
        'Automated document validation',
        'Admin verification review panel'
      ]
    },
    {
      name: 'Error Handling',
      percentage: 90,
      status: 'completed',
      icon: AlertCircle,
      description: 'Comprehensive error management',
      completedItems: [
        'Error handler hook',
        'Toast notifications for errors',
        'Async operation handling',
        'Error boundaries',
        'Retry mechanisms'
      ],
      pendingItems: [
        'Global error reporting'
      ]
    },
    {
      name: 'Mobile Responsiveness',
      percentage: 80,
      status: 'in-progress',
      icon: Smartphone,
      description: 'Optimized mobile experience',
      completedItems: [
        'Mobile responsive wrapper',
        'Responsive grid system',
        'Mobile optimized cards',
        'Touch-friendly interactions',
        'Mobile profile header'
      ],
      pendingItems: [
        'Tablet optimization',
        'Landscape mode improvements'
      ]
    },
    {
      name: 'File Upload System',
      percentage: 75,
      status: 'in-progress',
      icon: Upload,
      description: 'Media and document uploads',
      completedItems: [
        'Image upload component',
        'File validation',
        'Progress indicators',
        'Image cropping'
      ],
      pendingItems: [
        'Cloud storage integration',
        'Bulk upload support',
        'File compression'
      ]
    },
    {
      name: 'Authentication',
      percentage: 60,
      status: 'in-progress',
      icon: Users,
      description: 'User login and registration',
      completedItems: [
        'Auth context setup',
        'Login/signup forms',
        'Guest mode',
        'Protected routes'
      ],
      pendingItems: [
        'Email verification',
        'Password reset',
        'Social login integration',
        'Two-factor authentication'
      ]
    },
    {
      name: 'Search & AI Features',
      percentage: 40,
      status: 'pending',
      icon: Search,
      description: 'AI-powered search and recommendations',
      completedItems: [
        'Search interface components',
        'Filter system'
      ],
      pendingItems: [
        'AI search implementation',
        'Smart recommendations',
        'Voice search',
        'Image analysis'
      ]
    },
    {
      name: 'Payment Processing',
      percentage: 30,
      status: 'pending',
      icon: CreditCard,
      description: 'Stripe integration and transactions',
      completedItems: [
        'Payment button components',
        'Pricing plans UI'
      ],
      pendingItems: [
        'Stripe integration',
        'Subscription management',
        'Escrow system',
        'Payment analytics'
      ]
    },
    {
      name: 'Database Schema',
      percentage: 50,
      status: 'in-progress',
      icon: Database,
      description: 'Supabase database setup',
      completedItems: [
        'Basic table structure',
        'User profiles',
        'RLS policies setup'
      ],
      pendingItems: [
        'Messages table',
        'Verification documents table',
        'Payment transactions table',
        'Notifications table'
      ]
    },
    {
      name: 'Admin Dashboard',
      percentage: 20,
      status: 'pending',
      icon: Settings,
      description: 'Administrative features',
      completedItems: [
        'Basic dashboard structure'
      ],
      pendingItems: [
        'User management',
        'Content moderation',
        'Analytics dashboard',
        'System monitoring'
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={16} />;
      case 'in-progress': return <Clock className="text-blue-600" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallProgress = Math.round(
    features.reduce((sum, feature) => sum + feature.percentage, 0) / features.length
  );

  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const inProgressFeatures = features.filter(f => f.status === 'in-progress').length;
  const pendingFeatures = features.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-6 p-6">
      {/* Overall Progress */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            🚀 Project Completion Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Overall Progress</span>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-4" />
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedFeatures}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{inProgressFeatures}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{pendingFeatures}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Breakdown */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold mb-4">Feature Progress Breakdown</h2>
        
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card key={feature.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="text-gray-600" size={20} />
                      <div>
                        <h3 className="font-semibold text-lg">{feature.name}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold mb-1">{feature.percentage}%</div>
                      <Badge className={getStatusColor(feature.status)}>
                        {getStatusIcon(feature.status)}
                        <span className="ml-1">{feature.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress value={feature.percentage} className="h-2" />

                  {/* Details */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">
                        ✅ Completed ({feature.completedItems.length})
                      </h4>
                      <ul className="space-y-1">
                        {feature.completedItems.map((item, index) => (
                          <li key={index} className="text-gray-600 flex items-center gap-2">
                            <CheckCircle size={12} className="text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">
                        ⏳ Pending ({feature.pendingItems.length})
                      </h4>
                      <ul className="space-y-1">
                        {feature.pendingItems.map((item, index) => (
                          <li key={index} className="text-gray-600 flex items-center gap-2">
                            <Clock size={12} className="text-orange-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Steps */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium">1. Complete Database Schema</h4>
              <p className="text-sm text-gray-600">Set up messages, verification, and payment tables to support core features</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium">2. Implement Real-time Messaging</h4>
              <p className="text-sm text-gray-600">Connect messaging UI to Supabase real-time features</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium">3. Set up Authentication Flow</h4>
              <p className="text-sm text-gray-600">Complete email verification and password reset functionality</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium">4. Add Payment Integration</h4>
              <p className="text-sm text-gray-600">Integrate Stripe for subscription and transaction processing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompletionDashboard;
