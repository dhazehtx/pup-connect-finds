import express from "express";
import Stripe from "stripe";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role, not anon
);

app.use(bodyParser.json());

// Route: Create a connected account + onboarding link
app.post("/create-connect-account", async (req, res) => {
  try {
    const { userId } = req.body;

    // 1. Create a Stripe Express account
    const account = await stripe.accounts.create({
      type: "express",
    });

    // 2. Save account.id into Supabase (profiles table)
    await supabase
      .from("profiles")
      .update({ stripe_account_id: account.id })
      .eq("id", userId);

    // 3. Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://yourapp.com/reauth",
      return_url: "https://yourapp.com/dashboard",
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe connect error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
