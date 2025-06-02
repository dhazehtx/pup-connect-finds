
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

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'submit_verification':
        return await handleVerificationSubmission(supabaseClient, user.id, payload);
      case 'update_verification_status':
        return await handleVerificationUpdate(supabaseClient, payload);
      case 'get_verification_requests':
        return await getVerificationRequests(supabaseClient, payload);
      case 'upload_document':
        return await handleDocumentUpload(supabaseClient, user.id, payload);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in user-verification:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleVerificationSubmission(supabase: any, userId: string, data: any) {
  console.log('Submitting verification request for user:', userId);

  const { data: verificationRequest, error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: userId,
      verification_type: data.verification_data.verification_type,
      business_license: data.verification_data.business_license,
      experience_details: data.verification_data.experience_details,
      id_document: data.verification_data.id_document,
      address_proof: data.verification_data.address_proof,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Create background check entry if needed
  if (data.verification_data.verification_type === 'breeder') {
    await supabase
      .from('background_checks')
      .insert({
        user_id: userId,
        provider: 'internal',
        check_type: 'identity',
        status: 'pending'
      });
  }

  return new Response(JSON.stringify({
    success: true,
    verification_request: verificationRequest
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleVerificationUpdate(supabase: any, data: any) {
  const { request_id, status, rejection_reason, reviewer_id } = data;

  const updateData: any = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewer_id
  };

  if (rejection_reason) {
    updateData.rejection_reason = rejection_reason;
  }

  const { data: updated, error } = await supabase
    .from('verification_requests')
    .update(updateData)
    .eq('id', request_id)
    .select('*, profiles!verification_requests_user_id_fkey(email, full_name)')
    .single();

  if (error) throw error;

  // If approved, update user profile
  if (status === 'approved') {
    await supabase
      .from('profiles')
      .update({ verified: true })
      .eq('id', updated.user_id);

    // Send notification
    await supabase
      .from('notifications')
      .insert({
        user_id: updated.user_id,
        type: 'verification_approved',
        title: 'Verification Approved',
        message: 'Your account has been successfully verified!'
      });
  }

  return new Response(JSON.stringify({
    success: true,
    verification_request: updated
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getVerificationRequests(supabase: any, data: any) {
  const { status, limit = 50, offset = 0 } = data;

  let query = supabase
    .from('verification_requests')
    .select(`
      *,
      profiles!verification_requests_user_id_fkey(
        full_name,
        email,
        user_type
      )
    `)
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: requests, error } = await query;
  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    verification_requests: requests
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDocumentUpload(supabase: any, userId: string, data: any) {
  const { document_type, file_url, file_name, file_size, mime_type } = data;

  const { data: document, error } = await supabase
    .from('verification_documents')
    .insert({
      user_id: userId,
      document_type,
      file_url,
      file_name,
      file_size,
      mime_type,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    document
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
