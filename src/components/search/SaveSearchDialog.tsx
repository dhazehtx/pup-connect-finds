
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SaveSearchDialogProps {
  searchName: string;
  onSearchNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SaveSearchDialog = ({ searchName, onSearchNameChange, onSave, onCancel }: SaveSearchDialogProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex gap-2">
          <Input
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            placeholder="Name your search..."
            className="flex-1"
          />
          <Button onClick={onSave} disabled={!searchName.trim()}>
            Save
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaveSearchDialog;
