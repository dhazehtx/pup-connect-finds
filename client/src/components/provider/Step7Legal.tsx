import { useState } from 'react';

export default function Step7Legal({
  accessToken,
  onComplete,
}: { accessToken: string; onComplete: () => void }) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleAccept = async () => {
    try {
      setBusy(true); setErr(null);
      const resp = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ doc: 'service_provider_terms', version: 'v1', accepted: true }),
      });
      if (!resp.ok) throw new Error(`Consent failed: ${resp.status}`);
      onComplete();
    } catch (e: any) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Legal Agreements</h2>
      <p className="text-sm text-gray-500">
        Please review and accept the{' '}
        <a className="text-blue-600 underline" href="/legal/tos" target="_blank">Terms of Service</a>{' '}
        and{' '}
        <a className="text-blue-600 underline" href="/legal/service-provider-agreement" target="_blank">Service Provider Agreement</a>.
      </p>

      <label className="flex items-start gap-2">
        <input type="checkbox" checked={checked} onChange={(e)=>setChecked(e.target.checked)} />
        <span className="text-sm">
          I agree to the Terms of Service and Service Provider Agreement. I understand My Pup is a neutral marketplace and
          is not responsible for off-platform interactions or user conduct.
        </span>
      </label>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      <button
        disabled={!checked || busy}
        onClick={handleAccept}
        className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
        data-testid="button-accept-legal"
      >
        {busy ? 'Saving…' : 'Accept & Continue'}
      </button>
    </div>
  );
}
