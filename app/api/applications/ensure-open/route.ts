// app/api/applications/ensure-open/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SR_KEY       = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: NextRequest) {
  const sb = createClient(SUPABASE_URL, SR_KEY);
  
  try {
    const { userId, providerId } = await req.json();
    console.log('[ENSURE OPEN APP] Request:', { userId, providerId });
    
    if (!userId) return fail("Missing userId", 400);
    if (!providerId) return fail("Missing providerId", 400);

    // 1) Find existing draft/in_progress
    const { data: existing, error: findErr } = await sb
      .from("provider_applications")
      .select("id")
      .eq("user_id", userId)
      .eq("provider_id", providerId)
      .in("status", ["draft", "in_progress"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) {
      console.error('[ENSURE OPEN APP] Find error:', findErr);
      return fail(`DB error (find application): ${findErr.message}`, 500);
    }
    
    if (existing?.id) {
      console.log('[ENSURE OPEN APP] Found existing:', existing.id);
      return NextResponse.json({ success: true, applicationId: existing.id });
    }

    // 2) Create draft application
    console.log('[ENSURE OPEN APP] Creating new application...');
    const { data: created, error: insErr } = await sb
      .from("provider_applications")
      .insert({ 
        user_id: userId, 
        provider_id: providerId, 
        status: "draft" 
      })
      .select("id")
      .single();

    if (insErr) {
      console.error('[ENSURE OPEN APP] Insert error:', insErr);
      return fail(`DB error (create application): ${insErr.message}`, 500);
    }

    console.log('[ENSURE OPEN APP] Created new:', created.id);
    return NextResponse.json({ success: true, applicationId: created.id });
    
  } catch (e: any) {
    console.error("[ensure-open] ERROR", e);
    return fail(e?.message || "Internal error", 500);
  }
}

// Temporary GET endpoint for testing
export async function GET() {
  return NextResponse.json({ ok: true, message: "Route is working!" });
}