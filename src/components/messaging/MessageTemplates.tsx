
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

const MessageTemplates: React.FC<MessageTemplatesProps> = ({ onSelectTemplate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const categories = [
    'general',
    'availability',
    'pricing',
    'health_records',
    'meeting_arrangement',
    'thank_you'
  ];

  const defaultTemplates = [
    {
      title: "Puppy Available",
      content: "Hi! Yes, [puppy name] is still available. Would you like to schedule a visit to meet them?",
      category: "availability"
    },
    {
      title: "Health Records",
      content: "All our puppies come with complete health records, including vaccinations and health certificates from our licensed veterinarian.",
      category: "health_records"
    },
    {
      title: "Price Inquiry",
      content: "Thank you for your interest! The price for [puppy name] is $[amount]. This includes health records, first vaccinations, and a health guarantee.",
      category: "pricing"
    },
    {
      title: "Meeting Arrangement",
      content: "I'd be happy to arrange a meeting! I'm available [days/times]. Please let me know what works best for you.",
      category: "meeting_arrangement"
    },
    {
      title: "Thank You",
      content: "Thank you for choosing us for your new family member! We're excited for you to meet your new puppy.",
      category: "thank_you"
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length === 0) {
        // Create default templates for new users
        await createDefaultTemplates();
      } else {
        setTemplates(data || []);
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
    }
  };

  const createDefaultTemplates = async () => {
    if (!user) return;

    try {
      const templatesWithUserId = defaultTemplates.map(template => ({
        ...template,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('message_templates')
        .insert(templatesWithUserId)
        .select();

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error creating default templates:', error);
    }
  };

  const saveTemplate = async () => {
    if (!user || !newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingTemplate) {
        const { data, error } = await supabase
          .from('message_templates')
          .update({
            title: newTemplate.title,
            content: newTemplate.content,
            category: newTemplate.category
          })
          .eq('id', editingTemplate.id)
          .select()
          .single();

        if (error) throw error;

        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? data : t
        ));
      } else {
        const { data, error } = await supabase
          .from('message_templates')
          .insert({
            user_id: user.id,
            title: newTemplate.title,
            content: newTemplate.content,
            category: newTemplate.category
          })
          .select()
          .single();

        if (error) throw error;
        setTemplates(prev => [data, ...prev]);
      }

      toast({
        title: "Template Saved",
        description: `Template "${newTemplate.title}" has been saved successfully`,
      });

      resetForm();
    } catch (error: any) {
      toast({
        title: "Failed to Save Template",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({
        title: "Template Deleted",
        description: "Template has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Delete Template",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewTemplate({ title: '', content: '', category: 'general' });
    setEditingTemplate(null);
    setShowCreateDialog(false);
  };

  const startEdit = (template: MessageTemplate) => {
    setNewTemplate({
      title: template.title,
      content: template.content,
      category: template.category
    });
    setEditingTemplate(template);
    setShowCreateDialog(true);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      availability: 'bg-green-100 text-green-800',
      pricing: 'bg-blue-100 text-blue-800',
      health_records: 'bg-purple-100 text-purple-800',
      meeting_arrangement: 'bg-orange-100 text-orange-800',
      thank_you: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            Message Templates
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Template title..."
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                />
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <Textarea
                  placeholder="Template content..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={saveTemplate} className="flex-1">
                    {editingTemplate ? 'Update Template' : 'Save Template'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {templates.map((template) => (
            <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{template.title}</h4>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(template)}>
                    <Edit size={12} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {template.content}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onSelectTemplate(template.content)}
                className="w-full"
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageTemplates;
