import { createClient } from '@supabase/supabase-js';

// Helper to ensure all onboarding IDs exist before Stripe Connect
export async function ensureOnboardingIds(): Promise<{
  userId: string; 
  providerId: string; 
  applicationId: string;
}> {
  try {
    // Get the current Supabase session for Bearer token auth
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!, 
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error("Please sign in to continue.");
    }
    
    console.log('[ENSURE IDS] Making authenticated request...');
    
    const res = await fetch("/api/onboarding/ensure-ids", { 
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Send Bearer token to avoid cookie/iframe issues
        "Authorization": `Bearer ${session.access_token}`
      }
    });
    
    const data = await res.json();
    
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || "Could not ensure onboarding IDs.");
    }
    
    // Persist applicationId for future steps
    try { 
      localStorage.setItem("applicationId", data.applicationId); 
    } catch (e) {
      console.warn('Could not save applicationId to localStorage:', e);
    }
    
    console.log('[ENSURE IDS] Success:', data);
    
    return {
      userId: data.userId,
      providerId: data.providerId, 
      applicationId: data.applicationId
    };
  } catch (error) {
    console.error('[ENSURE IDS] Error:', error);
    throw error;
  }
}