import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Get user's order history
router.get('/user/:user_id', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    const requestingUserId = req.user?.id;

    // Users can only view their own orders (unless admin)
    if (user_id !== requestingUserId && !req.user?.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await storage.getUserOrdersWithItems(user_id);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update shipping information
router.patch('/:id/shipping', authMiddleware, async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const shippingSchema = z.object({
      shipping_address: z.string().optional(),
      tracking_number: z.string().optional(),
      carrier: z.string().optional(),
      is_shipped: z.boolean().optional(),
    });

    const validatedData = shippingSchema.parse(req.body);

    // If marking as shipped, set shipped_at timestamp
    if (validatedData.is_shipped === true) {
      (validatedData as any).shipped_at = new Date();
    }

    const order = await storage.updateOrder(id, validatedData as any);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order shipping:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update order shipping' });
  }
});

// Get order details with items
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await storage.getOrderWithItems(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Users can only view their own orders (unless admin)
    if (order.user_id !== req.user?.id && !req.user?.is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;