
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Edit, Trash2, Send } from 'lucide-react';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  usage_count: number;
  created_at: string;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

const MessageTemplates = ({ onSelectTemplate }: MessageTemplatesProps) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      title: 'Meeting Request',
      content: 'Hi! Would you be available for a meeting to discuss this further? Let me know what times work best for you.',
      category: 'business',
      usage_count: 15,
      created_at: '2024-01-01'
    },
    {
      id: '2',
      title: 'Thank You',
      content: 'Thank you so much for your help! I really appreciate your assistance.',
      category: 'courtesy',
      usage_count: 28,
      created_at: '2024-01-02'
    },
    {
      id: '3',
      title: 'Follow Up',
      content: 'Just wanted to follow up on our previous conversation. Any updates on this?',
      category: 'business',
      usage_count: 12,
      created_at: '2024-01-03'
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const categories = ['general', 'business', 'courtesy', 'greeting', 'inquiry'];

  const handleCreateTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) return;

    const template: MessageTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title,
      content: newTemplate.content,
      category: newTemplate.category,
      usage_count: 0,
      created_at: new Date().toISOString()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ title: '', content: '', category: 'general' });
    setShowCreateDialog(false);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    setTemplates(prev => prev.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    ));
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usage_count: t.usage_count + 1 } : t
    ));
    onSelectTemplate(template.content);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800',
      courtesy: 'bg-green-100 text-green-800',
      greeting: 'bg-purple-100 text-purple-800',
      inquiry: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Message Templates
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Message Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Template title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                />
                <select
                  className="w-full p-2 border rounded"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Textarea
                  placeholder="Template content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
                <Button onClick={handleCreateTemplate} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{template.title}</h4>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Used {template.usage_count} times
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Use
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {template.content}
              </p>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        {editingTemplate && (
          <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate(prev => 
                    prev ? { ...prev, title: e.target.value } : null
                  )}
                />
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate(prev => 
                    prev ? { ...prev, content: e.target.value } : null
                  )}
                  rows={4}
                />
                <Button onClick={handleUpdateTemplate} className="w-full">
                  Update Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageTemplates;
