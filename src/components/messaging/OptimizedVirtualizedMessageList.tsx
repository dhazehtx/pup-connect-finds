import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import MessageStatusIndicator from './MessageStatusIndicator';
import { useMessagingPerformanceOptimized } from '@/hooks/useMessagingPerformanceOptimized';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
}

interface OptimizedVirtualizedMessageListProps {
  messages: Message[];
  currentUserId: string;
  height: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const MessageItem = React.memo(({ index, style, data }: any) => {
  const { messages, currentUserId, senderProfiles } = data;
  const message = messages[index];
  const isOwn = message.sender_id === currentUserId;
  const senderProfile = senderProfiles[message.sender_id];
  
  const messageTime = useMemo(() => 
    formatDistanceToNow(new Date(message.created_at), { addSuffix: true }),
    [message.created_at]
  );

  const getMessageStatus = useCallback(() => {
    if (!isOwn) return null;
    return message.read_at ? 'read' : 'delivered';
  }, [isOwn, message.read_at]);

  return (
    <div style={style} className="px-4 py-2">
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderProfile?.avatar_url} />
          <AvatarFallback className="text-xs">
            {senderProfile?.full_name?.charAt(0) || (isOwn ? 'Me' : 'U')}
          </AvatarFallback>
        </Avatar>

        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
          <div
            className={`rounded-lg px-3 py-2 ${
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {message.message_type === 'image' && message.image_url && (
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
                loading="lazy"
              />
            )}
            {message.content && (
              <p className="text-sm break-words">{message.content}</p>
            )}
          </div>
          
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-muted-foreground">{messageTime}</span>
            {isOwn && (
              <MessageStatusIndicator 
                status={getMessageStatus() || 'sent'} 
                size={12}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const OptimizedVirtualizedMessageList = ({ 
  messages, 
  currentUserId, 
  height, 
  onLoadMore,
  hasMore = false 
}: OptimizedVirtualizedMessageListProps) => {
  const { getCachedData, setCachedData, measurePerformance } = useMessagingPerformanceOptimized();
  const [senderProfiles, setSenderProfiles] = useState<Record<string, any>>({});
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Memoized item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    messages,
    currentUserId,
    senderProfiles
  }), [messages, currentUserId, senderProfiles]);

  // Load sender profiles with caching
  const loadSenderProfiles = useCallback(async () => {
    if (isLoadingProfiles) return;

    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const missingProfiles = senderIds.filter(id => !senderProfiles[id]);
    
    if (missingProfiles.length === 0) return;

    setIsLoadingProfiles(true);
    
    try {
      const profilePromises = missingProfiles.map(async (senderId) => {
        const cacheKey = `profile_${senderId}`;
        let profile = getCachedData(cacheKey);
        
        if (!profile) {
          // Simulate profile fetch - replace with actual API call
          profile = {
            id: senderId,
            full_name: `User ${senderId.slice(0, 8)}`,
            avatar_url: null
          };
          setCachedData(cacheKey, profile);
        }
        
        return [senderId, profile];
      });

      const profiles = await Promise.all(profilePromises);
      const profileMap = Object.fromEntries(profiles);
      
      setSenderProfiles(prev => ({ ...prev, ...profileMap }));
    } catch (error) {
      console.error('Failed to load sender profiles:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [messages, senderProfiles, isLoadingProfiles, getCachedData, setCachedData]);

  // Load profiles when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const optimizedLoad = measurePerformance('profileLoad', loadSenderProfiles);
      optimizedLoad();
    }
  }, [messages.length, loadSenderProfiles, measurePerformance]);

  // Handle scroll to load more messages
  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    if (scrollOffset === 0 && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore]);

  return (
    <div className="relative">
      <List
        height={height}
        width="100%"
        itemCount={messages.length}
        itemSize={80}
        itemData={itemData}
        onScroll={handleScroll}
        overscanCount={5}
      >
        {MessageItem}
      </List>
      
      {isLoadingProfiles && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground">
          Loading profiles...
        </div>
      )}
    </div>
  );
};

export default OptimizedVirtualizedMessageList;
