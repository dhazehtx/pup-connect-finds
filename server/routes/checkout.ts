import { Router } from "express";
import { createCheckoutSession } from "../stripe/createCheckoutSession";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/checkout - Create Stripe checkout session
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    const url = await createCheckoutSession(user_id, product_id, quantity);
    res.json({ url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;