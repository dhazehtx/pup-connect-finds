import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendarScheduling } from '@/hooks/useCalendarScheduling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';

export default function MyViewingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events, loading, deleteEvent, refreshEvents } = useCalendarScheduling();

  const myViewings = (events || []).filter(
    (e) => e.user_id === user?.id && e.status !== 'cancelled'
  );

  const handleCancel = async (eventId: string) => {
    if (!window.confirm('Cancel this viewing?')) return;
    await deleteEvent(eventId);
    refreshEvents();
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-gray-500">Sign in to see your scheduled viewings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <CalendarCheck className="h-8 w-8 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">My viewings</h1>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        Viewings you requested from listing detail. You can cancel any pending viewing.
      </p>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading viewings...</div>
      ) : myViewings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No scheduled viewings.</p>
            <p className="text-gray-400 text-sm mt-1">
              Go to a listing and use “Schedule visit” to request a viewing.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/explore')}
            >
              Explore listings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myViewings.map((event) => {
            const start = new Date(event.start_time);
            const end = new Date(event.end_time);
            return (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    <span>{event.title}</span>
                    <span
                      className={`text-xs font-normal px-2 py-0.5 rounded ${
                        event.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {format(start, 'EEEE, MMM d, yyyy')} · {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {event.listing_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/listing/${event.listing_id}`)}
                      >
                        View listing
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                    {event.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancel(event.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel viewing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
