import { Router } from "express";
import { serverSupabase } from "../../lib/supabaseServer";
import { getStripe } from "../../lib/stripeLazy";

const router = Router();

const ORIGIN = process.env.REPLIT_DOMAIN || "http://localhost:3000";

router.post("/", async (req, res) => {
  try {
    const { userId, providerId, applicationId, frontImagePath, backImagePath } = req.body;

    console.log('[STRIPE VERIFICATION] Starting verification:', { 
      userId, 
      providerId, 
      applicationId,
      hasImages: !!frontImagePath && !!backImagePath 
    });

    if (!userId || !providerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing userId or providerId" 
      });
    }

    // Create Stripe Identity Verification Session
    const session = await getStripe().identity.verificationSessions.create({
      type: "document",
      metadata: { userId, providerId },
      return_url: `https://${ORIGIN}/services/onboarding/check?session={VERIFICATION_SESSION_ID}`,
    });

    console.log('[STRIPE VERIFICATION] Created session:', session.id);

    // Store in database with "started" status
    const supabase = serverSupabase();
    const { data, error } = await supabase
      .from("provider_applications")
      .upsert({
        id: applicationId || undefined,
        user_id: userId,
        provider_id: providerId,
        step3_id_status: "started",
        id_front_url: frontImagePath || null,
        id_back_url: backImagePath || null,
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error('[STRIPE VERIFICATION] Database error:', error);
      throw error;
    }

    console.log('[STRIPE VERIFICATION] Success - application updated:', data.id);

    return res.json({
      success: true,
      applicationId: data.id,
      sessionId: session.id,
      session_id: session.id,
      url: `https://verify.stripe.com/session/${session.id}`,
      stepStatus: "started",
      message: "ID verification session started"
    });

  } catch (e: any) {
    console.error("[STRIPE VERIFICATION] Error:", e);
    return res.status(500).json({ 
      success: false, 
      message: e?.message || "Internal error" 
    });
  }
});

export { router as startVerificationRouter };