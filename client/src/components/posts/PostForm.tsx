
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { Camera, X } from 'lucide-react';

interface PostFormProps {
  listingId?: string;
  onPostCreated?: () => void;
}

const PostForm = ({ listingId, onPostCreated }: PostFormProps) => {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadImage, uploading } = useUnifiedFileUpload({
    bucket: 'posts',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || (!caption.trim() && !selectedFile)) {
      toast({
        title: "Invalid Post",
        description: "Please add a caption or image",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      let mediaUrl = '';
      
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          mediaUrl = uploadedUrl;
        }
      }

      const postData = {
        user_id: user.id,
        caption: caption.trim() || null,
        image_url: selectedFile?.type.startsWith('image/') ? mediaUrl : null,
        video_url: selectedFile?.type.startsWith('video/') ? mediaUrl : null,
        listing_id: listingId || null,
        post_type: listingId ? 'listing' : 'profile'
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) throw error;

      toast({
        title: "Post Created! ✨",
        description: "Your post has been shared successfully",
      });

      // Reset form
      setCaption('');
      removeFile();
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-blue-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <Textarea
                placeholder={listingId ? "Share an update about this listing..." : "What's on your mind?"}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[80px] border-gray-300 resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">{caption.length}/2000 characters</p>
            </div>
          </div>

          {previewUrl && (
            <div className="relative">
              {selectedFile?.type.startsWith('video/') ? (
                <video 
                  src={previewUrl} 
                  className="w-full max-h-64 object-cover rounded-lg"
                  controls
                />
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                onChange={handleFileSelect}
                disabled={creating || uploading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                disabled={creating || uploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                Add Photo/Video
              </Button>
            </label>

            <Button
              type="submit"
              disabled={creating || uploading || (!caption.trim() && !selectedFile)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {creating || uploading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostForm;
