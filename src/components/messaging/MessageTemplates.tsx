
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Edit, Trash2, Copy } from 'lucide-react';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

const MessageTemplates = ({ onSelectTemplate }: MessageTemplatesProps) => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, useTemplate } = useMessageTemplates();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'general',
    is_public: false
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'greeting', label: 'Greetings' },
    { value: 'inquiry', label: 'Inquiries' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'availability', label: 'Availability' },
    { value: 'meeting', label: 'Meeting Arrangement' }
  ];

  const handleCreateTemplate = async () => {
    if (!newTemplate.title || !newTemplate.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content",
        variant: "destructive"
      });
      return;
    }

    const created = await createTemplate(newTemplate);
    if (created) {
      setNewTemplate({ title: '', content: '', category: 'general', is_public: false });
      setIsCreateOpen(false);
    }
  };

  const handleSelectTemplate = async (template: any) => {
    await useTemplate(template.id);
    onSelectTemplate(template.content);
    toast({
      title: "Template Selected",
      description: `"${template.title}" has been added to your message`,
    });
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Template content copied to clipboard",
    });
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Message Templates</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Message Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Template title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Template content..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate} disabled={loading}>
                  Create Template
                </Button>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-gray-600 mb-2 capitalize">
                {categories.find(c => c.value === category)?.label || category}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {categoryTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-sm">{template.title}</h5>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyTemplate(template.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {template.content}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          {template.is_public && (
                            <Badge variant="secondary" className="text-xs">Public</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Used {template.usage_count} times
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="personal">
          <div className="grid grid-cols-1 gap-2">
            {templates.filter(t => !t.is_public).map((template) => (
              <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{template.title}</h5>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="public">
          <div className="grid grid-cols-1 gap-2">
            {templates.filter(t => t.is_public).map((template) => (
              <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{template.title}</h5>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {template.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-1 gap-2">
            {templates
              .sort((a, b) => b.usage_count - a.usage_count)
              .slice(0, 10)
              .map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm">{template.title}</h5>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <FileText className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {template.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageTemplates;
