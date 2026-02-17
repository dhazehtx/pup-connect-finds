import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useBlockStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['/api/blocks/status', userId],
    queryFn: async () => {
      if (!userId) return { blocked: false, blockedByMe: false, blockedByThem: false };
      const res = await apiRequest(`/api/blocks/status/${userId}`);
      return res.json();
    },
    enabled: !!userId,
  });
}

export function useToggleBlock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blockedId: string) => {
      const res = await apiRequest(`/api/blocks/${blockedId}`, { method: 'POST' });
      return res.json();
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
      const res = await apiRequest('/api/blocks/list');
      return res.json();
    },
  });
}
