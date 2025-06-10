
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageReaction {
  emoji: string;
  users: Array<{
    id: string;
    name: string;
  }>;
  count: number;
}

export const useMessageReactions = () => {
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReactions = useCallback(async (messageId: string) => {
    try {
      // This would fetch from a message_reactions table
      // For now, return empty array as we don't have the table structure
      console.log('Fetching reactions for message:', messageId);
      return [];
    } catch (error) {
      console.error('Error fetching reactions:', error);
      return [];
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // This would add to a message_reactions table
      console.log('Adding reaction:', { messageId, emoji, userId: user.id });
      
      // Optimistically update local state
      setReactions(prev => {
        const messageReactions = prev[messageId] || [];
        const existingReaction = messageReactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // User already reacted with this emoji, so remove it
          const userIndex = existingReaction.users.findIndex(u => u.id === user.id);
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1);
            existingReaction.count = existingReaction.users.length;
            
            if (existingReaction.count === 0) {
              return {
                ...prev,
                [messageId]: messageReactions.filter(r => r.emoji !== emoji)
              };
            }
          } else {
            // Add user to existing reaction
            existingReaction.users.push({
              id: user.id,
              name: user.email?.split('@')[0] || 'You'
            });
            existingReaction.count = existingReaction.users.length;
          }
        } else {
          // Create new reaction
          messageReactions.push({
            emoji,
            users: [{
              id: user.id,
              name: user.email?.split('@')[0] || 'You'
            }],
            count: 1
          });
        }
        
        return {
          ...prev,
          [messageId]: [...messageReactions]
        };
      });

      toast({
        title: "Reaction added",
        description: `Added ${emoji} reaction`,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      console.log('Removing reaction:', { messageId, emoji, userId: user.id });
      
      setReactions(prev => {
        const messageReactions = prev[messageId] || [];
        const updatedReactions = messageReactions.map(reaction => {
          if (reaction.emoji === emoji) {
            const updatedUsers = reaction.users.filter(u => u.id !== user.id);
            return {
              ...reaction,
              users: updatedUsers,
              count: updatedUsers.length
            };
          }
          return reaction;
        }).filter(reaction => reaction.count > 0);
        
        return {
          ...prev,
          [messageId]: updatedReactions
        };
      });

      toast({
        title: "Reaction removed",
        description: `Removed ${emoji} reaction`,
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: "Error",
        description: "Failed to remove reaction",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    const messageReactions = reactions[messageId] || [];
    const existingReaction = messageReactions.find(r => r.emoji === emoji);
    const userHasReacted = existingReaction?.users.some(u => u.id === user.id);

    if (userHasReacted) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  }, [reactions, user, addReaction, removeReaction]);

  return {
    reactions,
    fetchReactions,
    addReaction,
    removeReaction,
    toggleReaction,
  };
};
