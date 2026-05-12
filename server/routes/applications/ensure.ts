import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';

export async function ensureApplication(req: Request, res: Response) {
  try {
    const { userId, providerId } = req.body;
    
    console.log('[ENSURE APPLICATION] Request:', { userId, providerId });
    
    if (!userId || !providerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing userId or providerId" 
      });
    }

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Supabase is not configured',
      });
    }

    // Try to find existing draft/in-progress application
    const { data: existing, error: existingError } = await supabase
      .from('provider_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .in('status', ['draft', 'in_progress'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error('[ENSURE APPLICATION] Error fetching existing:', existingError);
      throw existingError;
    }

    if (existing?.id) {
      console.log('[ENSURE APPLICATION] Found existing application:', existing.id);
      return res.json({ 
        success: true, 
        applicationId: existing.id 
      });
    }

    // Create new draft application
    const { data: newApp, error: createError } = await supabase
      .from('provider_applications')
      .insert({ 
        user_id: userId, 
        provider_id: providerId, 
        status: 'draft' 
      })
      .select('id')
      .single();

    if (createError) {
      console.error('[ENSURE APPLICATION] Error creating application:', createError);
      throw createError;
    }

    console.log('[ENSURE APPLICATION] Created new application:', newApp.id);
    return res.json({ 
      success: true, 
      applicationId: newApp.id 
    });

  } catch (error: any) {
    console.error('[ENSURE APPLICATION] ERROR:', error);
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Internal server error' 
    });
  }
}