import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Download,
  Trash2,
  Shield,
  FileText,
  ExternalLink,
  Globe,
  Moon,
  Ban,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBlockedUsers, useToggleBlock } from '@/hooks/useBlocks';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type BlockedRow = {
  id: string;
  blocked_id: string;
  created_at?: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

const AccountSettings = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { data: blockedRaw, isLoading: blockedLoading } = useBlockedUsers();
  const toggleBlock = useToggleBlock();
  const blockedList: BlockedRow[] = Array.isArray(blockedRaw) ? blockedRaw : [];
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Data export mutation
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to export data');
      return response.json();
    },
    onSuccess: (data) => {
      // Create and download the data file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `paws-account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Account deletion mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete account');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted. We're sorry to see you go.",
      });
      
      // Sign out and redirect after a brief delay
      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleExportData = () => {
    exportDataMutation.mutate();
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    deleteAccountMutation.mutate();
    setShowDeleteDialog(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Account Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account data and privacy settings</p>
        <Link 
          to="/account-data" 
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
        >
          Learn about your data rights
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* General — appearance & language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" aria-hidden />
            <CardTitle>General</CardTitle>
          </div>
          <CardDescription>Appearance and language preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
                <Label htmlFor="dark-mode-setting" className="text-base font-medium">
                  Dark mode
                </Label>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use dark theme across the app. More appearance options (e.g. system default, high contrast) may come
                later.
              </p>
            </div>
            <Switch
              id="dark-mode-setting"
              checked={theme === 'dark'}
              onCheckedChange={(on) => setTheme(on ? 'dark' : 'light')}
              aria-label="Enable dark mode"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language-setting">Language</Label>
            <Select value="en" disabled>
              <SelectTrigger id="language-setting" className="max-w-md border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Additional languages are planned for a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Safety — blocks & reporting */}
      <Card id="settings-safety">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" aria-hidden />
            <CardTitle>Safety</CardTitle>
          </div>
          <CardDescription>Report problems and manage who you’ve blocked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/help-center">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Help &amp; report issues
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/contact">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/legal/guidelines">
                <Shield className="mr-2 h-4 w-4" />
                Community guidelines
              </Link>
            </Button>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Ban className="h-4 w-4" aria-hidden />
              Blocked users
            </h3>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              People you block can’t message you or interact with you in the same ways. You can unblock anytime.
            </p>
            {blockedLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : blockedList.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                You haven’t blocked anyone. You can block someone from their profile or from a conversation.
              </p>
            ) : (
              <ul className="space-y-2">
                {blockedList.map((row) => {
                  const label = row.full_name?.trim() || row.username || 'User';
                  const initial = label.charAt(0).toUpperCase();
                  return (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={row.avatar_url || undefined} alt="" />
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">{label}</p>
                          {row.username ? (
                            <p className="truncate text-xs text-slate-500">@{row.username}</p>
                          ) : null}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={toggleBlock.isPending}
                        onClick={() => toggleBlock.mutate(row.blocked_id)}
                      >
                        Unblock
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <CardTitle>Export Your Data</CardTitle>
          </div>
          <CardDescription>
            Download a complete copy of your data for your records. This includes your profile, 
            listings, messages, and activity history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleExportData}
            disabled={exportDataMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {exportDataMutation.isPending ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </>
            )}
          </Button>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>What's included:</strong> Profile information, dog listings, messages, 
                reviews, favorites, and transaction history. Personal data is exported in 
                JSON format for easy viewing.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Deletion Section */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">Delete Account</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your PAWS account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete:
                  <ul className="mt-2 space-y-1 ml-4">
                    <li>• Your profile and account information</li>
                    <li>• All your dog listings and photos</li>
                    <li>• Message history and conversations</li>
                    <li>• Reviews and ratings you've given or received</li>
                    <li>• Favorites and saved searches</li>
                    <li>• Transaction and payment history</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setShowDeleteWarning(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>

            <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-left">
                    This permanently removes your profile, listings, messages, and other data. You will not be able to
                    recover your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    onClick={() => {
                      setShowDeleteDialog(true);
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog
              open={showDeleteDialog}
              onOpenChange={(open) => {
                setShowDeleteDialog(open);
                if (!open) setDeleteConfirmation('');
              }}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-red-900">Confirm Account Deletion</DialogTitle>
                  <DialogDescription>
                    This action is permanent and cannot be undone. All your data will be 
                    permanently deleted from our servers.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="delete-confirmation">
                      Type <strong>DELETE</strong> to confirm:
                    </Label>
                    <Input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE here"
                      className="mt-2"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        Consider exporting your data first if you want to keep a copy for your records.
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirmation('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending || deleteConfirmation !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteAccountMutation.isPending ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Forever
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;