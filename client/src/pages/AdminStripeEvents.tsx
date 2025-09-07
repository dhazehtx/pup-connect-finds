import { useEffect, useState } from 'react';

interface StripeEvent {
  event_id: string;
  type: string;
  created_at: string;
  payload: any;
}

export default function AdminStripeEventsPage() {
  const [events, setEvents] = useState<StripeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stripe-events')
      .then(r => r.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Stripe events:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Stripe Events</h1>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="admin-stripe-events">
      <h1 className="text-xl font-bold mb-4">Stripe Events Audit Log</h1>
      <p className="text-sm text-gray-600 mb-4">
        Recent webhook events received from Stripe (last 25)
      </p>
      
      {events.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded border" data-testid="no-events">
          <p>No Stripe events received yet.</p>
          <p className="text-sm text-gray-600 mt-2">
            Webhook events will appear here once Stripe starts sending them.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map(event => (
            <li 
              key={event.event_id} 
              className="p-3 bg-white border rounded shadow-sm"
              data-testid={`stripe-event-${event.event_id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <code className="text-blue-600 font-mono text-sm bg-blue-50 px-2 py-1 rounded">
                    {event.type}
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {event.event_id}
                  </p>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}