
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, notifyOnNewMatches: boolean) => void;
  currentQuery: string;
  currentFilters: any;
}

const SaveSearchDialog = ({ open, onOpenChange, onSave, currentQuery }: SaveSearchDialogProps) => {
  const [searchName, setSearchName] = React.useState('');
  const [notifyOnNewMatches, setNotifyOnNewMatches] = React.useState(true);

  const handleSave = () => {
    if (searchName.trim()) {
      onSave(searchName, notifyOnNewMatches);
      setSearchName('');
      setNotifyOnNewMatches(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchName">Search Name</Label>
            <Input
              id="searchName"
              placeholder="e.g., Golden Retrievers under $2000"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notifyOnNewMatches}
              onCheckedChange={setNotifyOnNewMatches}
            />
            <Label htmlFor="notifications">
              Notify me when new matches are found
            </Label>
          </div>

          <div className="bg-muted p-3 rounded text-sm">
            <p className="font-medium">Current search:</p>
            <p className="text-muted-foreground">{currentQuery || 'No search query'}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!searchName.trim()}
              className="flex-1"
            >
              Save Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSearchDialog;
