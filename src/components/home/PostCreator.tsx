
import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

interface PostCreatorProps {
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

const PostCreator = ({ onClose, onPostCreated }: PostCreatorProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadImage } = useImageUpload();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCreatePost = async () => {
    if (!selectedImage || !user) {
      toast({
        title: "Missing information",
        description: "Please select an image and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload image
      const uploadedUrl = await uploadImage(selectedImage, `post-${Date.now()}`);
      
      if (!uploadedUrl) {
        throw new Error('Failed to upload image');
      }

      // Create post object
      const newPost = {
        id: Date.now(),
        user: {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          location: 'Location',
          avatar: user.user_metadata?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
        },
        image: uploadedUrl,
        likes: 0,
        isLiked: false,
        caption: caption || '',
        timeAgo: 'now',
        likedBy: [],
        comments: []
      };

      onPostCreated(newPost);
      toast({
        title: "Post shared! 🎉",
        description: "Your post is now live!",
      });
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Upload failed",
        description: "Failed to create your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-background border-border shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-background pb-4">
          <CardTitle className="text-foreground text-xl font-semibold">Create Post</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-foreground hover:bg-muted rounded-full w-10 h-10"
          >
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Image Upload Area */}
          {!previewUrl ? (
            <div className="space-y-4">
              <Button
                onClick={triggerImageUpload}
                disabled={isUploading}
                className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 min-h-[72px] shadow-lg rounded-xl"
                size="lg"
              >
                <div className="flex items-center space-x-4 w-full">
                  <div className="p-3 bg-primary-foreground/20 rounded-xl">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-lg">Upload Photo</div>
                    <div className="text-sm opacity-90 mt-1">Camera, screenshots, gallery</div>
                  </div>
                </div>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Post preview"
                  className="w-full h-64 object-cover rounded-lg border border-border"
                />
                <Button
                  onClick={removeImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Caption Input */}
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={3}
                className="bg-background border-border text-foreground focus:border-primary resize-none"
              />

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  onClick={removeImage} 
                  variant="outline" 
                  className="flex-1 bg-background border-border text-foreground hover:bg-muted"
                >
                  Change Photo
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isUploading}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Share Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostCreator;
