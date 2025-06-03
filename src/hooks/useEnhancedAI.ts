
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface EnhancedAIOptions {
  type?: 'general' | 'listing' | 'breeder' | 'message' | 'image_analysis' | 'search' | 'support';
  maxTokens?: number;
  imageUrl?: string;
  searchQuery?: string;
  chatContext?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const useEnhancedAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateAIResponse = async (prompt: string, options: EnhancedAIOptions = {}) => {
    if (!prompt.trim() && !options.imageUrl && !options.searchQuery) {
      toast({
        title: "Error",
        description: "Please provide a prompt, image, or search query",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI response for demo purposes
      const mockResponse = `AI Response: ${prompt} (${options.type || 'general'} mode)`;
      setGeneratedText(mockResponse);

      // Update chat history for support conversations
      if (options.type === 'support') {
        const newHistory = [
          ...chatHistory,
          { role: 'user' as const, content: prompt, timestamp: new Date() },
          { role: 'assistant' as const, content: mockResponse, timestamp: new Date() }
        ];
        setChatHistory(newHistory.slice(-10));
      }
      
      toast({
        title: "Success",
        description: "AI response generated successfully!",
      });

      return mockResponse;
    } catch (error) {
      console.error('Enhanced AI error:', error);
      toast({
        title: "AI Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate AI response',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeImage = async (imageUrl: string, prompt?: string) => {
    return generateAIResponse(prompt || '', { type: 'image_analysis', imageUrl });
  };

  const searchWithAI = async (searchQuery: string, prompt?: string) => {
    return generateAIResponse(prompt || '', { type: 'search', searchQuery });
  };

  const chatSupport = async (message: string) => {
    return generateAIResponse(message, { type: 'support' });
  };

  const clearHistory = () => {
    setChatHistory([]);
    setGeneratedText('');
  };

  return {
    generateAIResponse,
    analyzeImage,
    searchWithAI,
    chatSupport,
    generatedText,
    isGenerating,
    chatHistory,
    clearHistory,
    searchResults
  };
};
