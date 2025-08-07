import { db } from '../server/db.ts';
import { 
  profiles, 
  products
} from '../shared/schema.ts';

const testAccounts = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001', // testbuyer
    email: 'testbuyer@mypup.com',
    username: 'testbuyer',
    full_name: 'Test Buyer',
    user_type: 'buyer',
    is_admin: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002', // testprovider
    email: 'testprovider@mypup.com',
    username: 'testprovider',
    full_name: 'Test Provider',
    user_type: 'provider',
    is_admin: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003', // admin
    email: 'admin@mypup.com',
    username: 'admin',
    full_name: 'Test Admin',
    user_type: 'admin',
    is_admin: true,
  },
];

const testProducts = [
  {
    id: 'prod_interactive_dog_toy',
    name: 'Interactive Dog Toy',
    description: 'Premium interactive puzzle toy for dogs - keeps them engaged for hours!',
    unit_price: '29.99',
    currency: 'usd',
    image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400',
    inventory_qty: 50,
    is_featured: false,
    category: 'toys',
    tags: ['interactive', 'puzzle', 'entertainment'],
  },
  {
    id: 'prod_premium_dog_treats',
    name: 'Premium Training Treats',
    description: 'All-natural, grain-free training treats that dogs love!',
    unit_price: '19.99',
    currency: 'usd',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    inventory_qty: 100,
    is_featured: true,
    category: 'treats',
    tags: ['training', 'natural', 'grain-free'],
  },
  {
    id: 'prod_puppy_starter_bundle',
    name: 'Puppy Starter Bundle',
    description: 'Everything you need for your new puppy - toys, treats, and essentials!',
    unit_price: '79.99',
    currency: 'usd',
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    inventory_qty: 25,
    is_featured: false,
    category: 'bundles',
    tags: ['puppy', 'starter', 'bundle', 'essentials'],
  },
];

// Basic test data for Phase 4 monetization

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding...');

    // Insert test accounts
    console.log('Creating test accounts...');
    for (const account of testAccounts) {
      try {
        await db.insert(profiles).values(account).onConflictDoNothing();
        console.log(`✅ Created account: ${account.email}`);
      } catch (error) {
        console.log(`Account ${account.email} already exists, skipping...`);
      }
    }

    // Insert test products
    console.log('Creating test products...');
    for (const product of testProducts) {
      try {
        await db.insert(products).values(product).onConflictDoNothing();
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.log(`Product ${product.name} already exists, skipping...`);
      }
    }

    console.log('✅ Basic test data seeded for monetization testing');

    console.log('🎉 Test data seeding completed successfully!');
    console.log('\n📧 Test Accounts Created:');
    testAccounts.forEach(account => {
      console.log(`   - ${account.email} (${account.user_type})`);
    });

    console.log('\n🛍️ Test Products:');
    testProducts.forEach(product => {
      console.log(`   - ${product.name} - $${product.unit_price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();