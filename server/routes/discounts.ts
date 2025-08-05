import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

const createDiscountSchema = z.object({
  code: z.string().min(1).max(50),
  pct_off: z.number().min(1).max(100),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  is_active: z.boolean().default(true)
});

// Get all discounts (admin only)
router.get("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await storage.getUserProfile(req.user.id);
    if (!profile?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const discounts = await storage.getAllDiscounts();
    res.json({ data: discounts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create discount (admin only)
router.post("/", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await storage.getUserProfile(req.user.id);
    if (!profile?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const discountData = createDiscountSchema.parse(req.body);
    const discount = await storage.createDiscount(discountData);
    res.json({ data: discount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Validate discount code
router.post("/validate", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Discount code required" });
    }

    const discount = await storage.validateDiscountCode(code);
    if (!discount) {
      return res.status(404).json({ error: "Invalid or expired discount code" });
    }

    res.json({ data: discount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;