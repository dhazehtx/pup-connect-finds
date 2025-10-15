import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function fetchProviderStripeStatus(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('stripe_account_id, stripe_connected')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data; // { stripe_account_id: string|null, stripe_connected: boolean }
}
