import { supabase } from '@/integrations/supabase/client';

/** Permanently delete the signed-in account after password verification. */
export async function deleteAccountWithPassword(password: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/user/delete-account', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Failed to delete account');
  }
}
