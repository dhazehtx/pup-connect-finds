import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const DeleteAccountButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDeleteAccount = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete your account",
        variant: "destructive"
      });
      return;
    }

    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE MY ACCOUNT' to confirm",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          confirmDelete: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted",
      });

      // Redirect to home page (logout will happen when user record is deleted)
      setLocation('/');
      
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Unable to delete your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDialog(false);
      setConfirmText('');
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete My Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-1">This will delete:</h4>
              <ul className="text-sm text-red-700 list-disc pl-4 space-y-1">
                <li>Your profile and personal information</li>
                <li>All your pet listings</li>
                <li>All your messages and conversations</li>
                <li>All your posts and comments</li>
                <li>Your transaction history</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm font-medium text-gray-700">
                Type "DELETE MY ACCOUNT" to confirm:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="text-center"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={loading || confirmText !== 'DELETE MY ACCOUNT'}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountButton;