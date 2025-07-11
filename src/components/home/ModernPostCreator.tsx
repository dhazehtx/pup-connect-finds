
import React, { useState, useRef } from 'react';
import { X, Camera, Video, Upload, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ModernPostCreatorProps {
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

const ModernPostCreator = ({ onClose, onPostCreated }: ModernPostCreatorProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [postType, setPostType] = useState<'photo' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadImage } = useImageUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (type === 'photo' && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (type === 'video' && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    // File size validation
    const maxSize = type === 'video' ? 200 * 1024 * 1024 : 10 * 1024 * 1024; // 200MB for video, 10MB for image
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select a ${type} smaller than ${type === 'video' ? '200MB' : '10MB'}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPostType(type);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCreatePost = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Missing information",
        description: "Please select a file and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImage(selectedFile, `post-${Date.now()}`);
      
      if (!uploadedUrl) {
        throw new Error('Failed to upload file');
      }

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

  const triggerFileUpload = (type: 'photo' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'photo' ? 'image/*' : 'video/*';
      fileInputRef.current.onchange = (e) => handleFileSelect(e as any, type);
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPostType(null);
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
      <Card className="w-full max-w-lg mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <CardContent className="p-6">
          {!selectedFile ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Share a moment with your community
              </p>
              
              {/* Photo Button */}
              <Button
                onClick={() => triggerFileUpload('photo')}
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Share Photo</div>
                    <div className="text-sm opacity-90">Upload from gallery or camera</div>
                  </div>
                </div>
              </Button>
              
              {/* Video Button */}
              <Button
                onClick={() => triggerFileUpload('video')}
                className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">Share Video</div>
                    <div className="text-sm opacity-90">Upload video moments</div>
                  </div>
                </div>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                {postType === 'photo' ? (
                  <img
                    src={previewUrl!}
                    alt="Post preview"
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl!}
                    className="w-full h-64 object-cover"
                    controls
                    playsInline
                  />
                )}
                <Button
                  onClick={removeFile}
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3 rounded-full"
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
                className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button 
                  onClick={removeFile} 
                  variant="outline" 
                  className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  Change Media
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sharing...
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

export default ModernPostCreator;
