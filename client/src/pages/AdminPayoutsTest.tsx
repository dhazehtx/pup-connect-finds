import { useState } from 'react';

export default function AdminPayoutsTest() {
  const [bookingId, setBookingId] = useState('');
  const [log, setLog] = useState<string[]>([]);

  async function call(path: string, body?: any) {
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      setLog((l) => [`${new Date().toLocaleTimeString()}: ${path} → ${res.status} ${res.ok ? 'OK' : 'ERR'} ${JSON.stringify(data)}`, ...l]);
    } catch (error: any) {
      setLog((l) => [`${new Date().toLocaleTimeString()}: ${path} → ERROR ${error.message}`, ...l]);
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Payouts Test Panel</h1>

      <div className="space-y-2 p-4 border rounded">
        <label className="block text-sm font-medium">Booking ID</label>
        <input
          className="w-full border rounded p-2"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          placeholder="uuid of the booking"
          data-testid="input-booking-id"
        />
        <button
          onClick={() => call('/api/bookings/complete', { bookingId })}
          className="px-4 py-2 rounded bg-black text-white"
          data-testid="button-mark-completed"
        >
          Mark Completed
        </button>
      </div>

      <div className="space-y-2 p-4 border rounded">
        <p className="text-sm">Release all eligible payouts (pending_release & eligible_at ≤ now)</p>
        <button
          onClick={() => call('/api/payouts/release')}
          className="px-4 py-2 rounded bg-black text-white"
          data-testid="button-release-payouts"
        >
          Release Payouts Now
        </button>
      </div>

      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Log</h2>
        <div className="max-h-96 overflow-y-auto">
          <ul className="text-xs space-y-1">
            {log.map((l, i) => (
              <li key={i} data-testid={`log-entry-${i}`}>
                <code className="block break-all">{l}</code>
              </li>
            ))}
          </ul>
        </div>
        {log.length > 0 && (
          <button
            onClick={() => setLog([])}
            className="mt-2 px-2 py-1 text-xs bg-gray-200 rounded"
            data-testid="button-clear-log"
          >
            Clear Log
          </button>
        )}
      </div>
    </div>
  );
}