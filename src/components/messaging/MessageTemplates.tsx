
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageSquare } from 'lucide-react';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface MessageTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string) => void;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    title: 'Initial Interest',
    content: 'Hi! I\'m interested in your puppy listing. Could you tell me more about the puppy\'s temperament and health history?',
    category: 'inquiry'
  },
  {
    id: '2',
    title: 'Availability Check',
    content: 'Is this puppy still available? I\'d love to schedule a time to meet them.',
    category: 'inquiry'
  },
  {
    id: '3',
    title: 'Health Questions',
    content: 'Could you provide information about the puppy\'s vaccinations, health clearances, and any health testing done on the parents?',
    category: 'health'
  },
  {
    id: '4',
    title: 'Meeting Request',
    content: 'I\'d like to schedule a visit to meet the puppy and see your facility. What times work best for you?',
    category: 'meeting'
  },
  {
    id: '5',
    title: 'Price Inquiry',
    content: 'What is the price for this puppy? Are there any additional costs I should be aware of?',
    category: 'pricing'
  },
  {
    id: '6',
    title: 'Contract Questions',
    content: 'Could you share details about your puppy contract and any health guarantees you provide?',
    category: 'contract'
  },
  {
    id: '7',
    title: 'References Request',
    content: 'Could you provide references from previous puppy buyers? I\'d like to hear about their experiences.',
    category: 'references'
  },
  {
    id: '8',
    title: 'Follow Up',
    content: 'Thank you for the information! I\'m very interested and would like to move forward. What are the next steps?',
    category: 'followup'
  }
];

const MessageTemplates = ({ isOpen, onClose, onSelectTemplate }: MessageTemplatesProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'inquiry', 'health', 'meeting', 'pricing', 'contract', 'references', 'followup'];

  const filteredTemplates = defaultTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: MessageTemplate) => {
    onSelectTemplate(template.content);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Message Templates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredTemplates.map(template => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare size={14} />
                    {template.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageTemplates;
