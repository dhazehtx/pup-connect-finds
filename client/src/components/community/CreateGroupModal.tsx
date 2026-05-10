import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Dog, Globe, Lock, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  getBreedEmoji: (breedTag: string) => string;
  popularBreeds: string[];
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  getBreedEmoji,
  popularBreeds
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    breed_tag: '',
    region: '',
    privacy: 'public',
    rules: '',
    cover_image: '',
    tags: [] as string[]
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/community', { method: 'POST', body: data });
    },
    onSuccess: () => {
      toast({
        title: "Group created successfully!",
        description: "Your community group is now live and ready for members.",
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create group",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      breed_tag: '',
      region: '',
      privacy: 'public',
      rules: '',
      cover_image: '',
      tags: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description for your group.",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate({
      ...formData,
      group_icon: formData.breed_tag ? getBreedEmoji(formData.breed_tag) : '🐕'
    });
  };

  const handleClose = () => {
    if (!createGroupMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const formatBreedName = (breedTag: string) => {
    return breedTag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag].slice(0, 5) // Max 5 tags
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dog className="w-5 h-5 text-blue-600" />
            Create New Community Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Golden Retriever Lovers NYC"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your group's purpose and what members can expect..."
                maxLength={500}
                rows={3}
              />
            </div>
          </div>

          {/* Breed and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="breed">Breed Focus</Label>
              <Select
                value={formData.breed_tag}
                onValueChange={(value) => setFormData(prev => ({ ...prev, breed_tag: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a breed (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific breed</SelectItem>
                  {popularBreeds.map(breed => (
                    <SelectItem key={breed} value={breed}>
                      {getBreedEmoji(breed)} {formatBreedName(breed)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="region">Region/State</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific region</SelectItem>
                  {US_STATES.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <Label>Privacy Settings</Label>
            <RadioGroup
              value={formData.privacy}
              onValueChange={(value) => setFormData(prev => ({ ...prev, privacy: value }))}
              className="mt-2"
            >
              <div className="space-y-3">
                <Card className={`cursor-pointer transition-colors ${formData.privacy === 'public' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="public" id="public" />
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-600" />
                        <Label htmlFor="public" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Public Group</p>
                            <p className="text-sm text-gray-600">Anyone can find and join this group</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-colors ${formData.privacy === 'private' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="private" id="private" />
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-600" />
                        <Label htmlFor="private" className="cursor-pointer">
                          <div>
                            <p className="font-medium">Private Group</p>
                            <p className="text-sm text-gray-600">Invitation only, approval required to join</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Group Rules */}
          <div>
            <Label htmlFor="rules">Group Rules & Guidelines</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Set clear guidelines for your group members..."
              maxLength={1000}
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div>
            <Label htmlFor="cover_image">Cover Image URL (optional)</Label>
            <Input
              id="cover_image"
              type="url"
              value={formData.cover_image}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Additional Tags */}
          <div>
            <Label>Additional Tags (optional)</Label>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                  disabled={formData.tags.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                    if (input) {
                      addTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                  disabled={formData.tags.length >= 5}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Add up to 5 tags to help people discover your group
              </p>
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                    {formData.breed_tag ? getBreedEmoji(formData.breed_tag) : '🐕'}
                  </div>
                  <div>
                    <h4 className="font-medium">{formData.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {formData.description || 'No description provided'}
                    </p>
                  </div>
                  {formData.privacy === 'private' && (
                    <Lock className="w-4 h-4 text-orange-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createGroupMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGroupMutation.isPending || !formData.name.trim() || !formData.description.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;