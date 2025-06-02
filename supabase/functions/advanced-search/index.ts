
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

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'bulk_update_listings':
        return await bulkUpdateListings(supabaseClient, payload);
      case 'bulk_delete_listings':
        return await bulkDeleteListings(supabaseClient, payload);
      case 'schedule_listing_renewal':
        return await scheduleListingRenewal(supabaseClient, payload);
      case 'cleanup_expired_listings':
        return await cleanupExpiredListings(supabaseClient);
      case 'process_scheduled_tasks':
        return await processScheduledTasks(supabaseClient);
      case 'get_marketplace_stats':
        return await getMarketplaceStats(supabaseClient);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in advanced-search:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function bulkUpdateListings(supabase: any, data: any) {
  const { listing_ids, updates, user_id } = data;

  console.log(`Bulk updating ${listing_ids.length} listings for user ${user_id}`);

  // Verify user owns all listings
  const { data: userListings } = await supabase
    .from('dog_listings')
    .select('id')
    .eq('user_id', user_id)
    .in('id', listing_ids);

  if (userListings.length !== listing_ids.length) {
    throw new Error('Some listings not found or not owned by user');
  }

  // Perform bulk update
  const { data: updatedListings, error } = await supabase
    .from('dog_listings')
    .update(updates)
    .in('id', listing_ids)
    .select();

  if (error) throw error;

  // Log the bulk operation
  await supabase
    .from('user_interactions')
    .insert({
      user_id,
      interaction_type: 'bulk_update',
      target_type: 'listing',
      metadata: {
        listing_count: listing_ids.length,
        updates,
        timestamp: new Date().toISOString()
      }
    });

  return new Response(JSON.stringify({
    success: true,
    updated_listings: updatedListings,
    count: updatedListings.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function bulkDeleteListings(supabase: any, data: any) {
  const { listing_ids, user_id } = data;

  console.log(`Bulk deleting ${listing_ids.length} listings for user ${user_id}`);

  // Verify user owns all listings
  const { data: userListings } = await supabase
    .from('dog_listings')
    .select('id')
    .eq('user_id', user_id)
    .in('id', listing_ids);

  if (userListings.length !== listing_ids.length) {
    throw new Error('Some listings not found or not owned by user');
  }

  // Delete listings
  const { error } = await supabase
    .from('dog_listings')
    .delete()
    .in('id', listing_ids);

  if (error) throw error;

  // Log the bulk operation
  await supabase
    .from('user_interactions')
    .insert({
      user_id,
      interaction_type: 'bulk_delete',
      target_type: 'listing',
      metadata: {
        listing_count: listing_ids.length,
        timestamp: new Date().toISOString()
      }
    });

  return new Response(JSON.stringify({
    success: true,
    deleted_count: listing_ids.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function scheduleListingRenewal(supabase: any, data: any) {
  const { listing_id, user_id, renewal_date } = data;

  const { data: task, error } = await supabase
    .from('scheduled_tasks')
    .insert({
      task_type: 'listing_renewal',
      task_data: {
        listing_id,
        user_id,
        renewal_type: 'automatic'
      },
      scheduled_for: renewal_date
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    scheduled_task: task
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function cleanupExpiredListings(supabase: any) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  console.log('Cleaning up expired listings older than:', thirtyDaysAgo.toISOString());

  // Mark old inactive listings as expired
  const { data: expiredListings, error } = await supabase
    .from('dog_listings')
    .update({ status: 'expired' })
    .eq('status', 'inactive')
    .lt('updated_at', thirtyDaysAgo.toISOString())
    .select('id, user_id');

  if (error) throw error;

  // Create notifications for affected users
  const notifications = expiredListings.map((listing: any) => ({
    user_id: listing.user_id,
    type: 'listing_expired',
    title: 'Listing Expired',
    message: 'One of your listings has been automatically expired due to inactivity.',
    related_id: listing.id
  }));

  if (notifications.length > 0) {
    await supabase
      .from('notifications')
      .insert(notifications);
  }

  return new Response(JSON.stringify({
    success: true,
    expired_count: expiredListings.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processScheduledTasks(supabase: any) {
  const now = new Date().toISOString();

  // Get pending tasks that are due
  const { data: dueTasks, error } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .lt('attempts', 3);

  if (error) throw error;

  console.log(`Processing ${dueTasks.length} scheduled tasks`);

  const results = [];

  for (const task of dueTasks) {
    try {
      // Mark as running
      await supabase
        .from('scheduled_tasks')
        .update({ 
          status: 'running',
          attempts: task.attempts + 1
        })
        .eq('id', task.id);

      let result;
      switch (task.task_type) {
        case 'listing_renewal':
          result = await processListingRenewal(supabase, task);
          break;
        case 'cleanup':
          result = await cleanupExpiredListings(supabase);
          break;
        default:
          throw new Error(`Unknown task type: ${task.task_type}`);
      }

      // Mark as completed
      await supabase
        .from('scheduled_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      results.push({ task_id: task.id, status: 'completed', result });

    } catch (error) {
      console.error(`Task ${task.id} failed:`, error);

      // Mark as failed if max attempts reached
      const newStatus = task.attempts >= 2 ? 'failed' : 'pending';
      await supabase
        .from('scheduled_tasks')
        .update({ 
          status: newStatus,
          error_message: error.message
        })
        .eq('id', task.id);

      results.push({ task_id: task.id, status: 'failed', error: error.message });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    processed_tasks: results
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processListingRenewal(supabase: any, task: any) {
  const { listing_id } = task.task_data;

  // Reactivate the listing
  const { data: listing, error } = await supabase
    .from('dog_listings')
    .update({ 
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', listing_id)
    .select('user_id')
    .single();

  if (error) throw error;

  // Send notification to user
  await supabase
    .from('notifications')
    .insert({
      user_id: listing.user_id,
      type: 'listing_renewed',
      title: 'Listing Renewed',
      message: 'Your listing has been automatically renewed.',
      related_id: listing_id
    });

  return { listing_id, status: 'renewed' };
}

async function getMarketplaceStats(supabase: any) {
  // Get basic stats
  const [
    { count: totalListings },
    { count: activeListings },
    { count: totalUsers },
    { count: verifiedUsers }
  ] = await Promise.all([
    supabase.from('dog_listings').select('*', { count: 'exact', head: true }),
    supabase.from('dog_listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', true)
  ]);

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentActivity } = await supabase
    .from('user_interactions')
    .select('interaction_type')
    .gte('created_at', sevenDaysAgo.toISOString());

  const activityCounts = recentActivity?.reduce((acc: any, interaction: any) => {
    acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
    return acc;
  }, {}) || {};

  return new Response(JSON.stringify({
    success: true,
    marketplace_stats: {
      total_listings: totalListings,
      active_listings: activeListings,
      total_users: totalUsers,
      verified_users: verifiedUsers,
      verification_rate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(1) : 0,
      recent_activity: activityCounts,
      generated_at: new Date().toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
