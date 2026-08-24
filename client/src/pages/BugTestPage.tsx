import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, AlertTriangle, Monitor, Smartphone } from 'lucide-react';
import BugReportButton from '@/components/bugs/BugReportButton';

const BugTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Bug className="w-8 h-8 text-red-600" />
            Bug Reporting System Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test the comprehensive bug reporting system for PAWS platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bug Report Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-600" />
                Bug Report Modal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Test the comprehensive bug reporting modal with:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                <li>Priority level selection</li>
                <li>Detailed description fields</li>
                <li>Steps to reproduce</li>
                <li>Expected vs actual behavior</li>
                <li>Automatic device detection</li>
                <li>Screenshot URL support</li>
              </ul>
              
              <div className="pt-4">
                <BugReportButton variant="default" size="sm" />
              </div>
            </CardContent>
          </Card>

          {/* Admin Dashboard Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Admin features include:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-4">
                <li>View all bug reports with filtering</li>
                <li>Status management (open/in-progress/resolved)</li>
                <li>Priority assignment and tracking</li>
                <li>Admin assignment system</li>
                <li>Resolution notes and tracking</li>
                <li>Technical information display</li>
              </ul>
              
              <div className="pt-4">
                <a 
                  href="/admin/bugs" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Monitor className="w-4 h-4" />
                  View Admin Dashboard
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Feature Overview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                System Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">User Features</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Easy bug reporting modal</li>
                    <li>• Priority level selection</li>
                    <li>• Screenshot support</li>
                    <li>• Automatic device detection</li>
                    <li>• Status tracking</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Admin Features</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Comprehensive dashboard</li>
                    <li>• Advanced filtering</li>
                    <li>• Assignment system</li>
                    <li>• Resolution tracking</li>
                    <li>• Statistics overview</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Technical Features</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Browser info capture</li>
                    <li>• Device detection</li>
                    <li>• Database integration</li>
                    <li>• Real-time updates</li>
                    <li>• Mobile responsive</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Scenarios */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Test Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">1. UI Bug Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Test reporting a visual/design issue with low priority.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">2. Critical Bug</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Test reporting a critical system failure with high priority.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">3. Feature Request</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Test reporting missing functionality with medium priority.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">4. Mobile Issue</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Test reporting mobile-specific problems with device info.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BugTestPage;