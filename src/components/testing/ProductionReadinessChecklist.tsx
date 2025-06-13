
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Rocket } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'performance' | 'functionality' | 'deployment';
  status: 'completed' | 'pending' | 'issue';
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

const ProductionReadinessChecklist = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const checklistItems: ChecklistItem[] = [
    // Security
    {
      id: 'auth-setup',
      title: 'Authentication System',
      description: 'User authentication and authorization is properly configured',
      category: 'security',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'rls-policies',
      title: 'Row Level Security',
      description: 'All database tables have appropriate RLS policies',
      category: 'security',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'input-validation',
      title: 'Input Validation',
      description: 'All user inputs are properly validated and sanitized',
      category: 'security',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'env-variables',
      title: 'Environment Variables',
      description: 'All sensitive data is stored in environment variables',
      category: 'security',
      status: 'completed',
      priority: 'high'
    },

    // Performance
    {
      id: 'image-optimization',
      title: 'Image Optimization',
      description: 'Images are optimized and properly sized',
      category: 'performance',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'code-splitting',
      title: 'Code Splitting',
      description: 'Application uses proper code splitting and lazy loading',
      category: 'performance',
      status: 'completed',
      priority: 'medium'
    },
    {
      id: 'caching-strategy',
      title: 'Caching Strategy',
      description: 'Appropriate caching strategies are implemented',
      category: 'performance',
      status: 'completed',
      priority: 'medium'
    },

    // Functionality
    {
      id: 'core-features',
      title: 'Core Features',
      description: 'All core features are working correctly',
      category: 'functionality',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'error-handling',
      title: 'Error Handling',
      description: 'Proper error handling and user feedback',
      category: 'functionality',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'mobile-responsive',
      title: 'Mobile Responsiveness',
      description: 'Application works correctly on all device sizes',
      category: 'functionality',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Basic accessibility standards are met',
      category: 'functionality',
      status: 'pending',
      priority: 'medium'
    },

    // Deployment
    {
      id: 'build-process',
      title: 'Build Process',
      description: 'Application builds successfully without errors',
      category: 'deployment',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'domain-setup',
      title: 'Domain Configuration',
      description: 'Custom domain is configured (if applicable)',
      category: 'deployment',
      status: 'pending',
      priority: 'low'
    },
    {
      id: 'ssl-certificate',
      title: 'SSL Certificate',
      description: 'HTTPS is properly configured',
      category: 'deployment',
      status: 'completed',
      priority: 'high'
    },
    {
      id: 'analytics-setup',
      title: 'Analytics Setup',
      description: 'Analytics and monitoring are configured',
      category: 'deployment',
      status: 'completed',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    setChecklist(checklistItems);
    calculateScore();
  }, []);

  const calculateScore = () => {
    const completed = checklistItems.filter(item => item.status === 'completed').length;
    const total = checklistItems.length;
    setOverallScore((completed / total) * 100);
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'issue':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: ChecklistItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getCategoryColor = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'security':
        return 'bg-blue-100 text-blue-800';
      case 'performance':
        return 'bg-purple-100 text-purple-800';
      case 'functionality':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getItemsByCategory = (category: string) => {
    return checklist.filter(item => item.category === category);
  };

  const categories = ['security', 'performance', 'functionality', 'deployment'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="text-blue-600" />
                Production Readiness Checklist
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Ensure your application is ready for production deployment
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(overallScore)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallScore} className="h-3" />
            
            <div className="grid grid-cols-4 gap-4 text-center">
              {categories.map(category => {
                const items = getItemsByCategory(category);
                const completed = items.filter(item => item.status === 'completed').length;
                return (
                  <div key={category}>
                    <div className="text-lg font-semibold">
                      {completed}/{items.length}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{category}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="space-y-6">
        {categories.map(category => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                {category}
                <Badge className={getCategoryColor(category as any)}>
                  {getItemsByCategory(category).filter(item => item.status === 'completed').length}/
                  {getItemsByCategory(category).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getItemsByCategory(category).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    {getStatusIcon(item.status)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge className={getPriorityColor(item.priority)} variant="outline">
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>

                    {item.actionUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.actionUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallScore >= 90 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Ready for Production!</h3>
                </div>
                <p className="text-green-700">
                  Your application meets all critical requirements and is ready for production deployment.
                </p>
              </div>
            ) : overallScore >= 75 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Almost Ready</h3>
                </div>
                <p className="text-yellow-700">
                  Your application is mostly ready. Address the remaining items before deploying to production.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Needs Attention</h3>
                </div>
                <p className="text-red-700">
                  Several critical items need to be addressed before production deployment.
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Next Steps:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Complete any pending checklist items</li>
                <li>• Run comprehensive testing</li>
                <li>• Set up monitoring and alerts</li>
                <li>• Prepare rollback plan</li>
                <li>• Schedule deployment window</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionReadinessChecklist;
