
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Settings, 
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNavigation = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'App Completion',
      description: 'View development progress and feature completion status',
      icon: CheckCircle,
      path: '/app-completion',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Platform metrics and performance insights',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Trust & Safety',
      description: 'Content moderation and safety tools',
      icon: Shield,
      path: '/admin/safety',
      color: 'from-red-500 to-orange-600'
    },
    {
      title: 'Platform Settings',
      description: 'System configuration and feature flags',
      icon: Settings,
      path: '/admin/settings',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      title: 'Messaging Oversight',
      description: 'Monitor and moderate communications',
      icon: MessageSquare,
      path: '/admin/messaging',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'Content Moderation',
      description: 'Review flagged content and listings',
      icon: AlertTriangle,
      path: '/admin/moderation',
      color: 'from-yellow-500 to-amber-600'
    },
    {
      title: 'Revenue Analytics',
      description: 'Financial metrics and revenue tracking',
      icon: DollarSign,
      path: '/admin/revenue',
      color: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Sample Data',
      description: 'Manage test data and development tools',
      icon: Database,
      path: '/sample-data',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive platform management and monitoring tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card key={section.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {section.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {section.description}
                </p>
                <Button 
                  onClick={() => navigate(section.path)}
                  className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 text-white font-semibold`}
                >
                  Access {section.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminNavigation;
