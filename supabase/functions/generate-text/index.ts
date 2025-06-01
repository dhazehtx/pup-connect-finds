
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = 'general', maxTokens = 500 } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Define system messages based on the type of content being generated
    const systemMessages = {
      general: 'You are a helpful assistant that generates content based on user prompts.',
      listing: 'You are an expert pet listing writer. Create engaging, accurate descriptions for dog listings that highlight the dog\'s best qualities while being honest and informative.',
      breeder: 'You are a professional breeder assistant. Help create informative content about breeding practices, dog care, and breeder expertise.',
      message: 'You are a friendly pet platform assistant. Help users communicate effectively and professionally about their pets.'
    };

    const systemMessage = systemMessages[type as keyof typeof systemMessages] || systemMessages.general;

    console.log(`Generating ${type} content for prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Successfully generated text');

    return new Response(JSON.stringify({ 
      generatedText,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-text function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
