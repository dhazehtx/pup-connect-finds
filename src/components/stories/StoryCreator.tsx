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
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { validateImageFile } from '@/utils/imageOptimization';
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
        // Basic validation for file type only - remove size restrictions since we have cropping
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: "Please upload JPEG, PNG, WebP, or GIF images.",
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Check for reasonable file size limit (50MB) to prevent browser issues
        const maxFileSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxFileSize) {
          toast({
            title: "File Too Large",
            description: "File size must be less than 50MB.",
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Load image to verify it's valid, but don't restrict dimensions
        const img = new Image();
        img.onload = () => {
          // Image is valid, proceed with setting it
          setSelectedFile(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          setCreationMode('edit-image');
          URL.revokeObjectURL(img.src);
        };
        
        img.onerror = () => {
          toast({
            title: "Invalid Image",
            description: "Unable to load the selected image. Please try another file.",
            variant: "destructive",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };
        
        img.src = URL.createObjectURL(file);
      } else {
        // For video files, check basic size
        const maxVideoSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxVideoSize) {
          toast({
            title: "Video Size Too Big",
            description: "Video file is too large. Maximum allowed size is 50MB.",
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
        title: "Authentication Required",
        description: "Please sign in to create stories",
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
      title: "Story Created",
      description: "Your story has been added successfully!",
    });
    onClose();
  };

  const handleUploadStory = () => {
    if (!selectedFile || !previewUrl) return;

    // In a real implementation, you would upload the file to storage
    const content = {
      type: selectedFile.type.startsWith('video/') ? 'video' as const : 'image' as const,
      url: previewUrl
    };

    handleCreateStory(content);
  };

  const handleImageSave = (canvas: HTMLCanvasElement) => {
    // Convert canvas to blob and create story
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const content = {
          type: 'image' as const,
          url: url
        };
        handleCreateStory(content);
      }
    }, 'image/jpeg', 0.9);
  };

  const resetSelection = () => {
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Your Story</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {creationMode === 'select' && (
            <div className="space-y-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start"
                variant="outline"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              
              <Button
                onClick={() => videoInputRef.current?.click()}
                className="w-full justify-start"
                variant="outline"
              >
                <Video className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
              
              <Button
                onClick={() => setCreationMode('ai-generate')}
                className="w-full justify-start"
                variant="outline"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'image')}
              />
              
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'video')}
              />
            </div>
          )}

          {creationMode === 'upload' && previewUrl && (
            <div className="space-y-3">
              <div className="relative">
                {selectedFile?.type.startsWith('video/') ? (
                  <video
                    src={previewUrl}
                    className="w-full h-64 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Story preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={resetSelection} 
                  variant="outline" 
                  className="flex-1 border-2 border-gray-500 text-gray-700 hover:bg-gray-100"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleUploadStory} 
                  className="flex-1 border-2 border-gray-500 bg-gray-600 text-white hover:bg-gray-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Post Story
                </Button>
              </div>
            </div>
          )}

          {creationMode === 'edit-image' && previewUrl && (
            <InteractiveImageEditor
              imageUrl={previewUrl}
              onSave={handleImageSave}
              onCancel={resetSelection}
            />
          )}

          {creationMode === 'ai-generate' && (
            <div className="space-y-3">
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe what you want to generate... (e.g., 'A golden retriever playing in a sunny garden')"
                rows={3}
              />
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => generateAIContent('image')}
                  disabled={isGenerating}
                  className="flex-1"
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
                  className="flex-1"
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
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryCreator;
