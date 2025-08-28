import React from 'react';
import { ProviderApplicationInbox } from '@/components/admin/ProviderApplicationInbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Bell, CheckCircle } from 'lucide-react';

export default function AdminApplications() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage provider applications and notifications</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">-</div>
              <p className="text-xs text-gray-500">Awaiting review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">-</div>
              <p className="text-xs text-gray-500">New providers verified</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications Sent</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">-</div>
              <p className="text-xs text-gray-500">Email/SMS alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Provider Application Inbox */}
        <Card>
          <CardContent className="p-6">
            <ProviderApplicationInbox />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}