
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Archive, Search, RotateCcw, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExtendedConversation } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';

interface ConversationArchiveProps {
  archivedConversations: ExtendedConversation[];
  onRestoreConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onExportConversation: (conversationId: string) => void;
}

const ConversationArchive = ({
  archivedConversations,
  onRestoreConversation,
  onDeleteConversation,
  onExportConversation
}: ConversationArchiveProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<ExtendedConversation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(archivedConversations);
      return;
    }

    const filtered = archivedConversations.filter(conversation => {
      const userName = conversation.other_user?.full_name || conversation.other_user?.username || '';
      const dogName = conversation.listing?.dog_name || '';
      return (
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dogName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredConversations(filtered);
  }, [searchQuery, archivedConversations]);

  const handleRestore = (conversationId: string) => {
    onRestoreConversation(conversationId);
    toast({
      title: "Conversation restored",
      description: "The conversation has been moved back to your inbox",
    });
  };

  const handleDelete = (conversationId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this conversation?')) {
      onDeleteConversation(conversationId);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted",
        variant: "destructive",
      });
    }
  };

  const handleExport = (conversationId: string) => {
    onExportConversation(conversationId);
    toast({
      title: "Export started",
      description: "Your conversation data is being prepared for download",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive size={20} />
          Archived Conversations ({archivedConversations.length})
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archived conversations..."
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No archived conversations</p>
              <p className="text-sm">
                {searchQuery ? 'No conversations match your search' : 'Archive conversations to organize your inbox'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {conversation.other_user?.full_name || conversation.other_user?.username || 'Unknown User'}
                        </h3>
                        {conversation.listing && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.listing.dog_name}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Archived {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                      </p>
                      
                      {conversation.listing && (
                        <p className="text-xs text-muted-foreground">
                          {conversation.listing.breed}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(conversation.id)}
                        title="Restore conversation"
                      >
                        <RotateCcw size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(conversation.id)}
                        title="Export conversation"
                      >
                        <Download size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(conversation.id)}
                        title="Delete permanently"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationArchive;
