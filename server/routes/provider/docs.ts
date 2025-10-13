import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth } from "../../middleware/auth";

const r = Router();
r.use(requireAuth);

// POST /api/provider/docs/signed-url {fileName, mime}
r.post("/signed-url", async (req, res) => {
  const userId = req.user!.id;
  const { fileName, mime } = req.body || {};
  if (!fileName || !mime) return res.status(400).json({ error: "Missing fileName/mime" });

  const key = `${userId}/${Date.now()}-${fileName}`;
  const { data, error } = await supabase.storage.from("provider-docs").createSignedUploadUrl(key);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ key, uploadUrl: data.signedUrl });
});

// POST /api/provider/docs/record {docType, key, fileName, mime}
r.post("/record", async (req, res) => {
  const userId = req.user!.id;
  const { docType, key, fileName, mime } = req.body || {};
  if (!docType || !key) return res.status(400).json({ error: "Missing docType/key" });

  const { data, error } = await supabase.from("provider_documents").insert({
    user_id: userId, doc_type: docType, file_path: key, file_name: fileName, mime_type: mime
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, doc: data });
});

// POST /api/provider/policy-ack
r.post("/policy-ack", async (req, res) => {
  const userId = req.user!.id;
  const { acknowledged } = req.body || {};
  const { error } = await supabase
    .from("service_providers")
    .update({ policy_acknowledged: !!acknowledged })
    .eq("user_id", userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default r;
