import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { AlertCircle, Plus, MapPin, Search, Heart, Map } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import InteractiveMap from '@/components/maps/InteractiveMap';

type SubTab = 'lost' | 'found';
type ViewMode = 'list' | 'map';

interface Alert {
  id: string;
  alert_type: string;
  status?: string | null;
  pet_name?: string | null;
  breed?: string | null;
  description?: string | null;
  last_seen_address?: string | null;
  contact_info?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
}

export default function LostAndFoundExploreSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<SubTab>('lost');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [createOpen, setCreateOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    alert_type: 'lost' as 'lost' | 'found',
    pet_name: '',
    breed: '',
    description: '',
    last_seen_address: '',
    contact_info: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const { data: lostData } = useQuery({
    queryKey: ['/api/lost-pet-alerts', 'lost'],
    queryFn: async (): Promise<{ alerts: Alert[] }> => {
      try {
        const res = await apiRequest('/api/lost-pet-alerts?status=active&alert_type=lost');
        return Array.isArray((res as any)?.alerts) ? { alerts: (res as any).alerts } : { alerts: [] };
      } catch {
        return { alerts: [] };
      }
    },
    retry: false,
  });
  const { data: foundData } = useQuery({
    queryKey: ['/api/lost-pet-alerts', 'found'],
    queryFn: async (): Promise<{ alerts: Alert[] }> => {
      try {
        const res = await apiRequest('/api/lost-pet-alerts?status=active&alert_type=found');
        return Array.isArray((res as any)?.alerts) ? { alerts: (res as any).alerts } : { alerts: [] };
      } catch {
        return { alerts: [] };
      }
    },
    retry: false,
  });
  const { data: myData } = useQuery({
    queryKey: ['/api/lost-pet-alerts/my'],
    queryFn: async (): Promise<{ alerts: Alert[] }> => {
      try {
        const res = await apiRequest('/api/lost-pet-alerts/my');
        return Array.isArray((res as any)?.alerts) ? { alerts: (res as any).alerts } : { alerts: [] };
      } catch {
        return { alerts: [] };
      }
    },
    enabled: !!user,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiRequest('/api/lost-pet-alerts', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts'] });
      setCreateOpen(false);
      setForm({
        alert_type: 'lost',
        pet_name: '',
        breed: '',
        description: '',
        last_seen_address: '',
        contact_info: '',
        latitude: null,
        longitude: null,
      });
    },
  });

  const lostAlerts = lostData?.alerts ?? [];
  const foundAlerts = foundData?.alerts ?? [];
  const myAlerts = myData?.alerts ?? [];
  const alerts = subTab === 'lost' ? lostAlerts : foundAlerts;

  const mapMarkers = useMemo(() => {
    const list = alerts.filter((a: Alert) => a.latitude != null && a.longitude != null);
    return list.map((a: Alert) => ({
      id: a.id,
      lat: Number(a.latitude),
      lng: Number(a.longitude),
      title: `${a.alert_type === 'found' ? 'Found: ' : ''}${a.pet_name || 'Unknown'}${a.breed ? ` · ${a.breed}` : ''}`,
      description: a.description || a.last_seen_address || undefined,
      type: 'listing' as const,
    }));
  }, [alerts]);

  const openCreate = (type: 'lost' | 'found') => {
    setForm((f) => ({ ...f, alert_type: type }));
    setCreateOpen(true);
  };

  const handleUseMyLocation = () => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitForm = () => {
    const body: Record<string, unknown> = {
      alert_type: form.alert_type,
      pet_name: form.pet_name || undefined,
      breed: form.breed || undefined,
      description: form.description || undefined,
      last_seen_address: form.last_seen_address || undefined,
      contact_info: form.contact_info || undefined,
    };
    if (form.latitude != null && form.longitude != null) {
      body.latitude = form.latitude;
      body.longitude = form.longitude;
    }
    createMutation.mutate(body);
  };

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Lost &amp; Found
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Help reunite lost pets with their families. Report a lost pet or one you found.
              </p>
            </div>
          </div>
          {user && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => openCreate('lost')} className="gap-2">
                <Search className="w-4 h-4" />
                Report lost
              </Button>
              <Button onClick={() => openCreate('found')} className="gap-2 bg-amber-600 hover:bg-amber-700">
                <Heart className="w-4 h-4" />
                Post alert
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs: Lost Pets | Found Pets */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as SubTab)} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="lost">Lost Pets ({lostAlerts.length})</TabsTrigger>
            <TabsTrigger value="found">Found Pets ({foundAlerts.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="gap-1"
            >
              <Map className="w-4 h-4" />
              Map
            </Button>
          </div>
        </div>

        <TabsContent value="lost" className="mt-6">
          {viewMode === 'map' ? (
            <Card className="overflow-hidden">
              <div className="h-[400px] w-full relative">
                <InteractiveMap
                  markers={mapMarkers}
                  showUserLocation={true}
                  onMarkerClick={() => {}}
                />
                {mapMarkers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
                    <p className="text-sm text-muted-foreground text-center px-4">
                      No location pins yet. Post an alert with &quot;Use my location&quot; to see pins on the map.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <AlertList alerts={lostAlerts} type="lost" />
          )}
        </TabsContent>
        <TabsContent value="found" className="mt-6">
          {viewMode === 'map' ? (
            <Card className="overflow-hidden">
              <div className="h-[400px] w-full relative">
                <InteractiveMap
                  markers={mapMarkers}
                  showUserLocation={true}
                  onMarkerClick={() => {}}
                />
                {mapMarkers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
                    <p className="text-sm text-muted-foreground text-center px-4">
                      No location pins yet. Post an alert with location to see pins on the map.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <AlertList alerts={foundAlerts} type="found" />
          )}
        </TabsContent>
      </Tabs>

      {/* My alerts (when logged in) */}
      {user && myAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAlerts.map((a: Alert) => (
                <div
                  key={a.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card"
                >
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.pet_name || 'Pet'} className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">🐕</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {a.alert_type === 'found' ? 'Found: ' : ''}{a.pet_name || 'Unknown'} {a.breed && `· ${a.breed}`}
                    </p>
                    {a.description && <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>}
                    {a.last_seen_address && (
                      <p className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" /> {a.last_seen_address}
                      </p>
                    )}
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post Alert dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.alert_type === 'found' ? 'Report found pet' : 'Report lost pet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {form.alert_type === 'found' && (
              <p className="text-sm text-muted-foreground">
                Describe the pet you found and where, so the owner can get in touch.
              </p>
            )}
            <div>
              <Label>Pet name {form.alert_type === 'found' && '(if known)'}</Label>
              <Input
                value={form.pet_name}
                onChange={(e) => setForm((f) => ({ ...f, pet_name: e.target.value }))}
                placeholder="e.g. Max or Unknown"
              />
            </div>
            <div>
              <Label>Breed</Label>
              <Input
                value={form.breed}
                onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                placeholder="e.g. Golden Retriever"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Identifying features, collar, etc."
                rows={3}
              />
            </div>
            <div>
              <Label>{form.alert_type === 'found' ? 'Where found (address or area)' : 'Last seen (address or area)'}</Label>
              <Input
                value={form.last_seen_address}
                onChange={(e) => setForm((f) => ({ ...f, last_seen_address: e.target.value }))}
                placeholder="e.g. Main St & 5th Ave"
              />
            </div>
            <div>
              <Button type="button" variant="outline" size="sm" onClick={handleUseMyLocation} className="gap-2">
                <MapPin className="w-4 h-4" />
                Use my location (for map pin)
              </Button>
              {form.latitude != null && form.longitude != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Location saved: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </p>
              )}
            </div>
            <div>
              <Label>Contact info (phone or email)</Label>
              <Input
                value={form.contact_info}
                onChange={(e) => setForm((f) => ({ ...f, contact_info: e.target.value }))}
                placeholder="How someone can reach you"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={submitForm}
              disabled={createMutation.isPending || (!form.pet_name.trim() && !form.description.trim())}
            >
              {createMutation.isPending ? 'Posting…' : form.alert_type === 'found' ? 'Post found alert' : 'Post lost alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertList({ alerts, type }: { alerts: Alert[]; type: 'lost' | 'found' }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {type === 'lost'
              ? 'No lost pet alerts right now. Report a lost pet to help others look.'
              : 'No found pet reports yet. Found a dog? Post an alert so the owner can find them.'}
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alerts.map((a: Alert) => (
        <Card key={a.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="aspect-[4/3] bg-muted relative">
            {a.image_url ? (
              <img src={a.image_url} alt={a.pet_name || 'Pet'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🐕</div>
            )}
            <div className="absolute top-2 left-2">
              <span className="rounded-full bg-amber-500/90 text-white text-xs font-medium px-2 py-0.5">
                {a.alert_type === 'found' ? 'Found' : 'Lost'}
              </span>
            </div>
          </div>
          <CardContent className="p-4">
            <h4 className="font-semibold truncate">
              {a.alert_type === 'found' ? 'Found: ' : ''}{a.pet_name || 'Unknown'}{a.breed ? ` · ${a.breed}` : ''}
            </h4>
            {a.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{a.description}</p>}
            {a.last_seen_address && (
              <p className="text-xs flex items-center gap-1 mt-2 text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" /> {a.last_seen_address}
              </p>
            )}
            {a.contact_info && <p className="text-xs mt-1 truncate">Contact: {a.contact_info}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
