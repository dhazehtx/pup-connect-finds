import express from 'express';
import Stripe from 'stripe';
import { db } from '@/db';
import { 
  platformCommissions, 
  providerSubscriptions, 
  boostedListings, 
  monetizationOrders,
  profiles,
  products
} from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const router = express.Router();

// Create payment intent for product boosting (Featured Product - $5.99)
router.post('/boost-product', async (req, res) => {
  try {
    const { productId, boostType = 'featured_product' } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const amount = boostType === 'featured_product' ? 599 : 499; // $5.99 or $4.99 in cents
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 30 days boost

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId,
        productId,
        boostType,
        expiresAt: expiresAt.toISOString(),
      },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100,
    });
  } catch (error: any) {
    console.error('Boost product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent for service boosting ($4.99)
router.post('/boost-service', async (req, res) => {
  try {
    const { serviceId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const amount = 499; // $4.99 in cents
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 30 days boost

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId,
        serviceId,
        boostType: 'boosted_service',
        expiresAt: expiresAt.toISOString(),
      },
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100,
    });
  } catch (error: any) {
    console.error('Boost service error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Provider subscription endpoint ($9.99/month)
router.post('/provider-subscription', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user already has active subscription
    const existingSubscription = await db
      .select()
      .from(providerSubscriptions)
      .where(eq(providerSubscriptions.userId, userId))
      .limit(1);

    if (existingSubscription.length > 0 && existingSubscription[0].status === 'active') {
      return res.json({ 
        message: 'Already subscribed',
        subscription: existingSubscription[0]
      });
    }

    // Get user profile for customer creation
    const user = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let customerId = existingSubscription[0]?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user[0].email || '',
        name: user[0].full_name || user[0].username || '',
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Create Stripe subscription (you'll need to create a price in Stripe dashboard)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: 'price_provider_subscription', // Replace with actual Stripe price ID
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to database
    await db.insert(providerSubscriptions).values({
      userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      plan: 'premium',
      status: 'active',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Provider subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process commission when booking is completed
router.post('/process-commission', async (req, res) => {
  try {
    const { bookingId, amount, providerId } = req.body;
    
    if (!bookingId || !amount || !providerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const commissionRate = 10.00; // 10% platform commission
    const commissionAmount = (parseFloat(amount) * commissionRate / 100);

    // Create commission record
    await db.insert(platformCommissions).values({
      bookingId,
      amount: commissionAmount.toString(),
      providerId,
      commissionRate: commissionRate.toString(),
      status: 'pending',
    });

    res.json({ 
      success: true,
      commissionAmount,
      commissionRate,
    });
  } catch (error: any) {
    console.error('Process commission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's commissions
router.get('/commissions', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const commissions = await db
      .select()
      .from(platformCommissions)
      .where(eq(platformCommissions.providerId, userId))
      .orderBy(desc(platformCommissions.createdAt));

    res.json(commissions);
  } catch (error: any) {
    console.error('Get commissions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's boosted listings
router.get('/boosted-listings', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const boosted = await db
      .select()
      .from(boostedListings)
      .where(eq(boostedListings.userId, userId))
      .orderBy(desc(boostedListings.createdAt));

    res.json(boosted);
  } catch (error: any) {
    console.error('Get boosted listings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook to handle payment confirmations
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    // You'll need to set STRIPE_WEBHOOK_SECRET in environment
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, productId, serviceId, boostType, expiresAt } = paymentIntent.metadata;

        if (boostType && userId) {
          // Create boosted listing record
          await db.insert(boostedListings).values({
            userId,
            productId: productId || null,
            serviceId: serviceId || null,
            amount: (paymentIntent.amount / 100).toString(),
            stripePaymentIntentId: paymentIntent.id,
            boostType,
            expiresAt: new Date(expiresAt),
            status: 'active',
          });

          // Update product featured status if applicable
          if (productId && boostType === 'featured_product') {
            await db
              .update(products)
              .set({ is_featured: true })
              .where(eq(products.id, productId));
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db
          .update(providerSubscriptions)
          .set({
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(providerSubscriptions.stripeSubscriptionId, subscription.id));
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;