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
import { useStoryUpload } from '@/hooks/useStoryUpload';
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
  const { uploadStoryImage, uploading } = useStoryUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      const imageUrl = await uploadStoryImage(file);
      if (imageUrl) {
        setSelectedFile(file);
        setPreviewUrl(imageUrl);
        setCreationMode('edit-image');
      }
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
  };

  // Mobile-optimized file input handlers
  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerVideoUpload = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
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
      const response = await generateAIResponse(
        `Generate a detailed description for a ${type} story about: ${aiPrompt}. Make it engaging for a social media story.`,
        { type: 'general' }
      );

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

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      {creationMode === 'edit-image' && previewUrl ? (
        <div className="w-full h-full">
          <InteractiveImageEditor
            imageUrl={previewUrl}
            onSave={handleImageSave}
            onCancel={resetSelection}
          />
        </div>
      ) : (
        <Card className="w-full h-full sm:h-auto sm:max-w-md mx-auto bg-background border-0 sm:border sm:border-border shadow-xl sm:rounded-lg overflow-auto">
          <CardHeader className="sticky top-0 z-10 flex flex-row items-center justify-between border-b border-border bg-background pb-4">
            <CardTitle className="text-foreground text-xl font-semibold">Create Story</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-foreground hover:bg-muted rounded-full w-10 h-10 touch-manipulation"
            >
              <X className="w-6 h-6" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6 pb-8">
            {creationMode === 'select' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Share Your Moment</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">Upload photos or videos to share with your community</p>
                </div>

                {/* Mobile-optimized buttons with larger touch targets */}
                <Button
                  onClick={triggerImageUpload}
                  disabled={uploading}
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 min-h-[72px] shadow-lg rounded-xl touch-manipulation transform active:scale-95 transition-all"
                  size="lg"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="p-3 bg-primary-foreground/20 rounded-xl">
                      {uploading ? (
                        <Loader2 className="w-7 h-7 animate-spin" />
                      ) : (
                        <Camera className="w-7 h-7" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-lg">Upload Photo</div>
                      <div className="text-sm opacity-90 mt-1">
                        {uploading ? 'Processing...' : 'Camera, screenshots, gallery'}
                      </div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={triggerVideoUpload}
                  className="w-full justify-start bg-background border-2 border-border text-foreground hover:bg-muted active:bg-muted/80 min-h-[72px] shadow-lg rounded-xl touch-manipulation transform active:scale-95 transition-all"
                  variant="outline"
                  size="lg"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="p-3 bg-muted rounded-xl">
                      <Video className="w-7 h-7" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-lg">Upload Video</div>
                      <div className="text-sm opacity-70 mt-1">Record or select from gallery</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setCreationMode('ai-generate')}
                  className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 min-h-[72px] shadow-lg rounded-xl touch-manipulation transform active:scale-95 transition-all"
                  size="lg"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Wand2 className="w-7 h-7" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-lg">AI Generate</div>
                      <div className="text-sm opacity-90 mt-1">Create with artificial intelligence</div>
                    </div>
                  </div>
                </Button>
                
                {/* Hidden file inputs - Fixed for proper library access */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                  multiple={false}
                />
                
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'video')}
                  multiple={false}
                />
              </div>
            )}

            {creationMode === 'upload' && previewUrl && (
              <div className="space-y-6">
                <div className="relative">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={previewUrl}
                      className="w-full h-80 object-cover rounded-xl border border-border mx-auto"
                      controls
                      playsInline
                    />
                  ) : (
                    <div className="bg-muted rounded-xl flex items-center justify-center p-4">
                      <img
                        src={previewUrl}
                        alt="Story preview"
                        className="max-w-full max-h-80 object-contain rounded-xl border border-border mx-auto"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    onClick={resetSelection} 
                    variant="outline" 
                    className="flex-1 bg-background border-border text-foreground hover:bg-muted active:bg-muted/80 min-h-[56px] touch-manipulation transform active:scale-95 transition-all"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleUploadStory} 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 min-h-[56px] touch-manipulation transform active:scale-95 transition-all"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Share Story
                  </Button>
                </div>
              </div>
            )}

            {creationMode === 'ai-generate' && (
              <div className="space-y-6">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to generate... (e.g., 'A golden retriever playing in a sunny garden')"
                  rows={4}
                  className="bg-background border-border text-foreground focus:border-primary resize-none text-base p-4 rounded-xl touch-manipulation"
                />
                
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    onClick={() => generateAIContent('image')}
                    disabled={isGenerating}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 min-h-[56px] touch-manipulation transform active:scale-95 transition-all"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5 mr-2" />
                    )}
                    Generate Image
                  </Button>
                  
                  <Button
                    onClick={() => generateAIContent('video')}
                    disabled={isGenerating}
                    className="bg-background border-border text-foreground hover:bg-muted active:bg-muted/80 min-h-[56px] touch-manipulation transform active:scale-95 transition-all"
                    variant="outline"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Video className="w-5 h-5 mr-2" />
                    )}
                    Generate Video
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setCreationMode('select')} 
                  variant="ghost" 
                  className="w-full text-foreground hover:bg-muted active:bg-muted/80 min-h-[56px] touch-manipulation transform active:scale-95 transition-all"
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
