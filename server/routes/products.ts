import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/products - Get all products with filtering
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const activeOnly = req.query.active !== "false";
    const subscriptionOnly = req.query.subscription === "true";

    const products = await storage.getProducts({
      isActive: activeOnly,
      isSubscription: subscriptionOnly ? true : undefined
    });

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      data: paginatedProducts,
      count: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit)
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id - Get specific product
router.get("/:id", async (req, res) => {
  try {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products - Create new product (admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// POST /api/products/sync-stripe - Sync products from Stripe
router.post("/sync-stripe", authMiddleware, async (req, res) => {
  try {
    const { syncStripeProducts } = await import("../utils/stripeSync");
    const syncedProducts = await syncStripeProducts();
    res.json({ 
      message: `Successfully synced ${syncedProducts.length} products from Stripe`,
      products: syncedProducts 
    });
  } catch (error) {
    console.error("Error syncing Stripe products:", error);
    res.status(500).json({ error: "Failed to sync Stripe products" });
  }
});

// POST /api/products/:id/checkout - Create Stripe checkout session
router.post("/:id/checkout", authMiddleware, async (req, res) => {
  try {
    const { createStripeCheckoutSession } = await import("../utils/stripeSync");
    const { quantity = 1 } = req.body;
    const userId = req.user?.id;
    
    const session = await createStripeCheckoutSession(req.params.id, quantity, userId);
    res.json({ checkout_url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;