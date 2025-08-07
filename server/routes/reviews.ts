import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Validation schemas
const createReviewSchema = z.object({
  product_id: z.string().min(1, "Product ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  review: z.string().optional(),
});

// Get all reviews for a product
router.get('/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    const reviews = await storage.getProductReviews(product_id);
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a new review (authenticated users only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validatedData = createReviewSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already reviewed this product
    const existingReviews = await storage.getProductReviews(validatedData.product_id);
    const userAlreadyReviewed = existingReviews.some(review => review.user_id === userId);

    if (userAlreadyReviewed) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Check if product exists
    const product = await storage.getProduct(validatedData.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create the review
    const review = await storage.createProductReview({
      ...validatedData,
      user_id: userId,
      is_verified_purchase: false, // TODO: Check if user actually purchased
    });

    // Update product rating average
    await storage.updateProductRating(validatedData.product_id);

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Admin: Hide/unhide a review
router.patch('/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_hidden } = req.body;

    if (!req.user?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const review = await storage.updateProductReview(id, { is_hidden: Boolean(is_hidden) });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating review visibility:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

export default router;