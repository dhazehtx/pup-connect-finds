import { Router } from "express";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();

interface OrderItem {
  product_id: string;
  qty: number;
}

// POST /api/orders - Create manual order (admin functionality)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { user_id, items }: { user_id: string; items: OrderItem[] } = req.body;

    if (!user_id || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "user_id and items array are required" });
    }

    // Fetch product details and calculate total
    const productIds = items.map(item => item.product_id);
    const productPromises = productIds.map(id => storage.getProduct(id));
    const products = await Promise.all(productPromises);

    // Check if all products exist
    const missingProducts = products.some(p => !p);
    if (missingProducts) {
      return res.status(400).json({ error: "One or more products not found" });
    }

    // Calculate line items and total
    const lineItems = items.map(item => {
      const product = products.find(p => p?.id === item.product_id)!;
      const subtotal = parseFloat(product.unit_price) * item.qty;
      return {
        ...item,
        unit_price: product.unit_price,
        subtotal
      };
    });

    const total = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order
    const order = await storage.createOrder({
      user_id,
      amount_total: total.toString(),
      status: "paid"
    });

    // Create order items
    const orderItemsPromises = lineItems.map(item =>
      storage.createOrderItem({
        order_id: order.id,
        product_id: item.product_id,
        qty: item.qty,
        unit_price: item.unit_price
      })
    );

    const orderItems = await Promise.all(orderItemsPromises);

    res.status(201).json({ order, items: orderItems });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders - Get user's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const orders = await storage.getUserOrders(user_id);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:id - Get specific order
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await storage.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns the order (or is admin)
    const user_id = req.user?.id;
    if (order.user_id !== user_id) {
      // TODO: Add admin check here
      return res.status(403).json({ error: "Access denied" });
    }

    const orderItems = await storage.getOrderItems(order.id);
    res.json({ ...order, items: orderItems });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;