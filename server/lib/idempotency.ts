import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface IdempotencyRecord {
  id: string;
  processed_at: Date;
  created_at: Date;
}

export async function withDbIdempotency(eventId: string, handler: () => Promise<void>): Promise<void> {
  try {
    // Try to insert idempotency record - if it already exists, we've processed this
    const insertQuery = `
      INSERT INTO stripe_idempotency (event_id) 
      VALUES ($1)
    `;
    
    await pool.query(insertQuery, [eventId]);
    console.log(`[IDEMPOTENCY] Processing new event ${eventId}`);

  } catch (error: any) {
    // If duplicate key error (already processed), skip
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      console.log(`[IDEMPOTENCY] Event ${eventId} already processed, skipping`);
      return;
    }
    throw error;
  }

  try {
    // Process the webhook
    await handler();
    console.log(`[IDEMPOTENCY] Successfully processed event ${eventId}`);

  } catch (error) {
    console.error(`[IDEMPOTENCY] Error processing event ${eventId}:`, error);
    
    // Best effort cleanup so a retry can re-process
    try {
      await pool.query('DELETE FROM stripe_idempotency WHERE event_id = $1', [eventId]);
    } catch (cleanupError) {
      console.error(`[IDEMPOTENCY] Failed to cleanup event ${eventId}:`, cleanupError);
    }
    
    throw error;
  }
}