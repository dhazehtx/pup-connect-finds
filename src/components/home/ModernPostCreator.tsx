
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
      <Card className="w-full max-w-lg mx-auto bg-white rounded-3xl overflow-hidden border-0" 
            style={{ 
              boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15), 0px 4px 12px rgba(0, 0, 0, 0.1)' 
            }}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2C3EDC] to-[#00B7FF] flex items-center justify-center text-white font-bold text-xl">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
              <p className="text-sm text-gray-500 mt-1">Share a moment with your community</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 w-12 h-12"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <CardContent className="p-8">
          {!selectedFile ? (
            <div className="space-y-8">
              {/* What's on your mind section */}
              <div className="text-center">
                <p className="text-xl text-gray-800 font-semibold mb-3">What's on your mind, {userName.split(' ')[0]}?</p>
                <p className="text-gray-500">Share a photo or video to get started</p>
              </div>
              
              {/* Upload Options */}
              <div className="space-y-6">
                {/* Photo Button - Royal Blue Gradient */}
                <button
                  onClick={() => triggerFileUpload('photo')}
                  className="w-full h-24 bg-gradient-to-r from-[#2C3EDC] to-[#00B7FF] text-white rounded-3xl transform transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                  style={{ 
                    boxShadow: 'rgba(44, 62, 220, 0.15) 0px 4px 10px',
                    borderRadius: '24px'
                  }}
                >
                  <div className="flex items-center justify-center space-x-5">
                    <div className="p-4 bg-white/20 rounded-2xl">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xl">Add Photo</div>
                      <div className="text-sm opacity-90 mt-1">Share a beautiful moment</div>
                    </div>
                  </div>
                </button>
                
                {/* Video Button - Light Blue Gradient with Royal Blue Text */}
                <button
                  onClick={() => triggerFileUpload('video')}
                  className="w-full h-24 bg-gradient-to-r from-[#EAF0FF] to-[#DCE6FF] text-[#2C3EDC] rounded-3xl transform transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-[#2C3EDC]/10"
                  style={{ 
                    boxShadow: 'rgba(44, 62, 220, 0.08) 0px 4px 10px',
                    borderRadius: '24px'
                  }}
                >
                  <div className="flex items-center justify-center space-x-5">
                    <div className="p-4 bg-[#2C3EDC]/10 rounded-2xl">
                      <Video className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-xl">Add Video</div>
                      <div className="text-sm opacity-80 mt-1">Capture life in motion</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Media Preview */}
              <div className="relative rounded-3xl overflow-hidden bg-gray-100 shadow-inner">
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
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Caption Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Write a caption</label>
                  <span className="text-xs text-gray-400">{caption.length}/500</span>
                </div>
                <div className="relative">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 500))}
                    placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
                    rows={4}
                    className="resize-none border-gray-200 focus:border-[#2C3EDC] focus:ring-[#2C3EDC] rounded-2xl text-base placeholder-gray-400 pr-12"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={removeFile} 
                  variant="outline" 
                  className="flex-1 rounded-2xl border-gray-200 hover:bg-gray-50 h-14 font-semibold"
                >
                  Change Media
                </Button>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-[#2C3EDC] to-[#00B7FF] hover:from-[#2432C4] hover:to-[#0099E0] text-white rounded-2xl h-14 font-bold"
                  style={{ 
                    boxShadow: 'rgba(44, 62, 220, 0.15) 0px 4px 10px'
                  }}
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
