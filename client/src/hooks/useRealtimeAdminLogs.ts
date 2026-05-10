import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { logAdminAction } from '@/utils/logger';

interface AdminLog {
  id: string;
  timestamp: string;
  admin_id: string;
  action: string;
  metadata?: any;
  event_type?: string;
  event_detail?: string;
  category?: string;
  level?: string;
}

type DbAdminLog = {
  id: string;
  timestamp: string | null;
  created_at?: string | null;
  admin_id: string | null;
  action: string | null;
  metadata?: any;
  event_type?: string | null;
  event_detail?: string | null;
  category?: string | null;
  level?: string | null;
};

const normalizeAdminLog = (log: DbAdminLog): AdminLog => ({
  id: log.id,
  timestamp: log.timestamp ?? log.created_at ?? new Date().toISOString(),
  admin_id: log.admin_id ?? 'system',
  action: log.action ?? 'unknown_action',
  metadata: log.metadata,
  event_type: log.event_type ?? undefined,
  event_detail: log.event_detail ?? undefined,
  category: log.category ?? undefined,
  level: log.level ?? undefined,
});

interface RealtimeConfig {
  autoScroll: boolean;
  showToastNotifications: boolean;
  highlightNewEntries: boolean;
  maxRecentHighlights: number;
}

export const useRealtimeAdminLogs = (initialLogs: AdminLog[] = []) => {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>(initialLogs);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newLogsCount, setNewLogsCount] = useState(0);
  const [recentLogIds, setRecentLogIds] = useState<Set<string>>(new Set());
  const subscriptionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<RealtimeConfig>({
    autoScroll: true,
    showToastNotifications: true,
    highlightNewEntries: true,
    maxRecentHighlights: 3
  });

  // Auto-scroll to bottom when new logs arrive
  const scrollToBottom = useCallback(() => {
    if (config.autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [config.autoScroll]);

  // Handle new log insertion
  const handleNewLog = useCallback((newLog: AdminLog) => {
    if (isPaused) {
      setNewLogsCount(prev => prev + 1);
      return;
    }

    setLogs(prevLogs => {
      // Avoid duplicates
      if (prevLogs.some(log => log.id === newLog.id)) {
        return prevLogs;
      }
      
      // Add new log to the beginning for reverse chronological order
      return [newLog, ...prevLogs];
    });

    // Track recent logs for highlighting
    if (config.highlightNewEntries) {
      setRecentLogIds(prev => {
        const newSet = new Set(prev);
        newSet.add(newLog.id);
        
        // Keep only the most recent logs for highlighting
        if (newSet.size > config.maxRecentHighlights) {
          const logsArray = Array.from(newSet);
          const toRemove = logsArray.slice(0, logsArray.length - config.maxRecentHighlights);
          toRemove.forEach(id => newSet.delete(id));
        }
        
        return newSet;
      });

      // Remove highlight after 10 seconds
      setTimeout(() => {
        setRecentLogIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(newLog.id);
          return newSet;
        });
      }, 10000);
    }

    // Show toast notification
    if (config.showToastNotifications) {
      toast({
        title: "New Admin Action",
        description: `${newLog.action} - ${newLog.admin_id}`,
        duration: 3000
      });
    }

    // Auto-scroll to new entry
    setTimeout(scrollToBottom, 100);

    // Log realtime event
    logAdminAction('Received realtime admin log update', {
      logId: newLog.id,
      eventType: newLog.event_type,
      timestamp: new Date().toISOString()
    });

  }, [isPaused, config, scrollToBottom]);

  // Handle log updates
  const handleLogUpdate = useCallback((updatedLog: AdminLog) => {
    setLogs(prevLogs => 
      prevLogs.map(log => 
        log.id === updatedLog.id ? { ...log, ...updatedLog } : log
      )
    );

    if (config.showToastNotifications) {
      toast({
        title: "Admin Log Updated",
        description: `Log ${updatedLog.id} was modified`,
        duration: 2000
      });
    }
  }, [config.showToastNotifications]);

  // Handle log deletion
  const handleLogDelete = useCallback((deletedLog: { id: string }) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== deletedLog.id));
    
    setRecentLogIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(deletedLog.id);
      return newSet;
    });

    if (config.showToastNotifications) {
      toast({
        title: "Admin Log Deleted",
        description: `Log ${deletedLog.id} was removed`,
        duration: 2000,
        variant: "destructive"
      });
    }
  }, [config.showToastNotifications]);

  // Start realtime subscription
  const startListening = useCallback(async () => {
    if (!user || !profile?.is_admin) {
      console.warn('Realtime admin logs: User not authorized');
      return;
    }

    if (subscriptionRef.current) {
      console.log('Realtime subscription already active');
      return;
    }

    try {
      console.log('Starting realtime admin logs subscription...');
      
      const subscription = supabase
        .channel('admin-logs-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'admin_logs'
          },
          (payload) => {
            console.log('Realtime INSERT:', payload);
            handleNewLog(payload.new as AdminLog);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'admin_logs'
          },
          (payload) => {
            console.log('Realtime UPDATE:', payload);
            handleLogUpdate(payload.new as AdminLog);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'admin_logs'
          },
          (payload) => {
            console.log('Realtime DELETE:', payload);
            handleLogDelete(payload.old as { id: string });
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
          setIsListening(status === 'SUBSCRIBED');
          
          if (status === 'SUBSCRIBED') {
            logAdminAction('Started realtime admin logs subscription', {
              timestamp: new Date().toISOString()
            });
          }
        });

      subscriptionRef.current = subscription;

    } catch (error) {
      console.error('Failed to start realtime subscription:', error);
      toast({
        title: "Realtime Connection Failed",
        description: "Unable to start live log updates",
        variant: "destructive"
      });
    }
  }, [user, profile, handleNewLog, handleLogUpdate, handleLogDelete]);

  // Stop realtime subscription
  const stopListening = useCallback(async () => {
    if (subscriptionRef.current) {
      console.log('Stopping realtime admin logs subscription...');
      
      await supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
      setIsListening(false);
      
      logAdminAction('Stopped realtime admin logs subscription', {
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (!newPausedState && newLogsCount > 0) {
      // Resume and refresh logs
      setNewLogsCount(0);
      // Trigger a refresh of logs here if needed
    }

    logAdminAction(`${newPausedState ? 'Paused' : 'Resumed'} realtime admin logs`, {
      timestamp: new Date().toISOString()
    });
  }, [isPaused, newLogsCount]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<RealtimeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    logAdminAction('Updated realtime admin logs config', {
      config: newConfig,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Resume and load missed logs
  const resumeAndRefresh = useCallback(async () => {
    setIsPaused(false);
    setNewLogsCount(0);
    
    try {
      // Fetch latest logs to catch up
      const { data, error } = await supabase
        .from('admin_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLogs(((data as unknown) as DbAdminLog[]).map((item) => normalizeAdminLog(item)));
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    }
  }, [scrollToBottom]);

  // Initialize subscription on mount
  useEffect(() => {
    if (user && profile?.is_admin) {
      startListening();
    }

    return () => {
      stopListening();
    };
  }, [user, profile, startListening, stopListening]);

  // Update logs when initialLogs change
  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  return {
    logs,
    isListening,
    isPaused,
    newLogsCount,
    recentLogIds,
    config,
    containerRef,
    startListening,
    stopListening,
    togglePause,
    updateConfig,
    resumeAndRefresh,
    scrollToBottom
  };
};