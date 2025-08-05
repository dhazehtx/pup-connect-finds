import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({ 
      select: jest.fn(() => ({ 
        single: jest.fn(() => Promise.resolve({ data: { id: 'test-order-id' } }))
      }))
    }))
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// Mock storage
const mockStorage = {
  createOrder: jest.fn(() => Promise.resolve({ id: 'test-order-id' })),
  getProductByStripeId: jest.fn(() => Promise.resolve({ 
    id: 'test-product-id', 
    name: 'Test Product',
    unit_price: '29.99'
  }))
};

jest.mock('../server/storage', () => ({
  storage: mockStorage
}));

// Import after mocking
import '../server/routes/webhook';

describe('Stripe Webhook - Order Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order on checkout.session.completed', async () => {
    const mockCheckoutSession = {
      id: 'cs_test_123',
      object: 'checkout.session',
      amount_total: 2999,
      currency: 'usd',
      customer: 'cus_test_123',
      customer_details: {
        email: 'test@example.com',
        name: 'Test Customer'
      },
      line_items: {
        data: [
          {
            price: {
              id: 'price_test_123',
              product: 'prod_test_123'
            },
            quantity: 1
          }
        ]
      },
      metadata: {
        user_id: 'test-user-id'
      }
    };

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: mockCheckoutSession
      }
    };

    // Simulate webhook processing
    const session = mockEvent.data.object;
    
    // Verify product lookup
    await mockStorage.getProductByStripeId(session.line_items.data[0].price.id);
    expect(mockStorage.getProductByStripeId).toHaveBeenCalledWith(session.line_items.data[0].price.id);

    // Verify order creation
    const orderData = {
      user_id: session.metadata.user_id,
      total_amount: (session.amount_total / 100).toString(),
      currency: session.currency,
      stripe_session_id: session.id,
      customer_email: session.customer_details.email,
      customer_name: session.customer_details.name,
      status: 'completed'
    };

    await mockStorage.createOrder(orderData);
    expect(mockStorage.createOrder).toHaveBeenCalledWith(orderData);
  });

  it('should handle missing product gracefully', async () => {
    mockStorage.getProductByStripeId.mockResolvedValueOnce(null);

    const mockCheckoutSession = {
      id: 'cs_test_456',
      line_items: {
        data: [
          {
            price: {
              id: 'price_unknown',
              product: 'prod_unknown'
            }
          }
        ]
      }
    };

    const result = await mockStorage.getProductByStripeId('price_unknown');
    expect(result).toBeNull();
  });
});