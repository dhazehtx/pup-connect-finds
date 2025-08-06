import { storage } from '../server/storage';
import { v4 as uuidv4 } from 'uuid';

const testProducts = [
  {
    name: 'Premium Dog Food - Large Breed',
    description: 'High-quality nutrition for large breed dogs. Made with real chicken and natural ingredients.',
    unit_price: '49.99',
    stripe_price_id: 'price_1QgHSBGsB8nMHO0uKHexNJBF', // Use your actual Stripe price ID
    inventory_qty: 50,
    is_subscription: false,
    is_active: true,
    category: 'food',
    image_url: 'https://via.placeholder.com/300x300?text=Premium+Dog+Food'
  },
  {
    name: 'Interactive Dog Toy Bundle',
    description: 'Keep your dog entertained for hours with this collection of interactive toys.',
    unit_price: '29.99',
    stripe_price_id: 'price_1QgHSBGsB8nMHO0uKHexNJBF', // Use your actual Stripe price ID
    inventory_qty: 25,
    is_subscription: false,
    is_active: true,
    category: 'toys',
    image_url: 'https://via.placeholder.com/300x300?text=Dog+Toy+Bundle'
  },
  {
    name: 'Monthly Grooming Subscription',
    description: 'Professional grooming services delivered monthly to keep your pup looking great.',
    unit_price: '79.99',
    stripe_price_id: 'price_1QgHSBGsB8nMHO0uKHexNJBF', // Use your actual Stripe price ID
    inventory_qty: 100,
    is_subscription: true,
    is_active: true,
    category: 'services',
    image_url: 'https://via.placeholder.com/300x300?text=Grooming+Service'
  },
  {
    name: 'Organic Training Treats',
    description: 'All-natural, organic treats perfect for training sessions. Made with real beef.',
    unit_price: '19.99',
    stripe_price_id: 'price_1QgHSBGsB8nMHO0uKHexNJBF', // Use your actual Stripe price ID
    inventory_qty: 75,
    is_subscription: false,
    is_active: true,
    category: 'treats',
    image_url: 'https://via.placeholder.com/300x300?text=Training+Treats'
  },
  {
    name: 'Luxury Dog Bed - Memory Foam',
    description: 'Give your dog the ultimate comfort with this memory foam orthopedic bed.',
    unit_price: '129.99',
    stripe_price_id: 'price_1QgHSBGsB8nMHO0uKHexNJBF', // Use your actual Stripe price ID
    inventory_qty: 15,
    is_subscription: false,
    is_active: true,
    category: 'furniture',
    image_url: 'https://via.placeholder.com/300x300?text=Luxury+Dog+Bed'
  }
];

async function createTestProducts() {
  console.log('🌱 Creating test products...');

  try {
    for (const productData of testProducts) {
      // Generate a proper UUID for the product
      const productId = uuidv4();
      const product = await storage.createProduct({
        ...productData,
        id: productId
      });
      console.log(`✅ Created product: ${product.name} - $${product.unit_price}`);
    }

    console.log('🎉 All test products created successfully!');
    
    // Display summary
    const products = await storage.getProducts();
    console.log(`\n📊 Total products in database: ${products.length}`);
    
  } catch (error) {
    console.error('💥 Error creating test products:', error);
    process.exit(1);
  }
}

// Run the creator
createTestProducts()
  .then(() => {
    console.log('🏁 Test product creation finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test product creation failed:', error);
    process.exit(1);
  });

export { createTestProducts };