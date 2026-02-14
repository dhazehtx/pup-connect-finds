
import { usePostLikes } from './usePostLikes';

export const useRealtimePostLikes = (postId: string) => {
  return usePostLikes(postId);
};
