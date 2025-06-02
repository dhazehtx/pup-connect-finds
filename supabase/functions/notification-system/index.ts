
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

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'monitor_login_anomalies':
        return await monitorLoginAnomalies(supabaseClient, payload);
      case 'detect_suspicious_activity':
        return await detectSuspiciousActivity(supabaseClient, payload);
      case 'check_account_security':
        return await checkAccountSecurity(supabaseClient, payload);
      case 'log_security_event':
        return await logSecurityEvent(supabaseClient, payload);
      case 'get_security_alerts':
        return await getSecurityAlerts(supabaseClient, payload);
      case 'resolve_security_event':
        return await resolveSecurityEvent(supabaseClient, payload);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in notification-system:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function monitorLoginAnomalies(supabase: any, data: any) {
  const { user_id, ip_address, user_agent, location } = data;

  console.log(`Monitoring login for user ${user_id} from IP ${ip_address}`);

  // Get user's recent login history
  const { data: recentLogins } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', user_id)
    .eq('interaction_type', 'login')
    .order('created_at', { ascending: false })
    .limit(10);

  const anomalies = [];

  // Check for new IP address
  const knownIPs = recentLogins?.map(login => login.ip_address) || [];
  if (ip_address && !knownIPs.includes(ip_address)) {
    anomalies.push({
      type: 'new_ip_address',
      severity: 'medium',
      details: { new_ip: ip_address, known_ips: knownIPs.slice(0, 3) }
    });
  }

  // Check for unusual time patterns
  const currentHour = new Date().getHours();
  const recentHours = recentLogins?.map(login => new Date(login.created_at).getHours()) || [];
  const avgHour = recentHours.length > 0 ? recentHours.reduce((a, b) => a + b, 0) / recentHours.length : currentHour;
  
  if (Math.abs(currentHour - avgHour) > 6) {
    anomalies.push({
      type: 'unusual_time',
      severity: 'low',
      details: { current_hour: currentHour, typical_hour: Math.round(avgHour) }
    });
  }

  // Check for rapid successive login attempts
  const lastLogin = recentLogins?.[0];
  if (lastLogin) {
    const timeDiff = (new Date().getTime() - new Date(lastLogin.created_at).getTime()) / 1000;
    if (timeDiff < 60) { // Less than 1 minute
      anomalies.push({
        type: 'rapid_login_attempts',
        severity: 'high',
        details: { time_diff_seconds: timeDiff }
      });
    }
  }

  // Log security events for anomalies
  for (const anomaly of anomalies) {
    await supabase
      .from('security_events')
      .insert({
        user_id,
        event_type: 'login_anomaly',
        severity: anomaly.severity,
        details: {
          anomaly_type: anomaly.type,
          ...anomaly.details,
          ip_address,
          user_agent,
          location
        },
        ip_address,
        user_agent
      });

    // Send notification for medium/high severity
    if (anomaly.severity !== 'low') {
      await supabase
        .from('notifications')
        .insert({
          user_id,
          type: 'security_alert',
          title: 'Unusual Login Activity',
          message: `We detected ${anomaly.type.replace('_', ' ')} on your account. If this wasn't you, please secure your account.`
        });
    }
  }

  // Log successful login
  await supabase
    .from('user_interactions')
    .insert({
      user_id,
      interaction_type: 'login',
      metadata: { location, anomalies_detected: anomalies.length },
      ip_address,
      user_agent
    });

  return new Response(JSON.stringify({
    success: true,
    anomalies_detected: anomalies.length,
    anomalies,
    security_level: anomalies.some(a => a.severity === 'high') ? 'high' : 
                   anomalies.some(a => a.severity === 'medium') ? 'medium' : 'low'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function detectSuspiciousActivity(supabase: any, data: any) {
  const { user_id, activity_type, metadata = {} } = data;

  const suspiciousPatterns = [];

  // Check for rapid-fire actions
  const { data: recentActions } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', user_id)
    .eq('interaction_type', activity_type)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
    .order('created_at', { ascending: false });

  if (recentActions && recentActions.length > 10) {
    suspiciousPatterns.push({
      type: 'rapid_fire_actions',
      severity: 'high',
      details: { action_count: recentActions.length, time_window: '5_minutes' }
    });
  }

  // Check for bot-like behavior patterns
  if (recentActions && recentActions.length > 3) {
    const timeDiffs = [];
    for (let i = 1; i < recentActions.length; i++) {
      const diff = new Date(recentActions[i-1].created_at).getTime() - new Date(recentActions[i].created_at).getTime();
      timeDiffs.push(diff);
    }
    
    const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / timeDiffs.length;
    
    // Very consistent timing might indicate bot behavior
    if (variance < 1000 && avgDiff < 5000) { // Very consistent sub-5-second intervals
      suspiciousPatterns.push({
        type: 'bot_like_timing',
        severity: 'medium',
        details: { avg_interval_ms: avgDiff, variance }
      });
    }
  }

  // Log suspicious activity
  if (suspiciousPatterns.length > 0) {
    await supabase
      .from('security_events')
      .insert({
        user_id,
        event_type: 'suspicious_activity',
        severity: suspiciousPatterns.some(p => p.severity === 'high') ? 'high' : 'medium',
        details: {
          activity_type,
          patterns: suspiciousPatterns,
          metadata
        }
      });
  }

  return new Response(JSON.stringify({
    success: true,
    suspicious_patterns: suspiciousPatterns,
    risk_level: suspiciousPatterns.some(p => p.severity === 'high') ? 'high' : 
               suspiciousPatterns.some(p => p.severity === 'medium') ? 'medium' : 'low'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkAccountSecurity(supabase: any, data: any) {
  const { user_id } = data;

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

  if (!profile) {
    throw new Error('User not found');
  }

  const securityScore = {
    total: 0,
    factors: {}
  };

  // Check verification status (40 points)
  if (profile.verified) {
    securityScore.factors.verified = 40;
    securityScore.total += 40;
  } else {
    securityScore.factors.verified = 0;
  }

  // Check 2FA status (30 points)
  if (profile.two_factor_enabled) {
    securityScore.factors.two_factor = 30;
    securityScore.total += 30;
  } else {
    securityScore.factors.two_factor = 0;
  }

  // Check profile completeness (20 points)
  const completenessFields = ['full_name', 'bio', 'location', 'phone'];
  const completedFields = completenessFields.filter(field => profile[field]);
  const completenessScore = (completedFields.length / completenessFields.length) * 20;
  securityScore.factors.profile_completeness = Math.round(completenessScore);
  securityScore.total += completenessScore;

  // Check recent security events (10 points deduction for each unresolved high-severity event)
  const { data: securityEvents } = await supabase
    .from('security_events')
    .select('*')
    .eq('user_id', user_id)
    .eq('resolved', false)
    .eq('severity', 'high');

  const securityPenalty = (securityEvents?.length || 0) * 10;
  securityScore.factors.security_issues = -securityPenalty;
  securityScore.total -= securityPenalty;

  securityScore.total = Math.max(0, Math.min(100, securityScore.total));

  // Generate recommendations
  const recommendations = [];
  if (!profile.verified) {
    recommendations.push('Complete account verification to improve security');
  }
  if (!profile.two_factor_enabled) {
    recommendations.push('Enable two-factor authentication');
  }
  if (completedFields.length < completenessFields.length) {
    recommendations.push('Complete your profile information');
  }
  if (securityPenalty > 0) {
    recommendations.push('Review and resolve security alerts');
  }

  return new Response(JSON.stringify({
    success: true,
    security_assessment: {
      score: Math.round(securityScore.total),
      score_breakdown: securityScore.factors,
      risk_level: securityScore.total >= 80 ? 'low' : 
                 securityScore.total >= 60 ? 'medium' : 'high',
      recommendations,
      assessed_at: new Date().toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function logSecurityEvent(supabase: any, data: any) {
  const { user_id, event_type, severity, details, ip_address, user_agent } = data;

  const { data: event, error } = await supabase
    .from('security_events')
    .insert({
      user_id,
      event_type,
      severity,
      details,
      ip_address,
      user_agent
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    security_event: event
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getSecurityAlerts(supabase: any, data: any) {
  const { user_id, severity, resolved = false, limit = 50 } = data;

  let query = supabase
    .from('security_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (user_id) {
    query = query.eq('user_id', user_id);
  }
  if (severity) {
    query = query.eq('severity', severity);
  }
  query = query.eq('resolved', resolved);

  const { data: alerts, error } = await query;
  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    security_alerts: alerts
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function resolveSecurityEvent(supabase: any, data: any) {
  const { event_id, resolved_by, resolution_notes } = data;

  const { data: event, error } = await supabase
    .from('security_events')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by,
      details: {
        ...data.details,
        resolution_notes
      }
    })
    .eq('id', event_id)
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    resolved_event: event
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
