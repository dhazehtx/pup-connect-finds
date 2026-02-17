
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Upload, X, Image, Video } from 'lucide-react';

interface CreatePostFormProps {
  onClose?: () => void;
  onSubmit?: () => void;
}

const CreatePostForm = ({ onClose, onSubmit }: CreatePostFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { upload, uploading, progress } = useMediaUpload();
  const [caption, setCaption] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024;
      
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

    const newFiles = [...mediaFiles, ...validFiles].slice(0, 5);
    setMediaFiles(newFiles);

    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setMediaPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeFile = (index: number) => {
    if (mediaPreviews[index]) {
      URL.revokeObjectURL(mediaPreviews[index]);
    }
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
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
    
    try {
      const postRes = await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: caption.trim(),
          title: caption.trim().substring(0, 100),
        }),
      });
      const postData = await postRes.json();
      const postId = postData.id;

      if (postId && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          await upload(file, {
            bucket: 'posts',
            kind: 'post',
            parentId: postId,
          });
        }
      }

      toast({
        title: "Post created!",
        description: "Your post has been published to your profile",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setCaption('');
      setMediaFiles([]);
      mediaPreviews.forEach(p => URL.revokeObjectURL(p));
      setMediaPreviews([]);
      onSubmit?.();
      onClose?.();
    } catch (error: any) {
      toast({
        title: "Failed to create post",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || uploading;

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

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind? Share something about your pup or the pet community..."
            rows={3}
            className="resize-none"
          />

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
                disabled={isSubmitting}
              />
            </div>

            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaPreviews.map((previewUrl, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {mediaFiles[index]?.type.startsWith('image/') ? (
                        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
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
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Uploading media... {progress}%</p>
                <Progress value={progress} className="w-full h-1.5" />
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Your post will be visible on your profile and may appear in community feeds.
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || (!caption.trim() && mediaFiles.length === 0)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Publishing...' : 'Share Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
