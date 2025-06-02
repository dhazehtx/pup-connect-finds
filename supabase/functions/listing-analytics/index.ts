
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'track_listing_view':
        return await trackListingView(supabaseClient, user.id, payload);
      case 'get_listing_analytics':
        return await getListingAnalytics(supabaseClient, user.id, payload);
      case 'get_revenue_analytics':
        return await getRevenueAnalytics(supabaseClient, user.id, payload);
      case 'get_performance_metrics':
        return await getPerformanceMetrics(supabaseClient, user.id, payload);
      case 'generate_analytics_report':
        return await generateAnalyticsReport(supabaseClient, user.id, payload);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in listing-analytics:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function trackListingView(supabase: any, userId: string, data: any) {
  const { listing_id, session_id, ip_address, user_agent } = data;

  // Track the interaction
  await supabase
    .from('user_interactions')
    .insert({
      user_id: userId,
      session_id,
      interaction_type: 'listing_view',
      target_type: 'listing',
      target_id: listing_id,
      ip_address,
      user_agent,
      metadata: { timestamp: new Date().toISOString() }
    });

  // Update performance metrics
  await updatePerformanceMetric(supabase, 'listing_views', 'listing', listing_id, 1);

  return new Response(JSON.stringify({
    success: true,
    message: 'View tracked successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getListingAnalytics(supabase: any, userId: string, data: any) {
  const { listing_id, period_days = 30 } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period_days);

  // Get view count
  const { data: views } = await supabase
    .from('user_interactions')
    .select('id')
    .eq('target_type', 'listing')
    .eq('target_id', listing_id)
    .eq('interaction_type', 'listing_view')
    .gte('created_at', startDate.toISOString());

  // Get favorites count
  const { data: favorites } = await supabase
    .from('favorites')
    .select('id')
    .eq('listing_id', listing_id);

  // Get messages/inquiries count
  const { data: inquiries } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listing_id);

  // Get performance metrics
  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('entity_type', 'listing')
    .eq('entity_id', listing_id)
    .gte('period_start', startDate.toISOString());

  return new Response(JSON.stringify({
    success: true,
    analytics: {
      views: views?.length || 0,
      favorites: favorites?.length || 0,
      inquiries: inquiries?.length || 0,
      metrics: metrics || [],
      period_days
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getRevenueAnalytics(supabase: any, userId: string, data: any) {
  const { period_days = 30, revenue_type } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period_days);

  let query = supabase
    .from('revenue_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0]);

  if (revenue_type) {
    query = query.eq('revenue_type', revenue_type);
  }

  const { data: revenue, error } = await query.order('date', { ascending: true });
  if (error) throw error;

  // Calculate totals by type
  const summary = revenue.reduce((acc: any, entry: any) => {
    if (!acc[entry.revenue_type]) {
      acc[entry.revenue_type] = 0;
    }
    acc[entry.revenue_type] += parseFloat(entry.amount);
    return acc;
  }, {});

  const totalRevenue = revenue.reduce((sum: number, entry: any) => 
    sum + parseFloat(entry.amount), 0);

  return new Response(JSON.stringify({
    success: true,
    revenue_analytics: {
      total_revenue: totalRevenue,
      revenue_by_type: summary,
      daily_revenue: revenue,
      period_days
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getPerformanceMetrics(supabase: any, userId: string, data: any) {
  const { metric_type, period_days = 30 } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period_days);

  let query = supabase
    .from('performance_metrics')
    .select('*')
    .gte('period_start', startDate.toISOString());

  if (metric_type) {
    query = query.eq('metric_type', metric_type);
  }

  const { data: metrics, error } = await query.order('period_start', { ascending: true });
  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    performance_metrics: metrics
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateAnalyticsReport(supabase: any, userId: string, data: any) {
  const { report_type = 'comprehensive', period_days = 30 } = data;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period_days);

  // Get user's listings
  const { data: listings } = await supabase
    .from('dog_listings')
    .select('id, dog_name, created_at')
    .eq('user_id', userId);

  // Get analytics for each listing
  const listingAnalytics = await Promise.all(
    listings.map(async (listing: any) => {
      const { data: views } = await supabase
        .from('user_interactions')
        .select('id')
        .eq('target_id', listing.id)
        .eq('interaction_type', 'listing_view')
        .gte('created_at', startDate.toISOString());

      const { data: favorites } = await supabase
        .from('favorites')
        .select('id')
        .eq('listing_id', listing.id);

      return {
        listing_id: listing.id,
        listing_name: listing.dog_name,
        views: views?.length || 0,
        favorites: favorites?.length || 0
      };
    })
  );

  return new Response(JSON.stringify({
    success: true,
    report: {
      period_days,
      total_listings: listings.length,
      listing_analytics: listingAnalytics,
      generated_at: new Date().toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updatePerformanceMetric(supabase: any, metricType: string, entityType: string, entityId: string, value: number) {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 1);

  // Try to update existing metric for today
  const { data: existing } = await supabase
    .from('performance_metrics')
    .select('id, metric_value')
    .eq('metric_type', metricType)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('period_start', periodStart.toISOString())
    .single();

  if (existing) {
    await supabase
      .from('performance_metrics')
      .update({ metric_value: existing.metric_value + value })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('performance_metrics')
      .insert({
        metric_type: metricType,
        entity_type: entityType,
        entity_id: entityId,
        metric_value: value,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      });
  }
}
