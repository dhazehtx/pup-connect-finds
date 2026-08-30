// RETIRED / DISABLED — legacy escrow edge function.
//
// The PAWS breeder/dog-sale flow is now the authoritative Deals-based protected
// payment system (server/routes/deals.ts, mounted at /api/deals): a platform-held
// PaymentIntent, then an admin/window-gated Stripe Connect Transfer to the
// seller's verified connected account, with server-computed commission. This
// legacy escrow function had money-safety/authorization defects (client-controlled
// amount, no real seller payout rail, a fake-success release stub, and weak
// dispute/refund authorization) and is DISABLED so it can never compete with or
// bypass the authoritative system.
//
// OWNER ACTION: redeploy (or delete) this function in Supabase for the disablement
// to take effect in production. Do NOT represent PAWS as a regulated escrow service.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({
      error: "This escrow endpoint has been retired. Use the PAWS protected-payment system (/api/deals).",
      code: "ESCROW_ENDPOINT_RETIRED",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 410 },
  );
});
