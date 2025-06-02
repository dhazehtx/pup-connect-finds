
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

    if (action === 'track_interaction') {
      const { user_id, session_id, interaction_type, target_type, target_id, metadata } = params;

      // Get request info
      const userAgent = req.headers.get('User-Agent');
      const forwardedFor = req.headers.get('X-Forwarded-For');
      const realIP = req.headers.get('X-Real-IP');
      const ipAddress = forwardedFor?.split(',')[0] || realIP || '';

      const { data: interaction, error } = await supabaseClient
        .from('user_interactions')
        .insert({
          user_id,
          session_id,
          interaction_type,
          target_type,
          target_id,
          metadata: metadata || {},
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        interaction_id: interaction.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_analytics') {
      const { user_id, date_from, date_to, metric_types } = params;

      // Get user interactions
      let query = supabaseClient
        .from('user_interactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (date_from) {
        query = query.gte('created_at', date_from);
      }

      if (date_to) {
        query = query.lte('created_at', date_to);
      }

      const { data: interactions, error: interactionsError } = await query;

      if (interactionsError) throw interactionsError;

      // Process analytics
      const analytics = {
        total_interactions: interactions.length,
        unique_users: new Set(interactions.map(i => i.user_id)).size,
        interaction_types: {},
        popular_listings: {},
        hourly_distribution: {},
        daily_distribution: {},
        user_journey: []
      };

      // Count interaction types
      interactions.forEach(interaction => {
        analytics.interaction_types[interaction.interaction_type] = 
          (analytics.interaction_types[interaction.interaction_type] || 0) + 1;

        // Track popular listings
        if (interaction.target_type === 'listing' && interaction.target_id) {
          analytics.popular_listings[interaction.target_id] = 
            (analytics.popular_listings[interaction.target_id] || 0) + 1;
        }

        // Hourly distribution
        const hour = new Date(interaction.created_at).getHours();
        analytics.hourly_distribution[hour] = (analytics.hourly_distribution[hour] || 0) + 1;

        // Daily distribution
        const day = new Date(interaction.created_at).toISOString().split('T')[0];
        analytics.daily_distribution[day] = (analytics.daily_distribution[day] || 0) + 1;
      });

      // If user_id specified, get user journey
      if (user_id) {
        const userInteractions = interactions
          .filter(i => i.user_id === user_id)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        analytics.user_journey = userInteractions.map(i => ({
          timestamp: i.created_at,
          action: i.interaction_type,
          target: i.target_type,
          target_id: i.target_id
        }));
      }

      return new Response(JSON.stringify({
        success: true,
        analytics
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'generate_report') {
      const { period = '7d' } = params;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      // Get data for the period
      const { data: interactions, error } = await supabaseClient
        .from('user_interactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const report = {
        period,
        date_range: { start: startDate.toISOString(), end: endDate.toISOString() },
        summary: {
          total_interactions: interactions.length,
          unique_users: new Set(interactions.map(i => i.user_id)).size,
          avg_interactions_per_user: 0,
          most_popular_action: '',
          engagement_rate: 0
        },
        trends: {},
        top_content: []
      };

      if (report.summary.unique_users > 0) {
        report.summary.avg_interactions_per_user = 
          Math.round((interactions.length / report.summary.unique_users) * 100) / 100;
      }

      // Find most popular action
      const actionCounts = {};
      interactions.forEach(i => {
        actionCounts[i.interaction_type] = (actionCounts[i.interaction_type] || 0) + 1;
      });

      report.summary.most_popular_action = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return new Response(JSON.stringify({
        success: true,
        report
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in behavioral-analytics:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
