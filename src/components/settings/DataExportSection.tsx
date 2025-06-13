
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Trash2, 
  Shield, 
  AlertTriangle,
  RecycleIcon
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDataExport } from '@/hooks/useDataExport';

const DataExportSection = () => {
  const [recoveryToken, setRecoveryToken] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const { 
    exportUserData, 
    initiateAccountDeletion, 
    recoverAccount,
    isExporting, 
    isDeletingAccount 
  } = useDataExport();

  const handleExportData = async () => {
    await exportUserData();
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return;
    }
    await initiateAccountDeletion();
    setConfirmationText('');
  };

  const handleRecoverAccount = async () => {
    if (!recoveryToken.trim()) {
      return;
    }
    await recoverAccount(recoveryToken);
    setRecoveryToken('');
  };

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Download all your personal data in compliance with GDPR/CCPA regulations. 
            This includes your profile, listings, messages, reviews, and more.
          </p>
          <Button 
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export My Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Recovery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RecycleIcon className="w-5 h-5" />
            Account Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            If you have initiated account deletion, you can recover your account using your recovery token within 30 days.
          </p>
          <div className="space-y-2">
            <Label htmlFor="recovery-token">Recovery Token</Label>
            <Input
              id="recovery-token"
              type="text"
              placeholder="Enter your recovery token"
              value={recoveryToken}
              onChange={(e) => setRecoveryToken(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleRecoverAccount}
            disabled={!recoveryToken.trim()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RecycleIcon className="w-4 h-4 mr-2" />
            Recover Account
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Deletion Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning: This action cannot be undone immediately</p>
              <p>Your account will be scheduled for deletion in 30 days. You can recover it during this period using the recovery token.</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-red-700">What will be deleted:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Your profile and personal information</li>
              <li>• All your listings and associated data</li>
              <li>• Your messages and conversations</li>
              <li>• Reviews you've given and received</li>
              <li>• Your favorites and saved searches</li>
              <li>• Payment methods and transaction history</li>
              <li>• Verification documents and background checks</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Confirm Account Deletion
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This will initiate the permanent deletion of your account and all associated data. 
                    You will have 30 days to recover your account using the recovery token we'll provide.
                  </p>
                  <p className="font-medium text-red-600">
                    Type "DELETE MY ACCOUNT" below to confirm:
                  </p>
                  <Input
                    type="text"
                    placeholder="DELETE MY ACCOUNT"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="mt-2"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationText('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={confirmationText !== 'DELETE MY ACCOUNT' || isDeletingAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingAccount ? 'Processing...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExportSection;
