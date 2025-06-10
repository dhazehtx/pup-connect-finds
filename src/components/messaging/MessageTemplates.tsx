
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usage_count: number;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
  onClose: () => void;
}

const MessageTemplates = ({ onSelectTemplate, onClose }: MessageTemplatesProps) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      title: 'Introduction',
      content: 'Hi! I\'m interested in your dog listing. Could you please provide more information about the breed and availability?',
      category: 'inquiry',
      tags: ['introduction', 'inquiry'],
      usage_count: 15
    },
    {
      id: '2',
      title: 'Scheduling Visit',
      content: 'I would love to schedule a visit to meet the puppy. What times work best for you this week?',
      category: 'meeting',
      tags: ['visit', 'schedule'],
      usage_count: 8
    },
    {
      id: '3',
      title: 'Health Questions',
      content: 'Could you please share the health certificates and vaccination records for the puppy?',
      category: 'health',
      tags: ['health', 'certificates'],
      usage_count: 12
    },
    {
      id: '4',
      title: 'Thank You',
      content: 'Thank you for your time and detailed responses. I appreciate your professionalism.',
      category: 'courtesy',
      tags: ['thanks', 'courtesy'],
      usage_count: 22
    }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const { toast } = useToast();

  const categories = ['all', 'inquiry', 'meeting', 'health', 'courtesy', 'negotiation'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: MessageTemplate) => {
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usage_count: t.usage_count + 1 } : t
    ));
    
    onSelectTemplate(template.content);
    onClose();
    
    toast({
      title: "Template Applied",
      description: `"${template.title}" has been added to your message.`,
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "The message template has been removed.",
    });
  };

  const CreateTemplateForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('inquiry');
    const [tags, setTags] = useState('');

    const handleSave = () => {
      if (!title.trim() || !content.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in both title and content.",
          variant: "destructive",
        });
        return;
      }

      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        usage_count: 0
      };

      setTemplates(prev => [...prev, newTemplate]);
      setIsCreating(false);
      setTitle('');
      setContent('');
      setTags('');
      
      toast({
        title: "Template Created",
        description: "Your new message template has been saved.",
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create New Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Template title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <Textarea
            placeholder="Template content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Message Templates</h3>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && <CreateTemplateForm />}

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Templates List */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => handleSelectTemplate(template)}>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{template.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Used {template.usage_count} times
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content}
                  </p>
                  
                  <div className="flex gap-1 mt-2">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTemplate(template);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No templates found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;
