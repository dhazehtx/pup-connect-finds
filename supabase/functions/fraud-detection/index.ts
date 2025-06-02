
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { action, ...params } = await req.json();

    // Get request info
    const userAgent = req.headers.get('User-Agent');
    const forwardedFor = req.headers.get('X-Forwarded-For');
    const realIP = req.headers.get('X-Real-IP');
    const ipAddress = forwardedFor?.split(',')[0] || realIP || '';

    if (action === 'check_suspicious_activity') {
      const { user_id, activity_type, activity_data = {} } = params;

      console.log(`Checking suspicious activity for user ${user_id}: ${activity_type}`);

      let riskScore = 0;
      const riskFactors = [];

      // Check 1: Rapid successive actions
      if (user_id) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const { data: recentInteractions, error } = await supabaseClient
          .from('user_interactions')
          .select('*')
          .eq('user_id', user_id)
          .gte('created_at', fiveMinutesAgo.toISOString());

        if (!error && recentInteractions.length > 20) {
          riskScore += 30;
          riskFactors.push('rapid_successive_actions');
        }
      }

      // Check 2: Multiple accounts from same IP
      if (ipAddress) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: ipInteractions, error } = await supabaseClient
          .from('user_interactions')
          .select('user_id')
          .eq('ip_address', ipAddress)
          .gte('created_at', today.toISOString());

        if (!error) {
          const uniqueUsers = new Set(ipInteractions.map(i => i.user_id)).size;
          if (uniqueUsers > 5) {
            riskScore += 25;
            riskFactors.push('multiple_accounts_same_ip');
          }
        }
      }

      // Check 3: Unusual listing patterns
      if (activity_type === 'create_listing') {
        const { data: userListings, error } = await supabaseClient
          .from('dog_listings')
          .select('*')
          .eq('user_id', user_id);

        if (!error && userListings.length > 10) {
          riskScore += 20;
          riskFactors.push('excessive_listings');
        }

        // Check for duplicate content
        const currentContent = activity_data.description?.toLowerCase() || '';
        const duplicateListings = userListings.filter(listing => 
          listing.description?.toLowerCase().includes(currentContent.substring(0, 50))
        );

        if (duplicateListings.length > 0) {
          riskScore += 35;
          riskFactors.push('duplicate_content');
        }
      }

      // Check 4: Price anomalies
      if (activity_type === 'create_listing' && activity_data.price) {
        const { data: similarBreedListings, error } = await supabaseClient
          .from('dog_listings')
          .select('price')
          .eq('breed', activity_data.breed)
          .eq('status', 'active');

        if (!error && similarBreedListings.length > 5) {
          const prices = similarBreedListings.map(l => l.price);
          const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
          const priceDeviation = Math.abs(activity_data.price - avgPrice) / avgPrice;

          if (priceDeviation > 0.5) { // 50% deviation from average
            riskScore += 15;
            riskFactors.push('price_anomaly');
          }
        }
      }

      // Determine severity
      let severity = 'low';
      if (riskScore >= 50) severity = 'high';
      else if (riskScore >= 25) severity = 'medium';

      // Log security event if risk detected
      if (riskScore > 0) {
        await supabaseClient
          .from('security_events')
          .insert({
            user_id,
            event_type: 'suspicious_activity_detected',
            severity,
            details: {
              activity_type,
              risk_score: riskScore,
              risk_factors: riskFactors,
              activity_data
            },
            ip_address: ipAddress,
            user_agent: userAgent
          });
      }

      return new Response(JSON.stringify({
        success: true,
        risk_score: riskScore,
        severity,
        risk_factors: riskFactors,
        action_required: riskScore >= 50
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'check_rate_limit') {
      const { identifier, endpoint, limit = 100, window_minutes = 60 } = params;

      const windowStart = new Date(Date.now() - window_minutes * 60 * 1000);
      const windowEnd = new Date();

      // Check existing rate limit record
      const { data: existingLimit, error: selectError } = await supabaseClient
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_end', new Date().toISOString())
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existingLimit) {
        // Update existing record
        const newCount = existingLimit.requests_count + 1;
        
        if (newCount > limit) {
          // Rate limit exceeded
          await supabaseClient
            .from('security_events')
            .insert({
              event_type: 'rate_limit_exceeded',
              severity: 'medium',
              details: {
                identifier,
                endpoint,
                requests_count: newCount,
                limit
              },
              ip_address: ipAddress,
              user_agent: userAgent
            });

          return new Response(JSON.stringify({
            success: false,
            rate_limited: true,
            requests_count: newCount,
            limit,
            reset_time: existingLimit.window_end
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update count
        await supabaseClient
          .from('rate_limits')
          .update({ 
            requests_count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLimit.id);

        return new Response(JSON.stringify({
          success: true,
          rate_limited: false,
          requests_count: newCount,
          limit,
          remaining: limit - newCount
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Create new rate limit record
        await supabaseClient
          .from('rate_limits')
          .insert({
            identifier,
            endpoint,
            requests_count: 1,
            window_start: windowStart.toISOString(),
            window_end: windowEnd.toISOString()
          });

        return new Response(JSON.stringify({
          success: true,
          rate_limited: false,
          requests_count: 1,
          limit,
          remaining: limit - 1
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in fraud-detection:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
