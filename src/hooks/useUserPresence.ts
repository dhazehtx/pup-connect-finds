
import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPresence {
  user_id: string;
  username?: string;
  avatar_url?: string;
  online_at: string;
  status: 'online' | 'away' | 'busy';
}

export interface PresenceState {
  [key: string]: UserPresence[];
}

export const useUserPresence = (channelName: string = 'global-presence') => {
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { user, profile } = useAuth();

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'busy' = 'online') => {
    if (!channel || !user) return;

    const presenceData: UserPresence = {
      user_id: user.id,
      username: profile?.username || profile?.full_name || 'Anonymous',
      avatar_url: profile?.avatar_url,
      online_at: new Date().toISOString(),
      status
    };

    const trackResult = await channel.track(presenceData);
    console.log('Presence track result:', trackResult);
  }, [channel, user, profile]);

  useEffect(() => {
    if (!user) return;

    const newChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        
        // Transform the presence state to match our interface
        const transformedState: PresenceState = {};
        const users: UserPresence[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          // Type assertion since we know the structure of our tracked data
          const typedPresences = presences as unknown as UserPresence[];
          transformedState[key] = typedPresences;
          typedPresences.forEach((presence) => {
            // Ensure the presence has all required UserPresence properties
            if (presence.user_id && presence.online_at && presence.status) {
              users.push(presence);
            }
          });
        });
        
        setPresenceState(transformedState);
        setOnlineUsers(users);
        
        console.log('Presence sync:', users.length, 'users online');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(newChannel);
          // Set initial presence as online
          await updatePresence('online');
        }
      });

    return () => {
      console.log('Cleaning up presence channel');
      supabase.removeChannel(newChannel);
    };
  }, [user, channelName]);

  // Update presence when user becomes active/inactive
  useEffect(() => {
    if (!channel) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    const handleBeforeUnload = () => {
      updatePresence('away');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [channel, updatePresence]);

  const getUserPresence = useCallback((userId: string): UserPresence | null => {
    const userPresences = presenceState[userId];
    return userPresences && userPresences.length > 0 ? userPresences[0] : null;
  }, [presenceState]);

  const isUserOnline = useCallback((userId: string): boolean => {
    const presence = getUserPresence(userId);
    if (!presence) return false;
    
    // Consider user online if they were active in the last 5 minutes
    const lastSeen = new Date(presence.online_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
    
    return diffMinutes < 5 && presence.status !== 'away';
  }, [getUserPresence]);

  return {
    presenceState,
    onlineUsers,
    updatePresence,
    getUserPresence,
    isUserOnline,
    onlineCount: onlineUsers.length
  };
};
