
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Mail, Phone, ExternalLink, Bot, Headphones } from 'lucide-react';
import SupportChatbot from '@/components/ai/SupportChatbot';
import { useEnhancedAI } from '@/hooks/useEnhancedAI';

interface PopularArticle {
  title: string;
  url: string;
}

interface HelpSidebarProps {
  popularArticles: PopularArticle[];
}

const HelpSidebar: React.FC<HelpSidebarProps> = ({ popularArticles }) => {
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const { chatSupport, isGenerating } = useEnhancedAI();

  return (
    <div className="space-y-6">
      {/* Popular Articles */}
      <Card className="border-soft-sky">
        <CardHeader>
          <CardTitle className="text-deep-navy">Popular Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {popularArticles.map((article, index) => (
              <li key={index}>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-royal-blue hover:underline flex items-center justify-between group"
                >
                  <span>{article.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* AI-Powered Support */}
      <Card className="border-soft-sky">
        <CardHeader>
          <CardTitle className="text-deep-navy flex items-center gap-2">
            <Bot size={20} className="text-royal-blue" />
            AI-Powered Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-deep-navy/70">Get instant help with our AI assistant or connect with our support team.</p>
          
          <div className="space-y-3">
            {/* Live Chat with AI */}
            <Dialog open={isLiveChatOpen} onOpenChange={setIsLiveChatOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-royal-blue hover:bg-deep-navy">
                  <MessageCircle className="mr-2" size={16} />
                  Live Chat (AI-Powered)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    Live AI Support Chat
                  </DialogTitle>
                </DialogHeader>
                <div className="h-[600px]">
                  <SupportChatbot />
                </div>
              </DialogContent>
            </Dialog>

            {/* AI Assistant */}
            <Dialog open={isAIAssistantOpen} onOpenChange={setIsAIAssistantOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
                  <Bot className="mr-2" size={16} />
                  AI Assistant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bot size={20} />
                    MY PUP AI Assistant
                  </DialogTitle>
                </DialogHeader>
                <div className="h-[600px]">
                  <SupportChatbot />
                </div>
              </DialogContent>
            </Dialog>

            {/* Enhanced Call Us with AI Pre-screening */}
            <Button 
              variant="outline" 
              className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white"
              onClick={() => {
                // Open AI pre-screening before call
                setIsAIAssistantOpen(true);
              }}
            >
              <Phone className="mr-2" size={16} />
              Call Us (AI-Assisted)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Traditional Contact Support */}
      <Card className="border-soft-sky">
        <CardHeader>
          <CardTitle className="text-deep-navy">Traditional Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-deep-navy/70">Prefer traditional support methods? We're here to help.</p>
          <div className="space-y-3">
            <Button variant="outline" className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
              <Mail className="mr-2" size={16} />
              Email Support
            </Button>
            <Button variant="outline" className="w-full border-royal-blue text-royal-blue hover:bg-royal-blue hover:text-white">
              <Headphones className="mr-2" size={16} />
              Direct Call
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Hours */}
      <Card className="border-soft-sky">
        <CardHeader>
          <CardTitle className="text-deep-navy">Support Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-deep-navy/70">
            <div className="flex justify-between">
              <span>AI Support</span>
              <span className="text-green-600 font-medium">24/7 Available</span>
            </div>
            <div className="flex justify-between">
              <span>Human Support</span>
              <span>9AM - 8PM EST</span>
            </div>
            <div className="flex justify-between">
              <span>Weekend</span>
              <span>10AM - 6PM EST</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSidebar;
