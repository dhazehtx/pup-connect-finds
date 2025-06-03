
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FraudCheckRequest {
  user_id: string;
  action_type: 'profile_creation' | 'listing_creation' | 'message_sent' | 'payment_attempt';
  data: any;
  ip_address?: string;
  user_agent?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      user_id,
      action_type,
      data,
      ip_address,
      user_agent
    }: FraudCheckRequest = await req.json();

    console.log('Running fraud detection for:', { user_id, action_type });

    let riskScore = 0;
    const flags: string[] = [];
    const recommendations: string[] = [];

    // Get user profile and history
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    const { data: userHistory } = await supabaseClient
      .from('user_interactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(100);

    // Basic fraud detection rules
    
    // 1. New account check
    if (profile && new Date(profile.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      riskScore += 20;
      flags.push('new_account');
    }

    // 2. Rate limiting check
    const recentActions = userHistory?.filter(action => 
      action.interaction_type === action_type && 
      new Date(action.created_at) > new Date(Date.now() - 60 * 60 * 1000)
    ) || [];

    if (recentActions.length > 10) {
      riskScore += 30;
      flags.push('high_frequency_actions');
    }

    // 3. Profile completeness check
    if (profile && (!profile.full_name || !profile.phone || !profile.location)) {
      riskScore += 15;
      flags.push('incomplete_profile');
    }

    // 4. Action-specific checks
    if (action_type === 'listing_creation') {
      if (!data.images || data.images.length === 0) {
        riskScore += 25;
        flags.push('listing_no_images');
      }
      
      if (data.price && (data.price < 100 || data.price > 10000)) {
        riskScore += 20;
        flags.push('suspicious_price');
      }
    }

    if (action_type === 'message_sent') {
      // Check for spam patterns
      const messageLength = data.content?.length || 0;
      if (messageLength < 10) {
        riskScore += 10;
        flags.push('short_message');
      }
      
      // Check for repeated messages
      const recentMessages = userHistory?.filter(action => 
        action.interaction_type === 'message_sent' &&
        action.metadata?.content === data.content
      ) || [];
      
      if (recentMessages.length > 3) {
        riskScore += 40;
        flags.push('repeated_messages');
      }
    }

    // 5. IP and device checks (basic)
    if (ip_address) {
      // In production, you'd check against known bad IP lists
      // For now, just log it
      console.log('IP address:', ip_address);
    }

    // Generate recommendations based on risk score
    if (riskScore >= 70) {
      recommendations.push('block_action');
      recommendations.push('require_verification');
    } else if (riskScore >= 40) {
      recommendations.push('require_manual_review');
      recommendations.push('limit_actions');
    } else if (riskScore >= 20) {
      recommendations.push('increase_monitoring');
    }

    // Log the fraud check
    const { error: logError } = await supabaseClient
      .from('user_interactions')
      .insert({
        user_id,
        interaction_type: 'fraud_check',
        target_type: action_type,
        metadata: {
          risk_score: riskScore,
          flags,
          recommendations,
          ip_address,
          user_agent,
          data_summary: Object.keys(data)
        }
      });

    if (logError) {
      console.error('Failed to log fraud check:', logError);
    }

    const result = {
      risk_score: riskScore,
      risk_level: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
      flags,
      recommendations,
      action_allowed: riskScore < 70,
      requires_review: riskScore >= 40
    };

    console.log('Fraud detection result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in fraud-detection:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
