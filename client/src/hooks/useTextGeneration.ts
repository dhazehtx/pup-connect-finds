
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TextGenerationOptions {
  type?: 'general' | 'listing' | 'breeder' | 'message';
  maxTokens?: number;
}

export const useTextGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const { toast } = useToast();

  const generateText = async (prompt: string, options: TextGenerationOptions = {}) => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please provide a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: {
          prompt: prompt.trim(),
          type: options.type || 'general',
          maxTokens: options.maxTokens || 500
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedText(data.generatedText);
      
      toast({
        title: "Success",
        description: "Text generated successfully!",
      });

      return data.generatedText;
    } catch (error) {
      console.error('Text generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate text',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGenerated = () => {
    setGeneratedText('');
  };

  return {
    generateText,
    generatedText,
    isGenerating,
    clearGenerated
  };
};
