
import React, { useState } from 'react';
import { Camera, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialPostCreatorProps {
  onPostCreated?: () => void;
  className?: string;
}

const SocialPostCreator = ({ onPostCreated, className }: SocialPostCreatorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = (file: File, type: 'image' | 'video') => {
    if (type === 'image') {
      setImageFile(file);
      setVideoFile(null);
    } else {
      setVideoFile(file);
      setImageFile(null);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setImageFile(null);
    setVideoFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('dog-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('dog-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!caption.trim() && !imageFile && !videoFile)) return;

    setLoading(true);
    try {
      let imageUrl = null;
      let videoUrl = null;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }
      if (videoFile) {
        videoUrl = await uploadFile(videoFile);
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          caption: caption.trim() || null,
          image_url: imageUrl,
          video_url: videoUrl,
          post_type: 'profile'
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });

      // Reset form
      setCaption('');
      clearMedia();
      onPostCreated?.();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[100px] resize-none"
          />

          {previewUrl && (
            <div className="relative">
              {imageFile && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
              {videoFile && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-64 rounded-lg"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearMedia}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileSelect(file, 'image');
                  };
                  input.click();
                }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileSelect(file, 'video');
                  };
                  input.click();
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>

            <Button
              type="submit"
              disabled={loading || (!caption.trim() && !imageFile && !videoFile)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SocialPostCreator;
