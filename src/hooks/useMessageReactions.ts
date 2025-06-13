
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useMessageReactions = () => {
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});

  const fetchReactions = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    const reactionsByMessage = data.reduce((acc, reaction) => {
      if (!acc[reaction.message_id]) {
        acc[reaction.message_id] = [];
      }
      acc[reaction.message_id].push(reaction);
      return acc;
    }, {} as Record<string, MessageReaction[]>);

    setReactions(prev => ({ ...prev, ...reactionsByMessage }));
  };

  const addReaction = async (messageId: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding reaction:', error);
      return;
    }

    setReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), data]
    }));
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingReaction = reactions[messageId]?.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) {
        console.error('Error removing reaction:', error);
        return;
      }

      setReactions(prev => ({
        ...prev,
        [messageId]: prev[messageId]?.filter(r => r.id !== existingReaction.id) || []
      }));
    } else {
      // Add reaction
      await addReaction(messageId, emoji);
    }
  };

  return {
    reactions,
    fetchReactions,
    addReaction,
    toggleReaction
  };
};
