import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface DataExportButtonProps {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const DataExportButton: React.FC<DataExportButtonProps> = ({ 
  variant = "outline", 
  size = "default" 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleDataExport = async () => {
    try {
      setIsExporting(true);
      
      const response = await apiRequest('GET', '/api/export-user-data');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export data');
      }

      // Get the data and create a blob for download
      const userData = await response.json();
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-pup-data-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your personal data has been downloaded successfully",
      });
    } catch (error: any) {
      console.error('Data export error:', error);
      
      if (error.message.includes('once every 24 hours')) {
        toast({
          title: "Export Limit Reached",
          description: "Data export is limited to once every 24 hours for security",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Export Failed",
          description: error.message || "Failed to export your data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDataExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isExporting ? 'Exporting...' : 'Download My Data'}
    </Button>
  );
};

export default DataExportButton;