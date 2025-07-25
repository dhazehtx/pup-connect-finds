import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReportButton from '@/components/common/ReportButton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { User, Package, Shield, Flag } from 'lucide-react';

const ReportsTestPage = () => {
  const [testUser] = useState({
    id: 'test-user-123',
    username: 'testuser123'
  });

  const [testListing] = useState({
    id: 'test-listing-456',
    title: 'Golden Retriever Puppy',
    ownerId: 'test-owner-789'
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="w-8 h-8 text-red-600" />
          Trust & Safety Testing
        </h1>
        <Link to="/admin/reports">
          <Button>
            <Shield className="w-4 h-4 mr-2" />
            View Admin Panel
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Reporting Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              User Reporting Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Test User Profile</h3>
              <p className="text-sm text-gray-600">Username: {testUser.username}</p>
              <p className="text-sm text-gray-600">User ID: {testUser.id}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Click below to test the user reporting functionality:
              </p>
              <ReportButton
                type="user"
                userId={testUser.id}
                username={testUser.username}
                variant="default"
                size="default"
                className="w-full"
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Features to test:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Rate limiting (5 reports per day)</li>
                <li>Duplicate report prevention</li>
                <li>Reason selection and validation</li>
                <li>Message length requirements</li>
                <li>Notification system</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Listing Reporting Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Listing Reporting Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Test Listing</h3>
              <p className="text-sm text-gray-600">Title: {testListing.title}</p>
              <p className="text-sm text-gray-600">Listing ID: {testListing.id}</p>
              <p className="text-sm text-gray-600">Owner ID: {testListing.ownerId}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Click below to test the listing reporting functionality:
              </p>
              <ReportButton
                type="listing"
                listingId={testListing.id}
                listingTitle={testListing.title}
                listingOwnerId={testListing.ownerId}
                variant="default"
                size="default"
                className="w-full"
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Listing-specific reasons:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Misleading information</li>
                <li>Suspected puppy mill</li>
                <li>Sick or unhealthy animal</li>
                <li>Scam or fraudulent listing</li>
                <li>Overpriced</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Admin Moderation Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Link to="/admin/reports">
                <Button className="w-full mb-2">
                  View Reports Dashboard
                </Button>
              </Link>
              <p className="text-sm text-gray-600">
                Access the complete reports management interface with filtering and resolution tools
              </p>
            </div>
            
            <div className="text-center">
              <Button variant="outline" className="w-full mb-2" disabled>
                Email Notifications
              </Button>
              <p className="text-sm text-gray-600">
                High-severity reports automatically trigger admin email alerts
              </p>
            </div>
            
            <div className="text-center">
              <Button variant="outline" className="w-full mb-2" disabled>
                Auto-Moderation
              </Button>
              <p className="text-sm text-gray-600">
                Future: AI-assisted content moderation and automatic action suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Reporting API</p>
              <p className="text-xs text-gray-600">Operational</p>
            </div>
            <div>
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Rate Limiting</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div>
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-gray-600">Working</p>
            </div>
            <div>
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Admin Panel</p>
              <p className="text-xs text-gray-600">Ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTestPage;