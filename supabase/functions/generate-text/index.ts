
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const { prompt, type = 'general', maxTokens = 500, imageUrl, userId, searchQuery, chatContext } = await req.json();

    if (!prompt && !imageUrl && !searchQuery) {
      throw new Error('Prompt, image, or search query is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client for user data
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    let userProfile = null;

    // Get user profile for personalization if userId provided
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, user_type, location, bio')
        .eq('id', userId)
        .single();
      userProfile = profile;
    }

    // Define enhanced system messages based on type
    const systemMessages = {
      general: 'You are a helpful assistant for MY PUP, a pet marketplace platform. Provide engaging, accurate, and helpful responses.',
      listing: `You are an expert pet listing writer for MY PUP. Create engaging, accurate descriptions that highlight pets' best qualities while being honest and informative. ${userProfile ? `The user is ${userProfile.full_name}, a ${userProfile.user_type} located in ${userProfile.location}.` : ''}`,
      breeder: `You are a professional breeder assistant for MY PUP. Help create informative content about breeding practices, dog care, and breeder expertise. ${userProfile ? `The user is ${userProfile.full_name}, a ${userProfile.user_type} with experience in ${userProfile.bio || 'pet breeding'}.` : ''}`,
      message: `You are a friendly pet platform assistant for MY PUP. Help users communicate effectively and professionally about their pets. ${userProfile ? `The user is ${userProfile.full_name}.` : ''}`,
      image_analysis: 'You are an expert pet photo analyst. Analyze pet photos and provide detailed, helpful insights about the pet\'s appearance, breed characteristics, health indicators, and photography tips.',
      search: 'You are an AI search assistant for MY PUP. Help users find the perfect pets by understanding their preferences and providing relevant search suggestions and insights.',
      support: 'You are a customer support chatbot for MY PUP. Provide helpful, friendly, and professional assistance with platform questions, account issues, and general inquiries about pet adoption and breeding.'
    };

    const systemMessage = systemMessages[type as keyof typeof systemMessages] || systemMessages.general;

    // Handle different types of AI requests
    let messages = [{ role: 'system', content: systemMessage }];

    if (type === 'image_analysis' && imageUrl) {
      // Image analysis request
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Please analyze this pet photo and provide insights about the pet\'s breed, appearance, and any notable characteristics.' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else if (type === 'search' && searchQuery) {
      // AI-powered search request
      const { data: listings } = await supabase
        .from('dog_listings')
        .select('dog_name, breed, age, price, location, description')
        .ilike('breed', `%${searchQuery}%`)
        .limit(10);

      const searchContext = listings ? 
        `Available pets matching "${searchQuery}": ${JSON.stringify(listings.slice(0, 5))}` : 
        'No specific matches found in current listings.';

      messages.push({
        role: 'user',
        content: `User search query: "${searchQuery}". ${prompt || 'Help me find the perfect pet.'}\n\nContext: ${searchContext}`
      });
    } else if (type === 'support' && chatContext) {
      // Customer support with chat history
      if (chatContext.length > 0) {
        chatContext.forEach((msg: any) => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }
      messages.push({ role: 'user', content: prompt });
    } else {
      // Standard text generation
      messages.push({ role: 'user', content: prompt });
    }

    console.log(`Generating ${type} content for user: ${userProfile?.full_name || 'anonymous'}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: type === 'image_analysis' ? 'gpt-4o' : 'gpt-4o-mini',
        messages: messages,
        max_tokens: maxTokens,
        temperature: type === 'search' ? 0.3 : 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Successfully generated enhanced AI response');

    return new Response(JSON.stringify({ 
      generatedText,
      usage: data.usage,
      userProfile: userProfile ? { name: userProfile.full_name, type: userProfile.user_type } : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhanced generate-text function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
