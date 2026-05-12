import { debugApiLog, debugApiWarn } from '../../lib/debugApi';
import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth } from "../../middleware/auth";
import { ensureVerifiedBadge } from "../../lib/badges";
import { db } from "../../db";
import { providerDocuments } from "../../../shared/schema";
import { eq, sql } from "drizzle-orm";

const r = Router();
r.use(requireAuth);

r.post("/signed-url", async (req, res) => {
  const userId = req.user!.id;
  const { fileName, mime } = req.body || {};
  if (!fileName || !mime) return res.status(400).json({ error: "Missing fileName/mime" });

  if (!supabase) {
    return res.status(503).json({ error: "Storage is not configured" });
  }

  const key = `${userId}/${Date.now()}-${fileName}`;
  const { data, error } = await supabase.storage.from("provider-docs").createSignedUploadUrl(key);
  if (error) return res.status(500).json({ error: error.message });
  debugApiLog('[PROOF:PROVIDER_DOCS] signed-url created', JSON.stringify({ userId, key, ts: Date.now() }));
  res.json({ key, uploadUrl: data.signedUrl });
});

r.post("/record", async (req, res) => {
  const userId = req.user!.id;
  const { docType, key, fileName, mime } = req.body || {};
  if (!docType || !key) return res.status(400).json({ error: "Missing docType/key" });

  try {
    const [doc] = await db.insert(providerDocuments).values({
      user_id: userId,
      doc_type: docType,
      file_path: key,
      file_name: fileName,
      mime_type: mime,
    }).returning();
    debugApiLog('[PROOF:PROVIDER_DOCS] record inserted via Drizzle', JSON.stringify({ userId, docId: doc.id, ts: Date.now() }));
    res.json({ ok: true, doc });
  } catch (error: any) {
    debugApiLog('[PROOF:PROVIDER_DOCS:ERR]', JSON.stringify({ userId, code: 'INSERT_FAILED', error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: error?.message || 'Failed to record document' });
  }
});

r.post("/policy-ack", async (req, res) => {
  const userId = req.user!.id;
  const { acknowledged } = req.body || {};

  try {
    await db.execute(
      sql`UPDATE service_providers SET policy_acknowledged = ${!!acknowledged} WHERE user_id = ${userId}`
    );
    await ensureVerifiedBadge(userId);
    debugApiLog('[PROOF:PROVIDER_DOCS] policy-ack updated via Drizzle', JSON.stringify({ userId, acknowledged: !!acknowledged, ts: Date.now() }));
    res.json({ ok: true });
  } catch (error: any) {
    debugApiLog('[PROOF:PROVIDER_DOCS:ERR] policy-ack', JSON.stringify({ userId, error: error?.message, ts: Date.now() }));
    res.status(500).json({ error: error?.message || 'Failed to update policy acknowledgment' });
  }
});

export default r;
