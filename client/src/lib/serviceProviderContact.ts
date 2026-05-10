import { apiRequest } from '@/lib/api';

/** Returns conversation id or null. */
export async function startProviderConversation(targetUserId: string): Promise<string | null> {
  const response = await apiRequest('/api/messaging/conversations/find-or-create', {
    method: 'POST',
    body: { targetUserId },
  });
  const convId =
    (response as { conversationId?: string }).conversationId || (response as { id?: string }).id;
  return convId || null;
}
