import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';

export async function ensureOnboardingIds(req: Request, res: Response) {
  try {
    console.log('[ENSURE IDS] Starting ID resolution...');
    
    // Get userId from the authenticated request
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    console.log('[ENSURE IDS] User ID:', userId);
    
    // 1. Ensure provider exists
    let providerId: string;
    
    const { data: existingProvider, error: providerFetchError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (providerFetchError) {
      console.error('[ENSURE IDS] Provider fetch error:', providerFetchError);
      throw providerFetchError;
    }
    
    if (existingProvider?.id) {
      providerId = existingProvider.id;
      console.log('[ENSURE IDS] Found existing provider:', providerId);
    } else {
      // Create new provider
      const { data: newProvider, error: createProviderError } = await supabase
        .from('providers')
        .insert({ user_id: userId })
        .select('id')
        .single();
        
      if (createProviderError) {
        console.error('[ENSURE IDS] Provider creation error:', createProviderError);
        throw createProviderError;
      }
      
      providerId = newProvider.id;
      console.log('[ENSURE IDS] Created new provider:', providerId);
    }
    
    // 2. Ensure application exists
    let applicationId: string;
    
    const { data: existingApp, error: appFetchError } = await supabase
      .from('provider_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .in('status', ['draft', 'in_progress'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (appFetchError) {
      console.error('[ENSURE IDS] Application fetch error:', appFetchError);
      throw appFetchError;
    }
    
    if (existingApp?.id) {
      applicationId = existingApp.id;
      console.log('[ENSURE IDS] Found existing application:', applicationId);
    } else {
      // Create new draft application
      const { data: newApp, error: createAppError } = await supabase
        .from('provider_applications')
        .insert({ 
          user_id: userId, 
          provider_id: providerId, 
          status: 'draft' 
        })
        .select('id')
        .single();
        
      if (createAppError) {
        console.error('[ENSURE IDS] Application creation error:', createAppError);
        throw createAppError;
      }
      
      applicationId = newApp.id;
      console.log('[ENSURE IDS] Created new application:', applicationId);
    }

    console.log('[ENSURE IDS] All IDs resolved successfully:', { userId, providerId, applicationId });
    
    return res.json({
      success: true,
      userId,
      providerId,
      applicationId
    });
    
  } catch (error: any) {
    console.error('[ENSURE IDS] ERROR:', error);
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Internal server error' 
    });
  }
}