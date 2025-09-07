import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface IdempotencyRecord {
  id: string;
  processed_at: Date;
  created_at: Date;
}

export async function withDbIdempotency(eventId: string, handler: () => Promise<void>): Promise<void> {
  const client = pool;

  try {
    // Check if this event has already been processed
    const existingQuery = 'SELECT id FROM webhook_idempotency WHERE event_id = $1';
    const existing = await client.query(existingQuery, [eventId]);

    if (existing.rows.length > 0) {
      console.log(`[IDEMPOTENCY] Event ${eventId} already processed, skipping`);
      return;
    }

    // Insert idempotency record before processing
    const insertQuery = `
      INSERT INTO webhook_idempotency (event_id, created_at) 
      VALUES ($1, NOW()) 
      ON CONFLICT (event_id) DO NOTHING
    `;
    await client.query(insertQuery, [eventId]);

    // Process the webhook
    await handler();

    // Mark as processed
    const updateQuery = `
      UPDATE webhook_idempotency 
      SET processed_at = NOW() 
      WHERE event_id = $1
    `;
    await client.query(updateQuery, [eventId]);

    console.log(`[IDEMPOTENCY] Successfully processed event ${eventId}`);

  } catch (error) {
    console.error(`[IDEMPOTENCY] Error processing event ${eventId}:`, error);
    
    // Mark as failed but don't delete - let it be retried later
    const errorQuery = `
      UPDATE webhook_idempotency 
      SET error_message = $1, error_at = NOW() 
      WHERE event_id = $2
    `;
    await client.query(errorQuery, [String(error), eventId]);
    
    throw error;
  }
}