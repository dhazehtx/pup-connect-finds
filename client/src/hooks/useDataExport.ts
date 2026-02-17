
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { toast } = useToast();

  const exportUserData = async () => {
    setIsExporting(true);
    try {
      const res = await apiRequest('/api/export-user-data');
      const data = await res.json();

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-pup-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been exported and downloaded successfully.",
      });

      return data;
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export your data. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const initiateAccountDeletion = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await apiRequest('/api/delete-account', { method: 'DELETE' });
      const data = await res.json();

      toast({
        title: "Account Deletion Initiated",
        description: data.message || "Your account deletion has been scheduled.",
        duration: 10000,
      });

      return data;
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to initiate account deletion. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const recoverAccount = async (recoveryToken: string) => {
    try {
      const res = await apiRequest('/api/gdpr/recover-account', {
        method: 'POST',
        body: JSON.stringify({ recoveryToken }),
      });
      const data = await res.json();

      toast({
        title: "Account Recovered",
        description: "Your account has been successfully recovered.",
      });

      return data;
    } catch (error: any) {
      console.error('Account recovery error:', error);
      toast({
        title: "Recovery Failed",
        description: error.message || "Failed to recover account. Please check your recovery token.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    exportUserData,
    initiateAccountDeletion,
    recoverAccount,
    isExporting,
    isDeletingAccount
  };
};
