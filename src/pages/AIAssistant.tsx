
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextGenerator from '@/components/TextGenerator';
import ImageAnalyzer from '@/components/ai/ImageAnalyzer';
import AISearch from '@/components/ai/AISearch';
import SupportChatbot from '@/components/ai/SupportChatbot';
import { Sparkles, FileText, MessageSquare, User, Camera, Search, HeadphonesIcon } from 'lucide-react';

const AIAssistant = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-royal-blue" />
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant Suite</h1>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Discover the power of AI on MY PUP! From analyzing pet photos to finding perfect matches, 
          our AI tools help you make better decisions and create amazing content.
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search size={16} />
            AI Search
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera size={16} />
            Photo Analysis
          </TabsTrigger>
          <TabsTrigger value="listing" className="flex items-center gap-2">
            <FileText size={16} />
            Listings
          </TabsTrigger>
          <TabsTrigger value="breeder" className="flex items-center gap-2">
            <User size={16} />
            Breeder Info
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <HeadphonesIcon size={16} />
            Support Chat
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Sparkles size={16} />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Pet Search</CardTitle>
                <p className="text-sm text-gray-600">
                  Find your perfect pet companion using intelligent search that understands your lifestyle and preferences.
                </p>
              </CardHeader>
              <CardContent>
                <AISearch />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pet Photo Analyzer</CardTitle>
                <p className="text-sm text-gray-600">
                  Upload a pet photo to get AI-powered insights about breed, health indicators, and characteristics.
                </p>
              </CardHeader>
              <CardContent>
                <ImageAnalyzer />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listing" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pet Listing Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Create engaging descriptions for your pet listings that highlight their best qualities with personalized AI assistance.
                </p>
              </CardHeader>
              <CardContent>
                <TextGenerator
                  defaultType="listing"
                  title="Generate Listing Description"
                  placeholder="Describe your pet (breed, age, temperament, special qualities, etc.)..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breeder" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Breeder Profile Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Create professional content for your breeder profile with AI that understands your experience and specialties.
                </p>
              </CardHeader>
              <CardContent>
                <TextGenerator
                  defaultType="breeder"
                  title="Generate Breeder Content"
                  placeholder="Describe your breeding experience, specialties, philosophy, achievements, etc...."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>24/7 Support Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Get instant help with platform questions, account issues, and guidance on pet adoption and breeding.
                </p>
              </CardHeader>
              <CardContent>
                <SupportChatbot />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General AI Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Generate any type of content for your MY PUP platform needs with personalized AI assistance.
                </p>
              </CardHeader>
              <CardContent>
                <TextGenerator
                  defaultType="general"
                  title="Generate Content"
                  placeholder="Enter any prompt for content generation..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;
