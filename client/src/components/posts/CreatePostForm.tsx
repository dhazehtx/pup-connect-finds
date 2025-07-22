
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video } from 'lucide-react';

interface CreatePostFormProps {
  onClose?: () => void;
  onSubmit?: () => void;
}

const CreatePostForm = ({ onClose, onSubmit }: CreatePostFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select only images or videos",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: "Please select files under 10MB",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setMediaFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!caption.trim() && mediaFiles.length === 0) {
      toast({
        title: "Content required",
        description: "Please add a caption or media to your post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate post creation
    setTimeout(() => {
      toast({
        title: "Post created!",
        description: "Your post has been published to your profile",
      });
      setLoading(false);
      onSubmit?.();
      onClose?.();
    }, 2000);
  };

  return (
    <Card className="border-blue-200 shadow-sm max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Post</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500">Share an update</p>
            </div>
          </div>

          {/* Caption */}
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind? Share something about your pup or the pet community..."
            rows={3}
            className="resize-none"
          />

          {/* Media Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Photos/Videos</span>
                </div>
              </label>
              <input
                id="media-upload"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Your post will be visible on your profile and may appear in community feeds.
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading || (!caption.trim() && mediaFiles.length === 0)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Publishing...' : 'Share Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
