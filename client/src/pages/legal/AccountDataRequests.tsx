import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Settings, ArrowRight } from 'lucide-react';

function AccountDataRequests() {
  useEffect(() => {
    document.title = 'Account & Data Requests — PAWS';
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Deletion & Data Requests</h1>
        <p className="text-muted-foreground">Manage your personal data and account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You may request:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Account deletion</strong> — Permanently remove your account and associated data</li>
            <li><strong>Export of your personal data</strong> — Download a copy of your information</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            How to Submit a Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>To request account deletion or data export:</p>
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>Log into your account</li>
            <li>Navigate to <strong>Account Settings</strong></li>
            <li>Submit a deletion or data request</li>
          </ol>
          
          <div className="mt-6">
            <Link to="/account-settings">
              <Button className="gap-2">
                Go to Account Settings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-primary" />
            Processing Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Requests are processed within a reasonable timeframe, typically within 30 days.
          </p>
          <p className="text-sm text-muted-foreground">
            Some data may be retained for legal or operational purposes, such as transaction records 
            required for tax compliance or dispute resolution.
          </p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If you have questions about your data or need assistance, 
            please contact us at <a href="mailto:support@mypup.app" className="underline">support@mypup.app</a>
          </p>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>
          For more information about how we handle your data, see our{' '}
          <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default AccountDataRequests;
