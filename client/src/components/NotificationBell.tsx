import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationFeedV2 } from './NotificationFeedV2';

export function NotificationBell() {
  const { user } = useAuthState();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count using enhanced API
  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ['/api/notifications-v2?count=1', user?.id],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = (unreadData as any)?.count || 0;

  // Real-time subscription for notifications (placeholder for future enhancement)
  useEffect(() => {
    if (!user?.id) return;
    
    // TODO: Add real-time subscription here when Supabase real-time is configured
    // const subscription = supabase
    //   .channel('notifications')
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'notifications',
    //     filter: `recipient_id=eq.${user.id}`
    //   }, () => {
    //     refetchUnread();
    //   })
    //   .subscribe();
    
    // return () => subscription.unsubscribe();
  }, [user?.id, refetchUnread]);

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          data-testid="notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              data-testid="notification-badge"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        data-testid="notification-dropdown"
      >
        <NotificationFeedV2 
          onMarkAsRead={() => refetchUnread()}
          onClose={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}