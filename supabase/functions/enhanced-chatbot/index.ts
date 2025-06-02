
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

    const { message, conversation_history = [], user_context = {} } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing chatbot request:', message);

    // Build context about the user and marketplace
    let systemContext = `You are a helpful AI assistant for a puppy marketplace called PuppySpace. You help users with:
- Finding the right puppy breed for their lifestyle
- Understanding puppy care and training
- Navigating the marketplace features
- Connecting with reputable breeders
- General puppy-related questions

You should be friendly, knowledgeable about dogs and puppies, and always prioritize the welfare of the animals. If users ask about specific listings, encourage them to use the search and filter features.`;

    // Add user context if available
    if (user_context.preferences) {
      systemContext += `\n\nUser preferences: ${JSON.stringify(user_context.preferences)}`;
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemContext },
      ...conversation_history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // OpenAI chat completion
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    const response = openAIData.choices[0].message.content;

    console.log('Chatbot response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      response: response,
      conversation_id: user_context.conversation_id || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-chatbot:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
