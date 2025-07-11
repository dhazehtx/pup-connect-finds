
import React, { useState, useRef } from 'react';
import { X, Camera, Video, Upload, Loader2, Heart, Smile } from 'lucide-react';
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

    const maxSize = type === 'video' ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <p className="text-sm text-gray-500">Share a moment with your community</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 w-10 h-10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <CardContent className="p-6">
          {!selectedFile ? (
            <div className="space-y-6">
              {/* What's on your mind section */}
              <div className="text-center mb-8">
                <p className="text-lg text-gray-700 font-medium mb-2">What's on your mind, {userName.split(' ')[0]}?</p>
                <p className="text-sm text-gray-500">Share a photo or video to get started</p>
              </div>
              
              {/* Upload Options */}
              <div className="space-y-4">
                {/* Photo Button */}
                <Button
                  onClick={() => triggerFileUpload('photo')}
                  className="w-full h-20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                  size="lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Add Photo</div>
                      <div className="text-sm opacity-90">Share a beautiful moment</div>
                    </div>
                  </div>
                </Button>
                
                {/* Video Button */}
                <Button
                  onClick={() => triggerFileUpload('video')}
                  className="w-full h-20 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-2xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                  size="lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Video className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">Add Video</div>
                      <div className="text-sm opacity-90">Capture life in motion</div>
                    </div>
                  </div>
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Media Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                {postType === 'photo' ? (
                  <img
                    src={previewUrl!}
                    alt="Post preview"
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl!}
                    className="w-full h-80 object-cover"
                    controls
                    playsInline
                  />
                )}
                <Button
                  onClick={removeFile}
                  size="sm"
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Caption Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Write a caption</label>
                  <span className="text-xs text-gray-400">{caption.length}/500</span>
                </div>
                <div className="relative">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 500))}
                    placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
                    rows={4}
                    className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-base placeholder-gray-400"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button 
                  onClick={removeFile} 
                  variant="outline" 
                  className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50 h-12"
                >
                  Change Media
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg h-12 font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
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
