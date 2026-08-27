import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useBlockStatus(userId: string | undefined) {
  // Block status is meaningful only for a signed-in viewer; querying as a guest
  // just yields a noisy 401. Gate the request on authentication.
  const { user } = useAuth();
  return useQuery({
    queryKey: ['/api/blocks/status', userId],
    queryFn: async () => {
      if (!userId) return { blocked: false, blockedByMe: false, blockedByThem: false };
      return apiRequest(`/api/blocks/status/${userId}`) as Promise<{
        blocked: boolean;
        blockedByMe: boolean;
        blockedByThem: boolean;
      }>;
    },
    enabled: !!userId && !!user,
  });
}

export function useToggleBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blockedId: string) => {
      return apiRequest(`/api/blocks/${blockedId}`, { method: 'POST' }) as Promise<{
        ok: boolean;
        blocked: boolean;
        action: string;
      }>;
    },
    onSuccess: (data, blockedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocks/status', blockedId] });
      queryClient.invalidateQueries({ queryKey: ['/api/blocks/list'] });
      toast({
        title: data.blocked ? 'User blocked' : 'User unblocked',
        description: data.blocked
          ? 'You will no longer see content from this user'
          : 'You can now interact with this user again',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update block status',
        variant: 'destructive',
      });
    },
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ['/api/blocks/list'],
    queryFn: async () => {
      return apiRequest('/api/blocks/list');
    },
  });
}
