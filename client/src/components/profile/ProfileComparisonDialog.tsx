
import React, { useState } from 'react';
import { GitCompare, Plus, X, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfileComparison } from '@/hooks/useProfileComparison';
import { UserProfile } from '@/types/profile';

interface ProfileComparisonDialogProps {
  currentProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

const comparisonFields = [
  { key: 'rating', label: 'Rating' },
  { key: 'total_reviews', label: 'Total Reviews' },
  { key: 'years_experience', label: 'Years Experience' },
  { key: 'verified', label: 'Verified Status' },
  { key: 'user_type', label: 'User Type' },
  { key: 'location', label: 'Location' }
] as const;

export const ProfileComparisonDialog: React.FC<ProfileComparisonDialogProps> = ({
  currentProfile,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<UserProfile[]>([currentProfile]);
  const [selectedFields, setSelectedFields] = useState<(keyof UserProfile)[]>([
    'rating', 'total_reviews', 'years_experience', 'verified'
  ]);
  const [activeComparison, setActiveComparison] = useState<any>(null);

  const { 
    createComparison, 
    isLoading, 
    getComparisonInsights,
    exportComparison 
  } = useProfileComparison();

  // Mock search results - in a real app, this would search the database
  const searchResults: UserProfile[] = [
    {
      ...currentProfile,
      id: 'demo-1',
      username: 'puppymaster',
      full_name: 'Puppy Master Kennel',
      rating: 4.7,
      total_reviews: 89,
      years_experience: 8,
      verified: true
    },
    {
      ...currentProfile,
      id: 'demo-2',
      username: 'dogbreeder123',
      full_name: 'Premier Dog Breeding',
      rating: 4.5,
      total_reviews: 134,
      years_experience: 12,
      verified: false
    }
  ].filter(profile => 
    profile.id !== currentProfile.id &&
    (profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     profile.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddProfile = (profile: UserProfile) => {
    if (selectedProfiles.length >= 5) return;
    if (selectedProfiles.some(p => p.id === profile.id)) return;
    
    setSelectedProfiles(prev => [...prev, profile]);
  };

  const handleRemoveProfile = (profileId: string) => {
    if (selectedProfiles.length <= 2) return;
    setSelectedProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const handleFieldToggle = (field: keyof UserProfile) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleCreateComparison = async () => {
    try {
      const comparison = await createComparison(selectedProfiles, selectedFields);
      const insights = getComparisonInsights(comparison);
      setActiveComparison({ ...comparison, insights });
    } catch (error) {
      console.error('Failed to create comparison:', error);
    }
  };

  const handleExportComparison = () => {
    if (activeComparison) {
      exportComparison(activeComparison);
    }
  };

  const renderComparisonResult = () => {
    if (!activeComparison) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Comparison Results</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportComparison}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedFields.map(field => {
            const insight = activeComparison.insights[field];
            return (
              <div key={field} className="border rounded-lg p-3">
                <h4 className="font-medium mb-2 capitalize">
                  {field.replace('_', ' ')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedProfiles.map(profile => (
                    <div key={profile.id} className="flex justify-between">
                      <span className="text-gray-600">{profile.username}:</span>
                      <span className="font-medium">
                        {String(profile[field] || 'N/A')}
                      </span>
                    </div>
                  ))}
                </div>
                {insight && typeof insight === 'object' && (
                  <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                    {insight.highest !== undefined && (
                      <div>Highest: {insight.highest}</div>
                    )}
                    {insight.average !== undefined && (
                      <div>Average: {insight.average.toFixed(1)}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare size={20} />
            Compare Profiles
          </DialogTitle>
          <DialogDescription>
            Compare up to 5 profiles to see how they stack up against each other.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Profiles */}
          <div>
            <Label className="text-base font-medium">Selected Profiles ({selectedProfiles.length}/5)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedProfiles.map(profile => (
                <Badge 
                  key={profile.id} 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {profile.username}
                  {profile.id !== currentProfile.id && (
                    <button 
                      onClick={() => handleRemoveProfile(profile.id)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search for more profiles */}
          {selectedProfiles.length < 5 && (
            <div>
              <Label htmlFor="profile-search">Add More Profiles</Label>
              <Input
                id="profile-search"
                placeholder="Search for profiles to compare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
              {searchQuery && (
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(profile => (
                      <div 
                        key={profile.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium">{profile.full_name}</div>
                          <div className="text-sm text-gray-600">@{profile.username}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddProfile(profile)}
                          disabled={selectedProfiles.some(p => p.id === profile.id)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No profiles found matching "{searchQuery}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Comparison Fields */}
          <div>
            <Label className="text-base font-medium">Comparison Fields</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {comparisonFields.map(field => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                  />
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Result */}
          {activeComparison && renderComparisonResult()}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button 
              onClick={handleCreateComparison}
              disabled={selectedProfiles.length < 2 || selectedFields.length === 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Comparing...' : 'Compare Profiles'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
