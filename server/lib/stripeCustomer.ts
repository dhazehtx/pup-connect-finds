import { Pool } from "@neondatabase/serverless";
import { debugApiLog } from "./debugApi";
import { getStripe } from "./stripeLazy";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getOrCreateStripeCustomer(userId: string, email?: string): Promise<string> {
  const stripe = getStripe();

  const { rows } = await pool.query<{ stripe_customer_id: string }>(
    "SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1",
    [userId],
  );
  if (rows[0]) return rows[0].stripe_customer_id;

  const customer = await stripe.customers.create({
    metadata: { user_id: userId },
    ...(email ? { email } : {}),
  });

  await pool.query(
    "INSERT INTO stripe_customers (user_id, stripe_customer_id) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
    [userId, customer.id],
  );
  debugApiLog(`[PROOF:STRIPE:CUSTOMER] user=${userId} stripe=${customer.id}`);
  return customer.id;
}
