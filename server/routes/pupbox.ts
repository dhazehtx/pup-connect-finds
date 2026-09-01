import { Router } from "express";
import { storage } from "../storage";
import { parsePupboxCatalogFromEnv } from "../lib/pupboxCatalog";
import { dbProductIdForPupboxVariant } from "../lib/storeProductId";

const router = Router();

/**
 * GET /api/pupbox/plans — public catalog for Pup Box tab (Stripe IDs come from env; ids are deterministic DB PKs).
 */
router.get("/plans", async (_req, res) => {
  try {
    const entries = parsePupboxCatalogFromEnv();
    if (entries.length === 0) {
      return res.json({
        configured: false,
        message:
          "Set PUPBOX_CATALOG_JSON in the server environment and run npm run store:sync-catalog (includes Pup Box upsert when env is set).",
        plans: [],
      });
    }

    const plans = await Promise.all(
      entries.map(async (e) => {
        // Variant-scoped id: monthly and one-time under the same Stripe Product
        // must resolve to DIFFERENT purchasable rows (the cart buys this id).
        const dbId = dbProductIdForPupboxVariant(e.stripeProductId, e.stripePriceId);
        const product = await storage.getProduct(dbId);
        return {
          key: e.key,
          id: dbId,
          stripeProductId: e.stripeProductId,
          stripePriceId: e.stripePriceId,
          amount: e.amount,
          currency: e.currency ?? "usd",
          recurring: e.recurring,
          name: e.name,
          /** Present after DB upsert sync */
          inDatabase: !!product,
          image_url: product?.image_url ?? null,
        };
      }),
    );

    res.json({ configured: true, plans });
  } catch (error) {
    console.error("[pupbox/plans]", error);
    res.status(500).json({ error: "Failed to load Pup Box plans" });
  }
});

export default router;
