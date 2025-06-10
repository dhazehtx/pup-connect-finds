
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactions = () => {
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;

      const reactionsByMessage = (data || []).reduce((acc, reaction) => {
        if (!acc[reaction.message_id]) {
          acc[reaction.message_id] = [];
        }
        acc[reaction.message_id].push(reaction);
        return acc;
      }, {} as Record<string, MessageReaction[]>);

      setReactions(prev => ({ ...prev, ...reactionsByMessage }));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to messages",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions[messageId]?.find(
        r => r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        setReactions(prev => ({
          ...prev,
          [messageId]: prev[messageId]?.filter(r => r.id !== existingReaction.id) || []
        }));
      } else {
        // Add reaction
        const { data, error } = await supabase
          .from('message_reactions')
          .insert([{
            message_id: messageId,
            user_id: user.id,
            emoji
          }])
          .select()
          .single();

        if (error) throw error;

        setReactions(prev => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), data]
        }));
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    }
  }, [user, reactions, toast]);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  }, [addReaction]);

  const getReactionCounts = useCallback((messageId: string) => {
    const messageReactions = reactions[messageId] || [];
    const counts: Record<string, number> = {};
    
    messageReactions.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    
    return counts;
  }, [reactions]);

  const hasUserReacted = useCallback((messageId: string, emoji: string) => {
    if (!user) return false;
    return reactions[messageId]?.some(r => r.user_id === user.id && r.emoji === emoji) || false;
  }, [reactions, user]);

  return {
    reactions,
    addReaction,
    toggleReaction,
    fetchReactions,
    getReactionCounts,
    hasUserReacted
  };
};
