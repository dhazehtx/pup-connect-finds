
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextGenerator from '@/components/TextGenerator';
import { Sparkles, FileText, MessageSquare, User } from 'lucide-react';

const AIAssistant = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-royal-blue" />
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Use our AI-powered tools to create compelling content for your pet listings, 
          breeder profiles, and communications on MY PUP.
        </p>
      </div>

      <Tabs defaultValue="listing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listing" className="flex items-center gap-2">
            <FileText size={16} />
            Listings
          </TabsTrigger>
          <TabsTrigger value="breeder" className="flex items-center gap-2">
            <User size={16} />
            Breeder Info
          </TabsTrigger>
          <TabsTrigger value="message" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Messages
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Sparkles size={16} />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listing" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pet Listing Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Create engaging descriptions for your pet listings that highlight their best qualities.
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
                  Create professional content for your breeder profile and expertise descriptions.
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

        <TabsContent value="message" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Assistant</CardTitle>
                <p className="text-sm text-gray-600">
                  Craft professional and friendly messages for communicating with buyers and sellers.
                </p>
              </CardHeader>
              <CardContent>
                <TextGenerator
                  defaultType="message"
                  title="Generate Message Content"
                  placeholder="Describe the situation and what kind of message you want to send..."
                />
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
                  Generate any type of content for your MY PUP platform needs.
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
