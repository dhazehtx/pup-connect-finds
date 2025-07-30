import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Video, 
  X, 
  Upload,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImageCarousel from './ImageCarousel';

interface CreatePostModalProps {
  trigger: React.ReactNode;
  onCreatePost: (postData: any) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  trigger,
  onCreatePost
}) => {
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'reel'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload up to 10 images per post",
        variant: "destructive"
      });
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    setPostType('image');

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleVideoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video files must be less than 100MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedVideo(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    
    // Determine if it's a reel based on duration (will be implemented with video metadata)
    setPostType('video');
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
    
    if (newImages.length === 0) {
      setPostType('text');
    }
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setSelectedVideo(null);
    setVideoPreviewUrl('');
    setPostType('text');
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace('#', '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addHashtag();
    }
  };

  const extractHashtagsFromText = (text: string) => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.replace('#', ''));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0 && !selectedVideo) {
      toast({
        title: "Content required",
        description: "Please add some content, images, or a video",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Extract hashtags from content
      const contentHashtags = extractHashtagsFromText(content);
      const allHashtags = [...new Set([...hashtags, ...contentHashtags])];

      const postData = {
        title: title.trim(),
        content: content.trim(),
        caption: caption.trim(),
        post_type: postType,
        hashtags: allHashtags,
        images: selectedImages,
        video: selectedVideo
      };

      await onCreatePost(postData);
      
      // Reset form
      setTitle('');
      setContent('');
      setCaption('');
      setSelectedImages([]);
      setSelectedVideo(null);
      setImagePreviewUrls([]);
      setVideoPreviewUrl('');
      setHashtags([]);
      setHashtagInput('');
      setPostType('text');
      setOpen(false);

      toast({
        title: "Post created!",
        description: "Your post has been published successfully"
      });

    } catch (error) {
      toast({
        title: "Error creating post",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={postType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPostType('text')}
            >
              Text
            </Button>
            <Button
              variant={postType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => imageInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-1" />
              Images
            </Button>
            <Button
              variant={postType === 'video' || postType === 'reel' ? 'default' : 'outline'}
              size="sm"
              onClick={() => videoInputRef.current?.click()}
            >
              <Video className="w-4 h-4 mr-1" />
              Video
            </Button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelection}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelection}
            className="hidden"
          />

          {/* Title */}
          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              className="mt-1"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">
              {postType === 'video' || postType === 'reel' ? 'Caption' : 'Content'}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'video' || postType === 'reel' 
                  ? "Write a caption for your video... Use #hashtags to reach more people"
                  : "What's on your mind? Share your thoughts or ask a question..."
              }
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Image Preview */}
          {imagePreviewUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Images ({selectedImages.length}/10)</Label>
              <div className="grid grid-cols-2 gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {selectedImages.length < 10 && (
                  <Button
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    className="h-32 border-dashed border-2 flex flex-col items-center justify-center"
                  >
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add More</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Video Preview */}
          {videoPreviewUrl && (
            <div className="space-y-2">
              <Label>Video</Label>
              <div className="relative">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full max-h-64 rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeVideo}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex gap-2">
              <Input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyPress}
                placeholder="Add hashtags..."
                className="flex-1"
              />
              <Button onClick={addHashtag} size="sm">
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    #{tag}
                    <X
                      className="w-3 h-3 ml-1"
                      onClick={() => removeHashtag(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;