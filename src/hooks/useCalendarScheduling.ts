
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  user_id: string;
  listing_id?: string;
  attendee_email?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export const useCalendarScheduling = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<ScheduleEvent, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      toast({
        title: "Event scheduled",
        description: "Your appointment has been scheduled successfully.",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error scheduling event",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: ScheduleEvent['status']) => {
    try {
      const { error } = await supabase
        .from('scheduled_events')
        .update({ status })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, status } : event
        )
      );

      toast({
        title: "Event updated",
        description: `Event status updated to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Event cancelled",
        description: "The event has been cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Error cancelling event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    updateEventStatus,
    deleteEvent,
    refreshEvents: fetchEvents
  };
};
