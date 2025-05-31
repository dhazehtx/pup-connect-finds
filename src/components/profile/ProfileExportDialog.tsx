
import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useProfileExport } from '@/hooks/useProfileExport';
import { UserProfile } from '@/types/profile';

interface ProfileExportDialogProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileExportDialog: React.FC<ProfileExportDialogProps> = ({
  profile,
  isOpen,
  onClose
}) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'pdf' | 'csv'>('json');
  const { exportProfile, isExporting } = useProfileExport();

  const handleExport = async () => {
    try {
      await exportProfile(profile, exportFormat);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatOptions = [
    {
      value: 'json',
      label: 'JSON',
      description: 'Complete data in JSON format',
      icon: FileText
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Spreadsheet-compatible format',
      icon: FileSpreadsheet
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Printable document format',
      icon: FileImage
    }
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} />
            Export Profile
          </DialogTitle>
          <DialogDescription>
            Choose a format to export your profile data. This includes your basic information, listings, and reviews.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={exportFormat}
            onValueChange={(value) => setExportFormat(value as 'json' | 'pdf' | 'csv')}
          >
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex items-center gap-3 cursor-pointer flex-1 p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <Icon size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
