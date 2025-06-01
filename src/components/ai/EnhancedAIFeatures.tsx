
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Wand2, 
  Image, 
  MessageSquare, 
  TrendingUp,
  Camera,
  PenTool,
  Target,
  Sparkles
} from 'lucide-react';

const EnhancedAIFeatures = () => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const aiFeatures = [
    {
      title: 'Smart Listing Generator',
      description: 'Generate compelling listing descriptions automatically',
      icon: PenTool,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Photo Enhancement',
      description: 'AI-powered photo optimization and enhancement',
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Price Optimization',
      description: 'AI suggests optimal pricing based on market data',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Smart Responses',
      description: 'AI-generated responses to buyer inquiries',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const generateContent = async (type: string) => {
    setLoading(true);
    // Simulate AI content generation
    setTimeout(() => {
      const sampleContent = {
        description: "Meet Luna, a beautiful 8-week-old Golden Retriever puppy with a gentle temperament and stunning golden coat. Luna has been health-tested, vaccinated, and comes from champion bloodlines. She's perfect for families and shows great promise as both a companion and show dog.",
        response: "Thank you for your interest in Luna! She's a wonderful puppy with excellent temperament. I'd be happy to schedule a meet-and-greet at your convenience. Luna has been health-tested and comes with all necessary documentation. Would this weekend work for you?",
        pricing: "Based on current market analysis for Golden Retrievers in your area, the optimal price range is $2,800 - $3,200. Factors considered: bloodline quality, health testing, vaccinations, and local demand."
      };
      setGeneratedContent(sampleContent[type] || 'Generated content will appear here...');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Assistant Features
          </h2>
          <p className="text-gray-600">Leverage AI to optimize your listings and communications</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-400 to-blue-500">
          AI POWERED
        </Badge>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {aiFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Tools */}
      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Content Generator</TabsTrigger>
          <TabsTrigger value="optimizer">Price Optimizer</TabsTrigger>
          <TabsTrigger value="responses">Smart Responses</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Smart Listing Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Breed</label>
                  <Input placeholder="Golden Retriever" />
                </div>
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <Input placeholder="8 weeks" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Key Features</label>
                <Input placeholder="Champion bloodlines, health tested, vaccinated" />
              </div>
              <Button 
                onClick={() => generateContent('description')} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating...
                  </div>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Description
                  </>
                )}
              </Button>
              {generatedContent && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{generatedContent}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Price Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Price</label>
                  <Input placeholder="$3,000" />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="Los Angeles, CA" />
                </div>
              </div>
              <Button 
                onClick={() => generateContent('pricing')} 
                disabled={loading}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Optimal Price
              </Button>
              {generatedContent && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">{generatedContent}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Smart Response Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Buyer Message</label>
                <Textarea 
                  placeholder="Hi, I'm interested in your Golden Retriever puppy. Can we schedule a visit?"
                  rows={3}
                />
              </div>
              <Button 
                onClick={() => generateContent('response')} 
                disabled={loading}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Response
              </Button>
              {generatedContent && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{generatedContent}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Trending Breeds</h4>
                    <p className="text-sm text-blue-700">French Bulldogs up 23% this month</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Peak Season</h4>
                    <p className="text-sm text-green-700">Spring is optimal for puppy sales</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900">Price Trends</h4>
                    <p className="text-sm text-purple-700">Average prices increased 8% YoY</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Add more photos</p>
                      <p className="text-xs text-gray-600">Listings with 5+ photos get 40% more views</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Update description</p>
                      <p className="text-xs text-gray-600">Include health testing information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Optimize timing</p>
                      <p className="text-xs text-gray-600">Post updates on weekends for better reach</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIFeatures;
