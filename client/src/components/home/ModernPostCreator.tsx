import { useState, useRef, useCallback } from 'react';
import { X, Camera, Video, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/hooks/useCreatePost';
import ImageCropper from '@/components/profile/ImageCropper';
import { parseApiErrorMessage } from '@/lib/parseApiError';

interface ModernPostCreatorProps {
  onClose: () => void;
  onPostCreated: (post: unknown) => void;
}

const ModernPostCreator = ({ onClose, onPostCreated }: ModernPostCreatorProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState<'photo' | 'video' | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingPhotoType, setPendingPhotoType] = useState<'photo' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { createPost, uploading } = useCreatePost();

  const closeCropper = useCallback(() => {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingPhotoType(null);
  }, []);

  const applyFile = useCallback((file: File, type: 'photo' | 'video') => {
    setSelectedFile(file);
    setPostType(type);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (type === 'photo' && !isImage) {
      toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (type === 'video' && !isVideo) {
      toast({ title: 'Invalid file type', description: 'Please select a video file', variant: 'destructive' });
      return;
    }

    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Please select a ${type} smaller than ${type === 'video' ? '100MB' : '10MB'}`,
        variant: 'destructive',
      });
      return;
    }

    if (type === 'photo') {
      setPendingPhotoType('photo');
      setCropSrc(URL.createObjectURL(file));
    } else {
      applyFile(file, 'video');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!selectedFile || !user || !postType) {
      toast({
        title: 'Missing information',
        description: "Please select a file and ensure you're logged in",
        variant: 'destructive',
      });
      return;
    }

    try {
      const { post, mediaUrl } = await createPost({
        file: selectedFile,
        caption,
        userId: user.id,
        postType,
      });

      toast({ title: 'Post created!', description: 'Your post has been shared successfully' });

      const newPost = {
        id: (post as { id: string }).id,
        user: {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          location: 'Location',
          avatar: user.user_metadata?.avatar_url || '',
        },
        image: mediaUrl,
        likes: 0,
        isLiked: false,
        caption: caption || '',
        timeAgo: 'now',
        likedBy: [],
        comments: [],
      };

      onPostCreated(newPost);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      const parsed = parseApiErrorMessage(error);
      toast({
        title: 'Upload failed',
        description: parsed.code
          ? `${parsed.message} (${parsed.code})`
          : parsed.message || 'Failed to create your post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const triggerFileUpload = (type: 'photo' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'photo' ? 'image/*' : 'video/*';
      fileInputRef.current.onchange = (e) => handleFileSelect(e as React.ChangeEvent<HTMLInputElement>, type);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {cropSrc && pendingPhotoType === 'photo' && (
        <ImageCropper
          src={cropSrc}
          isOpen
          onClose={closeCropper}
          aspect={4 / 5}
          circularCrop={false}
          title="Crop your post photo"
          outputFileName="post-photo.jpg"
          onCropComplete={(file) => {
            closeCropper();
            applyFile(file, 'photo');
          }}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
        <Card
          className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border-0 bg-white"
          style={{ boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15), 0px 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2C3EDC] to-[#00B7FF] text-xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
                <p className="mt-1 text-sm text-gray-500">Share a moment with your community</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <CardContent className="p-8">
            {!selectedFile ? (
              <div className="space-y-8">
                <div className="text-center">
                  <p className="mb-3 text-xl font-semibold text-gray-800">
                    What&apos;s on your mind, {userName.split(' ')[0]}?
                  </p>
                  <p className="text-gray-500">Share a photo or video to get started</p>
                </div>

                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => triggerFileUpload('photo')}
                    className="h-24 w-full transform rounded-3xl border-0 bg-gradient-to-r from-[#2C3EDC] to-[#00B7FF] text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center space-x-5">
                      <div className="rounded-2xl bg-white/20 p-4">
                        <Camera className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold">Add Photo</div>
                        <div className="mt-1 text-sm opacity-90">Crop and share a moment</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerFileUpload('video')}
                    className="h-24 w-full transform rounded-3xl border-2 border-[#2C3EDC]/10 bg-gradient-to-r from-[#EAF0FF] to-[#DCE6FF] text-[#2C3EDC] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-center space-x-5">
                      <div className="rounded-2xl bg-[#2C3EDC]/10 p-4">
                        <Video className="h-8 w-8" />
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-bold">Add Video</div>
                        <div className="mt-1 text-sm opacity-80">Capture life in motion</div>
                      </div>
                    </div>
                  </button>
                </div>

                <input ref={fileInputRef} type="file" className="hidden" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl bg-gray-100 shadow-inner">
                  {postType === 'photo' ? (
                    <img src={previewUrl!} alt="Post preview" className="h-80 w-full object-cover" />
                  ) : (
                    <video src={previewUrl!} className="h-80 w-full object-cover" controls playsInline />
                  )}
                  <Button
                    type="button"
                    onClick={removeFile}
                    size="sm"
                    className="absolute right-4 top-4 h-10 w-10 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Write a caption</label>
                    <span className="text-xs text-gray-400">{caption.length}/500</span>
                  </div>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 500))}
                    placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
                    rows={4}
                    className="resize-none rounded-2xl border-gray-200 pr-12 text-base placeholder:text-gray-400 focus:border-[#2C3EDC] focus:ring-[#2C3EDC]"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={removeFile}
                    variant="outline"
                    className="h-14 flex-1 rounded-2xl border-2 border-slate-300 bg-white font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Change Media
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={uploading}
                    className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-[#2C3EDC] to-[#00B7FF] font-bold text-white hover:from-[#2432C4] hover:to-[#0099E0]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
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
    </>
  );
};

export default ModernPostCreator;
