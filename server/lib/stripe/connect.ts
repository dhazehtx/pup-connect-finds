import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-08-27.basil',
});

export interface CreateAccountParams {
  type: 'express' | 'standard' | 'custom';
  country: string;
  email?: string;
  business_type?: 'individual' | 'company';
}

export interface CreateAccountLinkParams {
  account: string;
  refresh_url: string;
  return_url: string;
  type: 'account_onboarding' | 'account_update';
}

export async function createStripeConnectAccount(params: CreateAccountParams): Promise<Stripe.Account> {
  try {
    // If using mock key, return mock response
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_mock')) {
      return {
        id: `acct_mock_${Date.now()}`,
        object: 'account',
        type: params.type,
        country: params.country,
        email: params.email,
        business_type: params.business_type,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      } as Stripe.Account;
    }

    const account = await stripe.accounts.create({
      type: params.type,
      country: params.country,
      email: params.email,
      business_type: params.business_type === 'company' ? 'company' : 'individual',
    });

    return account;
  } catch (error) {
    console.error('Stripe account creation error:', error);
    throw new Error(`Failed to create Stripe account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createStripeAccountLink(params: CreateAccountLinkParams): Promise<Stripe.AccountLink> {
  try {
    // If using mock key, return mock response
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_mock')) {
      return {
        object: 'account_link',
        created: Math.floor(Date.now() / 1000),
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        url: `https://connect.stripe.com/setup/e/${params.account}?redirect=${encodeURIComponent(params.return_url)}`,
      } as Stripe.AccountLink;
    }

    const accountLink = await stripe.accountLinks.create({
      account: params.account,
      refresh_url: params.refresh_url,
      return_url: params.return_url,
      type: params.type,
    });

    return accountLink;
  } catch (error) {
    console.error('Stripe account link creation error:', error);
    throw new Error(`Failed to create account link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function retrieveStripeAccount(accountId: string): Promise<Stripe.Account> {
  try {
    // If using mock key, return mock response
    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_mock')) {
      return {
        id: accountId,
        object: 'account',
        type: 'express',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      } as Stripe.Account;
    }

    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error('Stripe account retrieval error:', error);
    throw new Error(`Failed to retrieve Stripe account: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}