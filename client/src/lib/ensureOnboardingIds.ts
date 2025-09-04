// Helper to ensure all onboarding IDs exist before Stripe Connect
export async function ensureOnboardingIds(): Promise<{
  userId: string; 
  providerId: string; 
  applicationId: string;
}> {
  try {
    const res = await fetch("/api/onboarding/ensure-ids", { 
      method: "POST",
      headers: { "Content-Type": "application/json" }
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