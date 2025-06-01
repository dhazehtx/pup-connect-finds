
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Loader2, Eye } from 'lucide-react';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';
import { useToast } from '@/hooks/use-toast';

const ImageAnalyzer = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const { analyzeImage, generatedText, isGenerating } = useEnhancedAI();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      toast({
        title: "No Image",
        description: "Please upload an image or provide an image URL",
        variant: "destructive",
      });
      return;
    }

    await analyzeImage(imageUrl, customPrompt);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye size={20} />
          Pet Photo Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Pet Photo</label>
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => document.querySelector('input[type="file"]')?.click()}>
              <Upload size={16} className="mr-1" />
              Upload
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Or Enter Image URL</label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/pet-photo.jpg"
          />
        </div>

        {imageUrl && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Image Preview</label>
            <img 
              src={imageUrl} 
              alt="Pet to analyze" 
              className="w-full max-w-md mx-auto rounded-lg border"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Analysis Request (Optional)</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask specific questions about the pet's breed, health, or characteristics..."
            rows={2}
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!imageUrl || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Analyze Pet Photo
            </>
          )}
        </Button>

        {generatedText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Results</label>
            <Textarea
              value={generatedText}
              readOnly
              rows={8}
              className="resize-none bg-gray-50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageAnalyzer;
