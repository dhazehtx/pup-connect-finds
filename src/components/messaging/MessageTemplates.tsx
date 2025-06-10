
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

const MessageTemplates = ({ onSelectTemplate }: MessageTemplatesProps) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['general', 'greeting', 'appointment', 'follow-up', 'pricing', 'other'];

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async () => {
    if (!user || !newTemplate.title.trim() || !newTemplate.content.trim()) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .insert([{
          user_id: user.id,
          title: newTemplate.title.trim(),
          content: newTemplate.content.trim(),
          category: newTemplate.category
        }]);

      if (error) throw error;

      setNewTemplate({ title: '', content: '', category: 'general' });
      setIsCreating(false);
      fetchTemplates();
      
      toast({
        title: "Template created",
        description: "Your message template has been saved",
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !user) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          title: editingTemplate.title,
          content: editingTemplate.content,
          category: editingTemplate.category
        })
        .eq('id', editingTemplate.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEditingTemplate(null);
      fetchTemplates();
      
      toast({
        title: "Template updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchTemplates();
      
      toast({
        title: "Template deleted",
        description: "Template has been removed",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleUseTemplate = async (template: MessageTemplate) => {
    // Increment usage count
    await supabase
      .from('message_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', template.id);

    onSelectTemplate(template.content);
    fetchTemplates();
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Message Templates</h2>
          <p className="text-muted-foreground">Create and manage reusable message templates</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Create Template Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Template title"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              />
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              placeholder="Template content..."
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTemplate}>Create Template</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium truncate">{template.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Used {template.usage_count} times
                      </span>
                    </div>
                  </div>
                  {user && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                        className="w-8 h-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="w-8 h-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </p>
                
                <Button
                  onClick={() => handleUseTemplate(template)}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2"
                >
                  <Copy className="w-3 h-3" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found matching your criteria.</p>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={editingTemplate.title}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                placeholder="Template title"
              />
              <select
                value={editingTemplate.category}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Textarea
                value={editingTemplate.content}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateTemplate}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MessageTemplates;
