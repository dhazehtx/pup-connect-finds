import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Image, FileText, HelpCircle, Megaphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

const POST_TYPES = [
  { value: 'discussion', label: 'Discussion', icon: FileText, description: 'Start a general conversation' },
  { value: 'question', label: 'Question', icon: HelpCircle, description: 'Ask for help or advice' },
  { value: 'photo', label: 'Photo Share', icon: Image, description: 'Share photos of your dogs' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Important group updates' }
];

const CreateGroupPostModal: React.FC<CreateGroupPostModalProps> = ({
  isOpen,
  onClose,
  groupId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'discussion',
    images: [] as string[],
    tags: [] as string[],
    is_cross_posted: false
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/groups/${groupId}/posts`, data);
    },
    onSuccess: () => {
      toast({
        title: "Post created successfully!",
        description: "Your post is now live in the group.",
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      post_type: 'discussion',
      images: [],
      tags: [],
      is_cross_posted: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something for your post.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!createPostMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const addImage = (url: string) => {
    if (url && !formData.images.includes(url)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url].slice(0, 4) // Max 4 images
      }));
    }
  };

  const removeImage = (urlToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(url => url !== urlToRemove)
    }));
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

  const selectedPostType = POST_TYPES.find(type => type.value === formData.post_type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedPostType && <selectedPostType.icon className="w-5 h-5 text-blue-600" />}
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <Label>Post Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {POST_TYPES.map(type => {
                const IconComponent = type.icon;
                return (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      formData.post_type === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, post_type: type.value }))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-4 h-4 ${
                          formData.post_type === type.value ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Title (optional for some types) */}
          <div>
            <Label htmlFor="title">
              Title {formData.post_type === 'announcement' && '*'}
              <span className="text-gray-500 text-sm ml-1">(optional)</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={
                formData.post_type === 'question' 
                  ? "What's your question?" 
                  : formData.post_type === 'announcement'
                  ? "Important: Group announcement"
                  : "Give your post a title..."
              }
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={
                formData.post_type === 'question'
                  ? "Describe your question in detail..."
                  : formData.post_type === 'photo'
                  ? "Tell us about these photos..."
                  : "Share your thoughts with the group..."
              }
              maxLength={2000}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Images */}
          <div>
            <Label>Images (optional)</Label>
            <div className="mt-2 space-y-3">
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.images.length < 4 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addImage(input.value.trim());
                        input.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                      if (input) {
                        addImage(input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Add up to 4 images by pasting URLs
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (optional)</Label>
            <div className="mt-2 space-y-2">
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      #{tag}
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
              )}
              
              {formData.tags.length < 5 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addTag(input.value.trim().replace('#', ''));
                        input.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                      if (input) {
                        addTag(input.value.trim().replace('#', ''));
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Add up to 5 tags to help categorize your post
              </p>
            </div>
          </div>

          {/* Cross-posting option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cross-post"
              checked={formData.is_cross_posted}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_cross_posted: !!checked }))
              }
            />
            <Label htmlFor="cross-post" className="text-sm">
              Also share on global feed (cross-post)
            </Label>
          </div>

          {/* Preview */}
          {formData.content && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="space-y-2">
                  {formData.title && (
                    <h4 className="font-medium">{formData.title}</h4>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {formData.content}
                  </p>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map(tag => (
                        <span key={tag} className="text-xs text-blue-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
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
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPostMutation.isPending || !formData.content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupPostModal;