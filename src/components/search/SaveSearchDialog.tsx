
import React, { useState } from 'react';
import { Save, Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, notifyOnNewMatches: boolean) => void;
  currentQuery: string;
  currentFilters: any;
}

const SaveSearchDialog = ({
  open,
  onOpenChange,
  onSave,
  currentQuery,
  currentFilters
}: SaveSearchDialogProps) => {
  const [searchName, setSearchName] = useState('');
  const [notifyOnNewMatches, setNotifyOnNewMatches] = useState(true);

  const handleSave = () => {
    if (searchName.trim()) {
      onSave(searchName.trim(), notifyOnNewMatches);
      setSearchName('');
      setNotifyOnNewMatches(true);
    }
  };

  const generateSuggestedName = () => {
    let name = '';
    
    if (currentQuery) {
      name = currentQuery.slice(0, 30);
    } else if (currentFilters.breeds?.length > 0) {
      name = currentFilters.breeds.slice(0, 2).join(' & ');
    } else {
      name = 'My Search';
    }
    
    if (currentFilters.location) {
      name += ` in ${currentFilters.location}`;
    }
    
    return name;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentQuery) count++;
    if (currentFilters.breeds?.length > 0) count++;
    if (currentFilters.location) count++;
    if (currentFilters.verifiedOnly) count++;
    if (currentFilters.priceRange?.[0] > 0 || currentFilters.priceRange?.[1] < 5000) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Search
          </DialogTitle>
          <DialogDescription>
            Save your search criteria and get notified when new matches are found.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Preview */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="text-sm font-medium">Search Preview:</div>
            {currentQuery && (
              <div className="text-sm">Query: "{currentQuery}"</div>
            )}
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">
                {getActiveFiltersCount()} filters active
              </Badge>
              {currentFilters.breeds?.slice(0, 2).map(breed => (
                <Badge key={breed} variant="outline">{breed}</Badge>
              ))}
              {currentFilters.location && (
                <Badge variant="outline">{currentFilters.location}</Badge>
              )}
            </div>
          </div>

          {/* Search Name */}
          <div className="space-y-2">
            <Label htmlFor="searchName">Search Name</Label>
            <Input
              id="searchName"
              placeholder="Enter a name for this search"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchName(generateSuggestedName())}
              className="text-xs"
            >
              Use suggested: "{generateSuggestedName()}"
            </Button>
          </div>

          {/* Notification Settings */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Bell className="h-4 w-4" />
                Smart Notifications
              </div>
              <div className="text-sm text-muted-foreground">
                Get notified when new dogs match your criteria
              </div>
            </div>
            <Switch
              checked={notifyOnNewMatches}
              onCheckedChange={setNotifyOnNewMatches}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!searchName.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSearchDialog;
