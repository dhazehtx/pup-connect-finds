
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactions = () => {
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        })
        .select()
        .single();

      if (error) throw error;

      setReactions(prev => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), data]
      }));

      toast({
        title: "Reaction added",
        description: `Added ${emoji} reaction`,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Failed to add reaction",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;

      setReactions(prev => ({
        ...prev,
        [messageId]: (prev[messageId] || []).filter(
          r => !(r.user_id === user.id && r.emoji === emoji)
        )
      }));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  }, [user]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    const messageReactions = reactions[messageId] || [];
    const existingReaction = messageReactions.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      await removeReaction(messageId, emoji);
    } else {
      await addReaction(messageId, emoji);
    }
  }, [reactions, user, addReaction, removeReaction]);

  const fetchReactions = useCallback(async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;

      setReactions(prev => ({
        ...prev,
        [messageId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  }, []);

  return {
    reactions,
    addReaction,
    removeReaction,
    toggleReaction,
    fetchReactions
  };
};
