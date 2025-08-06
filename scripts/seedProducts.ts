import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedProducts() {
  console.log('🌱 Starting product seeding...');

  try {
    // Fetch all Stripe products
    const stripeProducts = await stripe.products.list({ limit: 100 });
    console.log(`📦 Found ${stripeProducts.data.length} Stripe products`);

    for (const product of stripeProducts.data) {
      // Get the default price for this product
      const prices = await stripe.prices.list({ 
        product: product.id,
        limit: 1 
      });
      
      if (prices.data.length === 0) {
        console.log(`⚠️ No price found for product ${product.name}, skipping`);
        continue;
      }

      const price = prices.data[0];
      const unitPrice = ((price.unit_amount || 0) / 100).toFixed(2);

      // Prepare product data for Supabase
      const productData = {
        id: product.id, // Use Stripe product ID
        name: product.name,
        description: product.description,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
        unit_price: unitPrice,
        currency: price.currency,
        inventory_qty: 100, // Default inventory
        is_active: product.active,
        is_subscription: price.type === 'recurring',
        image_url: product.images[0] || null,
        category: product.metadata?.category || 'general',
        sales_count: 0,
        metadata: product.metadata
      };

      // Upsert product into Supabase
      const { error } = await supabase
        .from('products')
        .upsert(productData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Error upserting product ${product.name}:`, error);
      } else {
        console.log(`✅ Upserted product: ${product.name} (${unitPrice} ${price.currency})`);
      }
    }

    console.log('🎉 Product seeding completed successfully!');
    
    // Display summary
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, unit_price, is_active')
      .order('created_at', { ascending: false });

    if (!fetchError) {
      console.log('\n📊 Product Summary:');
      console.log(`Total products: ${products.length}`);
      console.log(`Active products: ${products.filter(p => p.is_active).length}`);
      console.log(`Inactive products: ${products.filter(p => !p.is_active).length}`);
      
      console.log('\n📋 Recent products:');
      products.slice(0, 5).forEach(p => {
        console.log(`  • ${p.name} - $${p.unit_price} (${p.is_active ? 'Active' : 'Inactive'})`);
      });
    }

  } catch (error) {
    console.error('💥 Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeder
seedProducts()
  .then(() => {
    console.log('🏁 Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });

export { seedProducts };