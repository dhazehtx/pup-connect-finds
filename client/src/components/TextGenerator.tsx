
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Wand2, Loader2 } from 'lucide-react';
import { useTextGeneration, TextGenerationOptions } from '@/hooks/useTextGeneration';
import { useToast } from '@/hooks/use-toast';

interface TextGeneratorProps {
  onTextGenerated?: (text: string) => void;
  placeholder?: string;
  defaultType?: TextGenerationOptions['type'];
  title?: string;
  className?: string;
}

const TextGenerator = ({ 
  onTextGenerated, 
  placeholder = "Enter your prompt here...",
  defaultType = 'general',
  title = "AI Text Generator",
  className = ""
}: TextGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<TextGenerationOptions['type']>(defaultType);
  const { generateText, generatedText, isGenerating, clearGenerated } = useTextGeneration();
  const { toast } = useToast();

  const handleGenerate = async () => {
    const result = await generateText(prompt, { type });
    if (result && onTextGenerated) {
      onTextGenerated(result);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 size={20} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Content Type</label>
          <Select value={type} onValueChange={(value: TextGenerationOptions['type']) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Content</SelectItem>
              <SelectItem value="listing">Pet Listing Description</SelectItem>
              <SelectItem value="breeder">Breeder Information</SelectItem>
              <SelectItem value="message">Message Content</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Text
            </>
          )}
        </Button>

        {generatedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Text</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearGenerated}
                >
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              value={generatedText}
              readOnly
              rows={6}
              className="resize-none bg-gray-50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextGenerator;
