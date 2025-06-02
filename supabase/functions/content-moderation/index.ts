
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { content_type, content_id, content_text, user_id } = await req.json();

    if (!content_type || !content_id || !content_text) {
      throw new Error('Missing required fields: content_type, content_id, content_text');
    }

    console.log(`Moderating ${content_type} content:`, content_id);

    // OpenAI moderation API call
    const openAIResponse = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content_text
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const moderationData = await openAIResponse.json();
    const result = moderationData.results[0];

    // Determine flags and confidence
    const flags = [];
    if (result.flagged) {
      Object.entries(result.categories).forEach(([category, flagged]) => {
        if (flagged) {
          flags.push(category);
        }
      });
    }

    // Calculate overall confidence (average of all category scores)
    const scores = Object.values(result.category_scores) as number[];
    const confidence = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Determine moderation status
    let moderationStatus = 'approved';
    if (result.flagged) {
      // Check severity of flags
      const highSeverityFlags = ['hate', 'violence', 'sexual', 'self-harm'];
      const hasHighSeverity = flags.some(flag => highSeverityFlags.includes(flag));
      
      moderationStatus = hasHighSeverity ? 'rejected' : 'flagged';
    }

    // Store moderation result
    const { data: moderationRecord, error: dbError } = await supabaseClient
      .from('content_moderation')
      .insert({
        content_type,
        content_id,
        user_id,
        moderation_status: moderationStatus,
        ai_confidence: confidence,
        ai_flags: flags,
        human_review: moderationStatus === 'flagged'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // If content is rejected, update the source content status
    if (moderationStatus === 'rejected') {
      if (content_type === 'listing') {
        await supabaseClient
          .from('dog_listings')
          .update({ status: 'inactive' })
          .eq('id', content_id);
      }
      // Add other content type handling as needed
    }

    console.log(`Moderation completed for ${content_type} ${content_id}: ${moderationStatus}`);

    return new Response(JSON.stringify({
      success: true,
      moderation_status: moderationStatus,
      ai_flags: flags,
      confidence: confidence,
      flagged: result.flagged,
      moderation_id: moderationRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-moderation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
