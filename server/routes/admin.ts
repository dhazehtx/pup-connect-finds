import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Admin middleware to check admin status
const adminMiddleware = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Apply auth and admin middleware to all routes
// Apply auth middleware to all routes, but not admin middleware for navigation logging
router.use(authMiddleware);

// Navigation logging endpoint - doesn't require admin privileges, just authentication
router.post('/log-navigation', async (req, res) => {
  try {
    const { event_type, payload } = req.body;
    
    // Log navigation event silently - don't throw errors
    console.log(`[ADMIN LOG] ${event_type}:`, payload);
    
    // You can add database logging here if needed
    // await storage.logAdminAction({ 
    //   user_id: req.user?.id,
    //   event_type,
    //   payload
    // });
    
    res.status(204).end();
  } catch (error) {
    console.error('Navigation logging failed:', error);
    // Return success anyway to prevent UI issues
    res.status(204).end();
  }
});

// Apply admin middleware to protected routes
const protectedRoutes = Router();
protectedRoutes.use(adminMiddleware);

// Get all products (admin view)
protectedRoutes.get('/products', async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().nullable(),
  unit_price: z.string().min(1, "Price is required"),
  inventory_qty: z.number().min(0, "Inventory must be non-negative"),
  category: z.string().optional().nullable(),
  stripe_price_id: z.string().optional().nullable(),
  stripe_product_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_subscription: z.boolean().default(false),
  is_active: z.boolean().default(true),
  currency: z.string().default("usd"),
  is_discounted: z.boolean().default(false),
  original_price: z.string().optional().nullable(),
  sales_count: z.number().default(0),
  rating: z.string().optional().nullable(),
  reviews_count: z.number().default(0),
  metadata: z.any().optional()
});

protectedRoutes.post('/products', async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    
    // Generate a unique ID for the product
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const productData = {
      id: productId,
      name: validatedData.name,
      unit_price: validatedData.unit_price,
      inventory_qty: validatedData.inventory_qty,
      description: validatedData.description,
      category: validatedData.category,
      stripe_price_id: validatedData.stripe_price_id,
      stripe_product_id: validatedData.stripe_product_id,
      image_url: validatedData.image_url,
      is_subscription: validatedData.is_subscription,
      is_active: validatedData.is_active,
      currency: validatedData.currency,
      is_discounted: validatedData.is_discounted,
      original_price: validatedData.original_price,
      sales_count: validatedData.sales_count,
      rating: validatedData.rating,
      reviews_count: validatedData.reviews_count,
      metadata: validatedData.metadata
    };
    
    const product = await storage.createProduct(productData);
    
    res.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
const updateProductSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  unit_price: z.string().optional(),
  inventory_qty: z.number().optional(),
  category: z.string().optional().nullable(),
  stripe_price_id: z.string().optional().nullable(),
  stripe_product_id: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_subscription: z.boolean().optional(),
  is_active: z.boolean().optional(),
  currency: z.string().optional(),
  is_discounted: z.boolean().optional(),
  original_price: z.string().optional().nullable(),
  sales_count: z.number().optional(),
  rating: z.string().optional().nullable(),
  reviews_count: z.number().optional(),
  metadata: z.any().optional()
});

protectedRoutes.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);
    
    const product = await storage.updateProduct(id, validatedData);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
protectedRoutes.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of deleting, we'll deactivate the product
    const product = await storage.updateProduct(id, { is_active: false });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating product:', error);
    res.status(500).json({ error: 'Failed to deactivate product' });
  }
});

// Mount protected routes
router.use('/', protectedRoutes);

export default router;