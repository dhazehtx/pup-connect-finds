# Pup Box Stripe Configuration Guide

## Overview
The Pup Box subscription feature on `/marketplace` now supports both monthly subscriptions and one-time purchases. Users can click "Select Plan" on any Pup Box size (Small/Medium/Large) to choose between these options.

## What's Been Implemented

### File Modified
**`client/src/components/subscriptions/PupBoxSubscription.tsx`**

### Features Added
1. **Modal Choice Dialog** - When "Select Plan" is clicked, a modal appears with two options:
   - **Subscribe Monthly** - Best value, cancel anytime
   - **One-Time Box** - Try before subscribing

2. **Checkout Integration** - Uses the same `/api/checkout` endpoint as the Store tab
   - Calls `POST /api/checkout` with `product_id` and `quantity`
   - Redirects to Stripe Checkout on success
   - Shows error toast on failure

3. **Function Name** - `handlePurchaseChoice(type: 'subscription' | 'oneTime')`
   - This function handles both subscription and one-time purchase checkouts

## Required Setup: Configure Stripe Product IDs

### Step 1: Find Your Stripe Product IDs
1. Go to your Stripe Dashboard → Products
2. Find these 6 products (or create them if they don't exist):
   - Small Pup Box - Subscription
   - Small Pup Box - One-Time Purchase
   - Medium Pup Box - Subscription  
   - Medium Pup Box - One-Time Purchase
   - Large Pup Box - Subscription
   - Large Pup Box - One-Time Purchase

3. For each product, copy the Product ID (starts with `prod_`)

### Step 2: Update the Configuration
Edit `client/src/components/subscriptions/PupBoxSubscription.tsx` (lines 14-29):

```typescript
const PUP_BOX_PRODUCTS = {
  small: {
    subscription: 'prod_YOUR_SMALL_SUBSCRIPTION_ID', // Replace with actual ID
    oneTime: 'prod_YOUR_SMALL_ONETIME_ID',          // Replace with actual ID
  },
  medium: {
    subscription: 'prod_YOUR_MEDIUM_SUBSCRIPTION_ID',
    oneTime: 'prod_YOUR_MEDIUM_ONETIME_ID',
  },
  large: {
    subscription: 'prod_YOUR_LARGE_SUBSCRIPTION_ID',
    oneTime: 'prod_YOUR_LARGE_ONETIME_ID',
  },
};
```

### Step 3: Ensure Products Are in Database
The checkout endpoint (`/api/checkout`) requires products to exist in your database with their Stripe price IDs.

**Option A: Sync from Stripe (Recommended)**
Run the Stripe sync utility to pull products from your Stripe account:
```bash
# This will sync all Stripe products to your database
npm run stripe:sync
```

**Option B: Manual Database Insert**
If the sync doesn't work, manually add the products to your database:
```sql
INSERT INTO products (id, name, stripe_product_id, stripe_price_id, unit_price, is_subscription, is_active, inventory_qty)
VALUES 
  ('prod_SMALL_SUB', 'Small Pup Box Subscription', 'prod_SMALL_SUB', 'price_SMALL_SUB', '19.99', true, true, 999),
  ('prod_SMALL_ONE', 'Small Pup Box (One-Time)', 'prod_SMALL_ONE', 'price_SMALL_ONE', '23.99', false, true, 999),
  -- ... repeat for medium and large
;
```

## Testing the Feature

1. **Start the app**: Navigate to `/marketplace` → Click "Pup Box" tab
2. **Click "Select Plan"** on any size (while logged in)
3. **Choose an option**:
   - Click "Subscribe Monthly" → Should redirect to Stripe Checkout with subscription
   - Click "One-Time Box" → Should redirect to Stripe Checkout with one-time payment

4. **Test without login**: Click "Select Plan" while logged out
   - Should show "Authentication required" toast

## How It Works

```
User clicks "Select Plan" 
  → handleSelectPlan(size) called
  → Modal opens with subscription/one-time choice
  → User clicks choice
  → handlePurchaseChoice(type) called
  → Looks up product ID from PUP_BOX_PRODUCTS config
  → Calls POST /api/checkout with product_id
  → Server creates Stripe checkout session
  → User redirected to Stripe Checkout page
```

## Current Pricing Display
- Small: $19.99 / month (subscription), $23.99 (one-time)
- Medium: $29.99 / month (subscription), $35.99 (one-time) 
- Large: $39.99 / month (subscription), $47.99 (one-time)

One-time prices are calculated as 120% of subscription price in the UI, but the actual Stripe price is determined by your Stripe product configuration.

## Next Steps
1. Replace the placeholder product IDs in `PupBoxSubscription.tsx`
2. Ensure all 6 products exist in your database
3. Test the complete checkout flow
4. Verify success/cancel URLs work correctly
