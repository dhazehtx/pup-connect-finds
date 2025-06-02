
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { imageUrl, listingId, analysisType = 'breed_detection' } = await req.json();

    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log(`Starting ${analysisType} analysis for image:`, imageUrl);

    // OpenAI Vision API call for breed detection and health assessment
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: analysisType === 'breed_detection' 
              ? 'You are a professional dog breed identification expert. Analyze the image and provide breed identification with confidence scores. Return JSON format: {"breeds": [{"name": "breed_name", "confidence": 0.95, "characteristics": ["trait1", "trait2"]}], "mix_probability": 0.3, "age_estimate": "8-12 weeks", "size_category": "medium"}'
              : 'You are a veterinary expert analyzing puppy health from photos. Look for visible health indicators and return JSON: {"health_score": 0.85, "observations": ["clear eyes", "good posture"], "concerns": [], "recommendations": ["regular vet checkups"], "visible_issues": "none"}'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisType === 'breed_detection' 
                  ? 'Please identify the dog breed(s) in this image with confidence scores and characteristics.'
                  : 'Please assess the visible health indicators of this puppy.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisResult = openAIData.choices[0].message.content;

    let parsedResults;
    try {
      parsedResults = JSON.parse(analysisResult);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedResults = { raw_analysis: analysisResult };
    }

    // Calculate confidence score
    const confidence = analysisType === 'breed_detection' 
      ? (parsedResults.breeds?.[0]?.confidence || 0.5)
      : (parsedResults.health_score || 0.5);

    // Store results in database
    const { data: analysisRecord, error: dbError } = await supabaseClient
      .from('image_analysis')
      .insert({
        listing_id: listingId,
        image_url: imageUrl,
        analysis_type: analysisType,
        results: parsedResults,
        confidence: confidence,
        provider: 'openai'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Analysis completed successfully:', analysisRecord.id);

    return new Response(JSON.stringify({
      success: true,
      analysis: parsedResults,
      confidence: confidence,
      analysis_id: analysisRecord.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-image-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
