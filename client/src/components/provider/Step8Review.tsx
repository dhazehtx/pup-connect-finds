import { useState } from 'react';

export default function Step8Review({
  accessToken, providerId, onSubmitted,
}: { accessToken: string; providerId: string; onSubmitted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setBusy(true); setErr(null);
      const resp = await fetch('/api/provider/submit', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${accessToken}` },
        body: JSON.stringify({ provider_id: providerId }),
      });
      const body = await resp.json().catch(()=>null);
      if (!resp.ok) throw new Error(body?.error || `Submit failed: ${resp.status}`);
      onSubmitted();
    } catch (e: any) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review & Submit</h2>
      <ul className="text-sm list-disc pl-6">
        <li>Business name, services, pricing, availability</li>
        <li>Government ID / verification uploaded</li>
        <li>Payout account connected</li>
      </ul>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button
        disabled={busy}
        onClick={handleSubmit}
        className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-50"
        data-testid="button-submit-review"
      >
        {busy ? 'Submitting…' : 'Submit for Review'}
      </button>
      <p className="text-sm text-gray-500">
        After submission your status becomes <strong>pending review</strong>. We'll notify you when approved.
      </p>
    </div>
  );
}
