
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Archive, ArchiveRestore, Trash2, Star, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ExtendedConversation } from '@/types/messaging';

interface ConversationArchiveProps {
  conversations: ExtendedConversation[];
  onArchiveConversation: (conversationId: string) => void;
  onUnarchiveConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onStarConversation: (conversationId: string) => void;
}

const ConversationArchive = ({
  conversations,
  onArchiveConversation,
  onUnarchiveConversation,
  onDeleteConversation,
  onStarConversation
}: ConversationArchiveProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { toast } = useToast();

  const archivedConversations = conversations.filter(conv => 
    // Assuming we have an archived field in the conversation
    (conv as any).archived === true
  );

  const filteredArchivedConversations = archivedConversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing?.dog_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArchive = (conversationId: string) => {
    onArchiveConversation(conversationId);
    toast({
      title: "Conversation archived",
      description: "The conversation has been moved to archive",
    });
  };

  const handleUnarchive = (conversationId: string) => {
    onUnarchiveConversation(conversationId);
    toast({
      title: "Conversation restored",
      description: "The conversation has been restored from archive",
    });
  };

  const handleDelete = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      onDeleteConversation(conversationId);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted",
        variant: "destructive",
      });
    }
  };

  const handleStar = (conversationId: string) => {
    onStarConversation(conversationId);
    toast({
      title: "Conversation starred",
      description: "The conversation has been marked as important",
    });
  };

  return (
    <div className="space-y-4">
      {/* Archive Management Buttons */}
      <div className="flex items-center gap-2">
        <Dialog open={showArchived} onOpenChange={setShowArchived}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Archive size={16} className="mr-2" />
              Archive ({archivedConversations.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Archived Conversations</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search archived conversations */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archived conversations..."
                  className="pl-10"
                />
              </div>

              {/* Archived conversations list */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredArchivedConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No archived conversations</p>
                  </div>
                ) : (
                  filteredArchivedConversations.map((conversation) => (
                    <Card key={conversation.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {conversation.other_user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {conversation.other_user?.full_name || 'Unknown User'}
                            </h4>
                            {conversation.listing && (
                              <p className="text-xs text-gray-600">
                                {conversation.listing.dog_name} - {conversation.listing.breed}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnarchive(conversation.id)}
                            title="Restore conversation"
                          >
                            <ArchiveRestore size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(conversation.id)}
                            title="Delete conversation"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Actions for Active Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conversation Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <Star size={16} className="mr-2" />
              Starred
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Archive size={16} className="mr-2" />
              Recent
            </Button>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs cursor-pointer">
                Mark all as read
              </Badge>
              <Badge variant="outline" className="text-xs cursor-pointer">
                Export conversations
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationArchive;
