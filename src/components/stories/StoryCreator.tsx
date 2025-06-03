
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Camera, 
  Video, 
  Wand2, 
  Upload,
  Loader2,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import InteractiveImageEditor from './InteractiveImageEditor';

interface StoryCreatorProps {
  onClose: () => void;
  onStoryCreated: (story: any) => void;
}

const StoryCreator = ({ onClose, onStoryCreated }: StoryCreatorProps) => {
  const [creationMode, setCreationMode] = useState<'select' | 'upload' | 'ai-generate' | 'edit-image'>('select');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { generateAIResponse } = useEnhancedAI();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'image') {
        // Accept any image format including HEIC (iPhone photos)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
        const isValidType = allowedTypes.includes(file.type.toLowerCase()) || file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|heic|heif)$/);
        
        if (!isValidType) {
          toast({
            title: "Invalid File Type",
            description: "Please upload image files (JPG, PNG, WebP, GIF, HEIC).",
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Check for reasonable file size limit (200MB) for high-res phone photos
        const maxFileSize = 200 * 1024 * 1024; // 200MB
        if (file.size > maxFileSize) {
          toast({
            title: "File Too Large",
            description: "Image must be less than 200MB.",
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Load image to verify it's valid
        const img = new Image();
        img.onload = () => {
          console.log(`Phone image loaded: ${img.width}x${img.height} pixels`);
          setSelectedFile(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          setCreationMode('edit-image');
          URL.revokeObjectURL(img.src);
          
          toast({
            title: "Image Ready",
            description: "Tap and drag to position your photo perfectly!",
          });
        };
        
        img.onerror = () => {
          toast({
            title: "Invalid Image",
            description: "Unable to load the image. Try another photo.",
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };
        
        img.src = URL.createObjectURL(file);
      } else {
        // Video handling
        const maxVideoSize = 200 * 1024 * 1024; // 200MB for videos
        if (file.size > maxVideoSize) {
          toast({
            title: "Video Too Large",
            description: "Video must be less than 200MB.",
            variant: "destructive",
          });
          if (videoInputRef.current) {
            videoInputRef.current.value = '';
          }
          return;
        }
        
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setCreationMode('upload');
      }
    }
  };

  const generateAIContent = async (type: 'image' | 'video') => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate content",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // For demo purposes, we'll generate a description and use placeholder content
      const response = await generateAIResponse(
        `Generate a detailed description for a ${type} story about: ${aiPrompt}. Make it engaging for a social media story.`,
        { type: 'general' }
      );

      // In a real implementation, you would call an AI image/video generation API
      const placeholderUrl = type === 'image' 
        ? `https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop`
        : `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;

      const newStory = {
        type: 'ai-generated' as const,
        url: placeholderUrl,
        prompt: aiPrompt,
        description: response
      };

      handleCreateStory(newStory);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateStory = (content: any) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to share your story",
        variant: "destructive",
      });
      return;
    }

    const newStory = {
      id: Date.now(),
      username: user.email?.split('@')[0] || 'User',
      avatar: user.user_metadata?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`,
      content: [content],
      timestamp: 'now'
    };

    onStoryCreated(newStory);
    toast({
      title: "Story Shared! 🎉",
      description: "Your story is now live and visible to others!",
    });
    onClose();
  };

  const handleUploadStory = () => {
    if (!selectedFile || !previewUrl) return;

    const content = {
      type: selectedFile.type.startsWith('video/') ? 'video' as const : 'image' as const,
      url: previewUrl
    };

    handleCreateStory(content);
  };

  const handleImageSave = (canvas: HTMLCanvasElement) => {
    // Convert canvas to high-quality data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    console.log('Saving cropped story image');
    
    const content = {
      type: 'image' as const,
      url: dataUrl
    };
    
    handleCreateStory(content);
  };

  const resetSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setCreationMode('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      {creationMode === 'edit-image' && previewUrl ? (
        <div className="w-full h-full max-w-md mx-auto bg-background overflow-hidden">
          <InteractiveImageEditor
            imageUrl={previewUrl}
            onSave={handleImageSave}
            onCancel={resetSelection}
          />
        </div>
      ) : (
        <Card className="w-full h-full sm:h-auto sm:max-w-md bg-background border-border shadow-xl sm:rounded-lg overflow-auto">
          <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between border-b border-border bg-background">
            <CardTitle className="text-foreground text-lg font-semibold">Create Story</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-foreground hover:bg-muted rounded-full p-2">
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4 p-6">
            {creationMode === 'select' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground mb-2">Share Your Moment</h3>
                  <p className="text-sm text-muted-foreground">Upload photos or videos to share with your community</p>
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 min-h-[64px] shadow-sm rounded-xl"
                  size="lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-foreground/20 rounded-lg">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Upload Photo</div>
                      <div className="text-sm opacity-90">Screenshots, camera photos, gallery</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full justify-start bg-background border-2 border-border text-foreground hover:bg-muted min-h-[64px] shadow-sm rounded-xl"
                  variant="outline"
                  size="lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Upload Video</div>
                      <div className="text-sm opacity-70">Record or select from gallery</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setCreationMode('ai-generate')}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 min-h-[64px] shadow-sm rounded-xl"
                  size="lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Wand2 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">AI Generate</div>
                      <div className="text-sm opacity-90">Create with artificial intelligence</div>
                    </div>
                  </div>
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'video')}
                />
              </div>
            )}

            {creationMode === 'upload' && previewUrl && (
              <div className="space-y-4">
                <div className="relative">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={previewUrl}
                      className="w-full h-80 object-cover rounded-lg border border-border mx-auto"
                      controls
                    />
                  ) : (
                    <div className="bg-muted rounded-lg flex items-center justify-center p-4">
                      <img
                        src={previewUrl}
                        alt="Story preview"
                        className="max-w-full max-h-80 object-contain rounded-lg border border-border mx-auto"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={resetSelection} 
                    variant="outline" 
                    className="flex-1 bg-background border-border text-foreground hover:bg-muted min-h-[52px]"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleUploadStory} 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Share Story
                  </Button>
                </div>
              </div>
            )}

            {creationMode === 'ai-generate' && (
              <div className="space-y-4">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to generate... (e.g., 'A golden retriever playing in a sunny garden')"
                  rows={3}
                  className="bg-background border-border text-foreground focus:border-primary resize-none"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => generateAIContent('image')}
                    disabled={isGenerating}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[52px]"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 mr-2" />
                    )}
                    Generate Image
                  </Button>
                  
                  <Button
                    onClick={() => generateAIContent('video')}
                    disabled={isGenerating}
                    className="bg-background border-border text-foreground hover:bg-muted min-h-[52px]"
                    variant="outline"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4 mr-2" />
                    )}
                    Generate Video
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setCreationMode('select')} 
                  variant="ghost" 
                  className="w-full text-foreground hover:bg-muted min-h-[52px]"
                >
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoryCreator;
