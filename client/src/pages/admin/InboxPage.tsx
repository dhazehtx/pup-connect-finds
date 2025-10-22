import { useEffect, useState } from 'react';

export default function InboxPage({ getAccessToken }: { getAccessToken: () => string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getAccessToken();
        const resp = await fetch('/api/admin/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { items } = await resp.json();
        setItems(items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [getAccessToken]);

  if (loading) return <div>Loading admin inbox…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Inbox</h1>
      {items.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div key={n.id} className="border p-3 rounded-lg" data-testid={`notification-${n.id}`}>
              <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
              <div className="font-semibold">{n.type}</div>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(n.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
