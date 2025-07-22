
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SaveSearchCardProps {
  showSaveDialog: boolean;
  saveSearchName: string;
  onSaveSearchNameChange: (name: string) => void;
  onSaveSearch: () => void;
  onCloseSaveDialog: () => void;
}

const SaveSearchCard = ({ 
  showSaveDialog, 
  saveSearchName, 
  onSaveSearchNameChange, 
  onSaveSearch, 
  onCloseSaveDialog 
}: SaveSearchCardProps) => {
  if (!showSaveDialog) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Save Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter search name..."
          value={saveSearchName}
          onChange={(e) => onSaveSearchNameChange(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={onSaveSearch} disabled={!saveSearchName.trim()}>
            Save Search
          </Button>
          <Button variant="outline" onClick={onCloseSaveDialog}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaveSearchCard;
