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
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all products (admin view)
router.get('/products', async (req, res) => {
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
  description: z.string().optional(),
  unit_price: z.string().min(1, "Price is required"),
  inventory_qty: z.number().min(0, "Inventory must be non-negative"),
  category: z.string().optional(),
  stripe_price_id: z.string().optional(),
  is_subscription: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

router.post('/products', async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    
    // Generate a unique ID for the product
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const product = await storage.createProduct({
      ...validatedData,
      id: productId
    });
    
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
  description: z.string().optional(),
  unit_price: z.string().optional(),
  inventory_qty: z.number().optional(),
  category: z.string().optional(),
  stripe_price_id: z.string().optional(),
  is_subscription: z.boolean().optional(),
  is_active: z.boolean().optional()
});

router.put('/products/:id', async (req, res) => {
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
router.delete('/products/:id', async (req, res) => {
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

export default router;