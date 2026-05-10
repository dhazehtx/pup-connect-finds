// @ts-nocheck
import Stripe from 'stripe';
import { storage } from '../storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export async function syncStripeProducts() {
  try {
    console.log('Starting Stripe products sync...');
    
    // Fetch all products from Stripe
    const stripeProducts = await stripe.products.list({
      active: true,
      limit: 100,
    });

    const syncedProducts = [];
    
    for (const product of stripeProducts.data) {
      // Get the default price for this product
      const price = await stripe.prices.retrieve(product.default_price as string);
      
      // Map Stripe product to our database format
      const productData = {
        id: product.id,
        name: product.name,
        description: product.description || null,
        unit_price: (price.unit_amount! / 100).toString(), // Convert from cents to dollars
        image_url: product.images?.[0] || null,
        is_subscription: price.type === 'recurring',
        is_active: product.active,
        inventory_qty: 100, // Default inventory
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        currency: price.currency,
        metadata: product.metadata
      };

      // Upsert product in our database
      const existingProduct = await storage.getProduct(product.id);
      
      if (existingProduct) {
        await storage.updateProduct(product.id, productData);
        console.log(`Updated product: ${product.name}`);
      } else {
        await storage.createProduct(productData);
        console.log(`Created product: ${product.name}`);
      }
      
      syncedProducts.push(productData);
    }

    console.log(`Successfully synced ${syncedProducts.length} products from Stripe`);
    return syncedProducts;
    
  } catch (error) {
    console.error('Error syncing Stripe products:', error);
    throw error;
  }
}

export async function createStripeCheckoutSession(productId: string, quantity: number = 1, userId?: string) {
  try {
    const product = await storage.getProduct(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: quantity,
        },
      ],
      mode: product.is_subscription ? 'subscription' : 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5000'}/marketplace`,
      customer_email: userId ? undefined : undefined, // Let Stripe collect email
      metadata: {
        product_id: productId,
        user_id: userId || '',
        quantity: quantity.toString(),
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}