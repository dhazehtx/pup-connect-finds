
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Send,
  Wand2,
  Video,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { useToast } from '@/hooks/use-toast';

interface Story {
  id: string | number;
  username: string;
  avatar: string | null;
  content: {
    type: 'image' | 'video' | 'ai-generated';
    url: string;
    prompt?: string;
  }[];
  timestamp: string;
}

interface StoryViewerProps {
  stories: Story[];
  currentStoryIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoryViewer = ({ 
  stories, 
  currentStoryIndex, 
  onClose, 
  onNext, 
  onPrevious 
}: StoryViewerProps) => {
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const { generateAIResponse } = useEnhancedAI();
  const { toast } = useToast();

  const currentStory = stories[currentStoryIndex];
  const currentContent = currentStory?.content[currentContentIndex];

  // Auto-progress story content
  useEffect(() => {
    if (!currentContent) return;

    const duration = currentContent.type === 'video' ? 15000 : 5000; // 15s for video, 5s for image
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextContent();
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentContentIndex, currentStory]);

  const handleNextContent = () => {
    if (currentContentIndex < currentStory.content.length - 1) {
      setCurrentContentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onNext();
      setCurrentContentIndex(0);
      setProgress(0);
    }
  };

  const handlePreviousContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      onPrevious();
      setProgress(0);
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
      // For demo purposes, we'll generate an image description
      const response = await generateAIResponse(
        `Generate a detailed description for a ${type} about: ${aiPrompt}. Make it engaging for a social media story.`,
        { type: 'general' }
      );

      // In a real implementation, you would call an image/video generation API here
      // For now, we'll use a placeholder with the generated description
      const newContent = {
        type: 'ai-generated' as const,
        url: type === 'image' 
          ? `https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop`
          : `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`,
        prompt: aiPrompt
      };

      // Add to current story (in a real app, this would save to backend)
      currentStory.content.push(newContent);
      
      toast({
        title: "Content Generated",
        description: `AI ${type} has been added to your story!`,
      });

      setAiPrompt('');
      setShowAIGenerator(false);
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

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {currentStory.content.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: index === currentContentIndex ? `${progress}%` : 
                       index < currentContentIndex ? '100%' : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Story header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10 mt-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {currentStory.avatar ? (
              <img src={currentStory.avatar} alt={currentStory.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-xs">{currentStory.username[0]}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{currentStory.username}</p>
            <p className="text-gray-300 text-xs">{currentStory.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className="text-white hover:bg-white/20"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Story content */}
      <div className="relative w-full max-w-md h-full flex items-center justify-center">
        <div 
          className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-pointer"
          onClick={handlePreviousContent}
        />
        <div 
          className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-pointer"
          onClick={handleNextContent}
        />
        
        {currentContent?.type === 'video' ? (
          <video 
            src={currentContent.url} 
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        ) : (
          <div className="relative w-full h-full">
            <img 
              src={currentContent?.url} 
              alt="Story content"
              className="w-full h-full object-cover"
            />
            {currentContent?.prompt && (
              <div className="absolute bottom-20 left-4 right-4">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  AI Generated: {currentContent.prompt}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* AI Generator Panel */}
      {showAIGenerator && (
        <div className="absolute bottom-20 left-4 right-4 bg-black/80 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-3">Generate AI Content</h3>
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe what you want to generate..."
            className="mb-3 bg-white/10 text-white placeholder-gray-300 border-gray-600"
            rows={2}
          />
          <div className="flex space-x-2">
            <Button
              onClick={() => generateAIContent('image')}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Video className="w-4 h-4 mr-2" />
              )}
              Generate Video
            </Button>
          </div>
        </div>
      )}

      {/* Story interactions */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 flex-1 max-w-xs">
          <Input 
            placeholder="Send message..."
            className="bg-transparent border-gray-600 text-white placeholder-gray-400"
          />
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
