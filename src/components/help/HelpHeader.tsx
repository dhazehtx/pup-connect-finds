
import React, { useState } from 'react';
import { Search, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SupportChatbot from '@/components/ai/SupportChatbot';

interface HelpHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const HelpHeader: React.FC<HelpHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-xl opacity-90 mb-8">Find answers to your questions and get the help you need</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-deep-navy/60" size={20} />
          <Input
            placeholder="Search for help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 text-lg bg-white text-deep-navy"
          />
        </div>

        {/* AI Assistant Access - Centered */}
        <div className="flex justify-center">
          <Dialog open={isQuickChatOpen} onOpenChange={setIsQuickChatOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Bot className="mr-2" size={16} />
                Ask AI Assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot size={20} />
                  Quick AI Support
                </DialogTitle>
              </DialogHeader>
              <div className="h-[600px]">
                <SupportChatbot />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default HelpHeader;
