import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest, isAbortError } from '@/lib/api';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import {
  AlertCircle,
  MapPin,
  Search,
  Heart,
  ArrowLeft,
  Phone,
  Bell,
  Map as MapIcon,
  Plus,
  ChevronDown,
  Gift,
  Sparkles,
  Upload,
  Loader2,
  Share2,
  Link2,
  MessageCircle,
  Facebook,
  Instagram,
  Eye,
  CheckCircle,
  ShieldCheck,
  ClipboardList,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AlertTypeFilter = 'all' | 'lost' | 'found';
type ViewMode = 'list' | 'map';
type SortOption = 'recent' | 'nearest' | 'viewed' | 'reward';

/** Safety notice for found dogs: proof of ownership required before return. */
const ProofOfOwnershipNotice = () => (
  <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
    <p className="text-sm font-medium text-amber-900 flex items-center gap-2">
      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
      Proof of ownership required before return
    </p>
    <p className="text-xs text-amber-800 mt-1">This helps prevent theft scams. Examples:</p>
    <ul className="text-xs text-amber-800 mt-0.5 list-disc list-inside space-y-0.5">
      <li>Vet records</li>
      <li>Photos with dog</li>
      <li>Microchip scan</li>
    </ul>
  </div>
);

const DISTANCE_OPTIONS = [1, 5, 10, 25, 50] as const;
const DATE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: 'week', label: 'Last week' },
  { value: 'all', label: 'All time' },
];
const SIZE_OPTIONS = ['Small', 'Medium', 'Large'];
const COLOR_OPTIONS = ['Black', 'Brown', 'White', 'Tan', 'Multi-color'];
const GENDER_OPTIONS = ['Male', 'Female', 'Unknown'];
const BREED_OPTIONS = ['French Bulldog', 'Golden Retriever', 'Mixed', 'Unknown'];

type LostFoundFormState = {
  alert_type: 'lost' | 'found';
  pet_name: string;
  breed: string;
  description: string;
  last_seen_address: string;
  city: string;
  contact_info: string;
  reward_offered: boolean;
  dog_size: string;
  color: string;
  gender: string;
  image_url: string;
  last_seen_at: string;
  collar_description: string;
  microchip_status: string;
  microchip_scan_result: string;
  temperament: string;
  latitude: number | null;
  longitude: number | null;
  is_vet_listing: boolean;
  dog_id: string;
};

function createEmptyLostFoundForm(): LostFoundFormState {
  return {
    alert_type: 'lost',
    pet_name: '',
    breed: '',
    description: '',
    last_seen_address: '',
    city: '',
    contact_info: '',
    reward_offered: false,
    dog_size: '',
    color: '',
    gender: '',
    image_url: '',
    last_seen_at: '',
    collar_description: '',
    microchip_status: '',
    microchip_scan_result: '',
    temperament: '',
    latitude: null,
    longitude: null,
    is_vet_listing: false,
    dog_id: '',
  };
}

function dateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function alertToForm(a: Record<string, unknown>): LostFoundFormState {
  return {
    alert_type: a.alert_type === 'found' ? 'found' : 'lost',
    pet_name: (a.pet_name as string) || '',
    breed: (a.breed as string) || '',
    description: (a.description as string) || '',
    last_seen_address: (a.last_seen_address as string) || '',
    city: (a.city as string) || '',
    contact_info: (a.contact_info as string) || '',
    reward_offered: !!a.reward_offered,
    dog_size: (a.dog_size as string) || '',
    color: (a.color as string) || '',
    gender: (a.gender as string) || '',
    image_url: (a.image_url as string) || '',
    last_seen_at: dateInputValue(a.last_seen_at as string | undefined),
    collar_description: (a.collar_description as string) || '',
    microchip_status: (a.microchip_status as string) || '',
    microchip_scan_result: (a.microchip_scan_result as string) || '',
    temperament: (a.temperament as string) || '',
    latitude: a.latitude != null ? Number(a.latitude) : null,
    longitude: a.longitude != null ? Number(a.longitude) : null,
    is_vet_listing: !!a.is_vet_listing,
    dog_id: (a.dog_id as string) || '',
  };
}

function buildLostFoundPayload(form: LostFoundFormState, vetVerification: { verification_status?: string; id?: string } | null | undefined) {
  const lastSeenIso = form.last_seen_at?.trim()
    ? new Date(`${form.last_seen_at}T12:00:00`).toISOString()
    : null;
  const vetApproved = vetVerification?.verification_status === 'approved';
  const payload: Record<string, unknown> = {
    alert_type: form.alert_type,
    pet_name: form.pet_name.trim() || null,
    breed: form.breed.trim() || null,
    description: form.description?.trim() || null,
    image_url: form.image_url.trim() || null,
    last_seen_address: form.last_seen_address.trim() || null,
    city: form.city?.trim() || null,
    contact_info: form.contact_info.trim() || null,
    reward_offered: !!form.reward_offered,
    dog_size: form.dog_size || null,
    color: form.color || null,
    gender: form.gender || null,
    collar_description: form.collar_description?.trim() || null,
    microchip_status: form.microchip_status || null,
    temperament: form.temperament?.trim() || null,
    last_seen_at: lastSeenIso,
    latitude: form.latitude ?? undefined,
    longitude: form.longitude ?? undefined,
  };
  if (form.alert_type === 'lost') {
    payload.dog_id = form.dog_id?.trim() || null;
  } else {
    payload.microchip_scan_result = form.microchip_scan_result?.trim() || null;
    payload.is_vet_listing = !!(form.is_vet_listing && vetApproved);
    payload.vet_verification_id =
      form.is_vet_listing && vetApproved && vetVerification?.id ? vetVerification.id : null;
  }
  return payload;
}

const DEFAULT_LF_TITLE = 'Lost & Found — My Pup';

function setLostFoundPageMeta(opts: { title: string; description: string; image?: string; pageUrl: string }) {
  if (typeof document === 'undefined') return;
  document.title = opts.title;
  const ensure = (sel: string, create: () => HTMLMetaElement) => {
    let el = document.querySelector(sel) as HTMLMetaElement | null;
    if (!el) {
      el = create();
      document.head.appendChild(el);
    }
    return el;
  };
  const setOg = (prop: string, content: string) => {
    const el = ensure(`meta[property="${prop}"]`, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', prop);
      return m;
    });
    el.setAttribute('content', content);
  };
  const setName = (name: string, content: string) => {
    const el = ensure(`meta[name="${name}"]`, () => {
      const m = document.createElement('meta');
      m.setAttribute('name', name);
      return m;
    });
    el.setAttribute('content', content);
  };
  setOg('og:title', opts.title);
  setOg('og:description', opts.description);
  setOg('og:url', opts.pageUrl);
  setOg('og:type', 'website');
  if (opts.image) {
    setOg('og:image', opts.image);
    setName('twitter:image', opts.image);
  }
  setName('description', opts.description);
  setName('twitter:card', 'summary_large_image');
}

export default function LostAndFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { upload: uploadListingImage, uploading: listingImageUploading, progress: listingUploadProgress } = useMediaUpload();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [detailAlert, setDetailAlert] = useState<any | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [alertTypeFilter, setAlertTypeFilter] = useState<AlertTypeFilter>('all');
  const [distanceMiles, setDistanceMiles] = useState(10);
  const [breedFilter, setBreedFilter] = useState<string>('');
  const [sizeFilter, setSizeFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('all');
  const [rewardOnly, setRewardOnly] = useState(false);
  const [foundAtVetsOnly, setFoundAtVetsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [aiMatchOpen, setAiMatchOpen] = useState(false);
  const [aiMatchPhoto, setAiMatchPhoto] = useState<string | null>(null);
  const [aiMatchFile, setAiMatchFile] = useState<File | null>(null);
  const [aiMatchResults, setAiMatchResults] = useState<
    Array<{
      kind?: 'alert' | 'listing';
      alert: any | null;
      listing: any | null;
      matchScore: number;
      distanceMiles: number | null;
    }>
  | null>(null);
  const [aiMatchRanking, setAiMatchRanking] = useState<'visual' | 'proximity' | 'empty' | null>(null);
  const [aiMatchError, setAiMatchError] = useState<string | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    alert_type: 'found' as 'lost' | 'found',
    breed: '',
    radius_miles: 10,
    email_digest_enabled: false,
  });
  const [shareCopied, setShareCopied] = useState(false);
  /** After successful new listing POST — show share sheet */
  const [postCreateShareOpen, setPostCreateShareOpen] = useState(false);
  const [postCreateShareAlert, setPostCreateShareAlert] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importData, setImportData] = useState<{ source_platform: string; suggested_fields: Record<string, string>; original_url: string } | null>(null);
  const [importForm, setImportForm] = useState<Record<string, string>>({});
  const [vetApplyOpen, setVetApplyOpen] = useState(false);
  const [vetApplyForm, setVetApplyForm] = useState({ business_name: '', license_number: '', location: '' });
  const [detailChipNumber, setDetailChipNumber] = useState('');
  const [myDogsAddOpen, setMyDogsAddOpen] = useState(false);
  const [myDogsAddForm, setMyDogsAddForm] = useState({ name: '', breed: '' });
  const [microchipDogId, setMicrochipDogId] = useState<string | null>(null);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [detailChipInput, setDetailChipInput] = useState('');

  const [form, setForm] = useState<LostFoundFormState>(() => createEmptyLostFoundForm());

  const goToGreeting = () => navigate('/greeting');

  /** Guests browse a default feed; filters are sign-in only. When they share location, we pass lat/lng like signed-in users. */
  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set('status', 'active');
    if (!user) {
      p.set('radius_miles', '25');
      p.set('sort', 'recent');
      if (userCoords) {
        p.set('lat', String(userCoords.lat));
        p.set('lng', String(userCoords.lng));
      }
      return p.toString();
    }
    if (alertTypeFilter !== 'all') p.set('alert_type', alertTypeFilter);
    p.set('radius_miles', String(distanceMiles));
    if (breedFilter) p.set('breed', breedFilter);
    if (sizeFilter) p.set('dog_size', sizeFilter);
    if (colorFilter) p.set('color', colorFilter);
    if (genderFilter) p.set('gender', genderFilter);
    if (dateFilter !== 'all') p.set('date', dateFilter);
    if (rewardOnly) p.set('reward_offered', 'true');
    if (foundAtVetsOnly) p.set('is_vet_listing', 'true');
    p.set('sort', sortBy);
    if (userCoords) {
      p.set('lat', String(userCoords.lat));
      p.set('lng', String(userCoords.lng));
    }
    return p.toString();
  }, [user, alertTypeFilter, distanceMiles, breedFilter, sizeFilter, colorFilter, genderFilter, dateFilter, rewardOnly, foundAtVetsOnly, sortBy, userCoords]);

  useEffect(() => {
    if (!user) setViewMode('map');
    else setViewMode('list');
  }, [user]);

  const displayViewMode: ViewMode = viewMode;

  const toggleMapList = () => {
    setViewMode((v) => (v === 'list' ? 'map' : 'list'));
  };

  const { data: feedData, isPending: feedLoading } = useQuery({
    queryKey: ['/api/lost-pet-alerts', queryParams],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/lost-pet-alerts?${queryParams}`) as { alerts: any[] };
      } catch {
        return { alerts: [] };
      }
    },
  });
  const { data: myData } = useQuery({
    queryKey: ['/api/lost-pet-alerts/my'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/lost-pet-alerts/my') as { alerts: any[] };
      } catch {
        return { alerts: [] };
      }
    },
    enabled: !!user,
    retry: false,
  });
  const { data: subsData, refetch: refetchSubs } = useQuery({
    queryKey: ['/api/lost-pet-alerts/subscriptions'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/lost-pet-alerts/subscriptions') as { subscriptions: any[] };
      } catch {
        return { subscriptions: [] };
      }
    },
    enabled: !!user,
    retry: false,
  });
  const { data: radarData } = useQuery({
    queryKey: ['/api/radar/city', userCoords?.lat, userCoords?.lng],
    queryFn: async () => {
      try {
        return await apiRequest(
          `/api/radar/city?lat=${userCoords!.lat}&lng=${userCoords!.lng}&radius_miles=10`
        ) as { count: number; alerts: any[] };
      } catch {
        return { count: 0, alerts: [] };
      }
    },
    enabled: !!userCoords,
    retry: false,
  });
  const { data: scoreboardData } = useQuery({
    queryKey: ['/api/recovery/scoreboard', 'month'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/recovery/scoreboard?period=month') as { scoreboard: Array<{ city: string | null; count: number }>; period: string };
      } catch {
        return { scoreboard: [], period: 'month' };
      }
    },
    retry: false,
  });
  const { data: scoreboardWeekData } = useQuery({
    queryKey: ['/api/recovery/scoreboard', 'week'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/recovery/scoreboard?period=week') as { scoreboard: Array<{ city: string | null; count: number }>; period: string };
      } catch {
        return { scoreboard: [], period: 'week' };
      }
    },
    retry: false,
  });
  const { data: recentReunionsData } = useQuery({
    queryKey: ['/api/recovery/recent'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/recovery/recent?limit=6') as { reunions: Array<{ id: string; pet_name: string | null; breed: string | null; city: string | null; image_url: string | null; reunited_at: string | null }> };
      } catch {
        return { reunions: [] };
      }
    },
    retry: false,
  });
  const { data: vetVerificationData } = useQuery({
    queryKey: ['/api/vet-verification'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/vet-verification') as { id: string; verification_status: string } | null;
      } catch {
        return null;
      }
    },
    enabled: !!user,
    retry: false,
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingAlert, setReportingAlert] = useState<any | null>(null);
  const [reportForm, setReportForm] = useState<{ report_type: 'saw_dog' | 'possible_match' | 'sighted_location'; location_text: string; message: string; source_platform?: string }>({
    report_type: 'saw_dog',
    location_text: '',
    message: '',
    source_platform: 'mypup',
  });
  const { data: reportsData, refetch: refetchReports } = useQuery({
    queryKey: ['/api/lost-pet-alerts', detailAlert?.id, 'reports'],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/lost-pet-alerts/${detailAlert!.id}/reports`) as { reports: any[] };
      } catch {
        return { reports: [] };
      }
    },
    enabled: !!detailAlert?.id,
    retry: false,
  });
  const { data: missionData, refetch: refetchMission } = useQuery({
    queryKey: ['/api/search-missions/alert', detailAlert?.id],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/search-missions/alert/${detailAlert!.id}`) as { mission: any; participants: any[] };
      } catch {
        return { mission: null, participants: [] };
      }
    },
    enabled: !!detailAlert?.id,
    retry: false,
  });
  const { data: dogsData } = useQuery({
    queryKey: ['/api/dogs'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/dogs') as { dogs: any[] };
      } catch {
        return { dogs: [] };
      }
    },
    enabled: !!user,
    retry: false,
  });

  const alerts = feedData?.alerts ?? [];
  const myAlerts = myData?.alerts ?? [];
  const subscriptions = subsData?.subscriptions ?? [];
  const communityReports = reportsData?.reports ?? [];

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest('/api/lost-pet-alerts', { method: 'POST', body }) as Promise<any>,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts/my'] });
      setCreateOpen(false);
      setEditingAlertId(null);
      setForm(createEmptyLostFoundForm());
      if (created?.id) {
        setPostCreateShareAlert(created);
        setPostCreateShareOpen(true);
        toast({
          title: created.alert_type === 'found' ? 'Found dog listing posted' : 'Lost dog listing posted',
          description: 'Share the link so more people can help.',
        });
      } else {
        toast({ title: 'Listing posted', description: 'Your alert is live.' });
      }
    },
    onError: () => {
      toast({ title: 'Could not post listing', description: 'Check required fields and try again.', variant: 'destructive' });
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiRequest(`/api/lost-pet-alerts/${id}`, { method: 'PATCH', body }) as Promise<Record<string, unknown>>,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts/my'] });
      setCreateOpen(false);
      setEditingAlertId(null);
      setForm(createEmptyLostFoundForm());
      if (detailAlert?.id && updated?.id === detailAlert.id) {
        setDetailAlert((prev: any) => (prev ? { ...prev, ...updated } : null));
      }
      toast({ title: 'Listing updated', description: 'Your changes are live.' });
    },
    onError: () => {
      toast({ title: 'Could not update listing', description: 'Try again in a moment.', variant: 'destructive' });
    },
  });

  const aiMatchMutation = useMutation({
    mutationFn: async (dataUrl: string) => {
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const body: any = { image: base64 };
      if (userCoords) {
        body.lat = userCoords.lat;
        body.lng = userCoords.lng;
      }
      return apiRequest('/api/lost-pet-alerts/ai-match', {
        method: 'POST',
        body,
      }) as Promise<{
        matches: Array<{
          kind?: 'alert' | 'listing';
          alert: any | null;
          listing: any | null;
          matchScore: number;
          distanceMiles: number | null;
        }>;
        matchRanking?: 'visual' | 'proximity' | 'empty';
      }>;
    },
    onSuccess: (data) => {
      setAiMatchError(null);
      const ranking = data.matchRanking ?? null;
      setAiMatchRanking(ranking === 'visual' || ranking === 'proximity' || ranking === 'empty' ? ranking : null);
      const raw = data.matches ?? [];
      setAiMatchResults(
        raw.map((m: any) => ({
          kind: (m.kind as 'alert' | 'listing' | undefined) ?? (m.listing ? 'listing' : 'alert'),
          alert: m.alert ?? null,
          listing: m.listing ?? null,
          matchScore: m.matchScore,
          distanceMiles: m.distanceMiles,
        })),
      );
    },
    onError: (err: any) => {
      setAiMatchResults(null);
      setAiMatchRanking(null);
      const status = typeof err?.status === 'number' ? err.status : null;
      let message = 'We could not finish the search. Try a smaller photo or try again in a moment.';
      if (status === 429) {
        message = 'Too many photo searches from this network. Please wait a few minutes and try again.';
      } else if (status === 413) {
        message = 'The image payload was too large for the server. Try a smaller or more compressed photo.';
      } else if (isAbortError(err)) {
        message = 'The search took too long and was stopped. Try again with a smaller image or when the network is stable.';
      }
      setAiMatchError(message);
      toast({ title: 'Search failed', description: message, variant: 'destructive' });
    },
    retry: false,
  });

  const runAiMatch = () => {
    if (!aiMatchPhoto) return;
    setAiMatchResults(null);
    setAiMatchRanking(null);
    setAiMatchError(null);
    aiMatchMutation.mutate(aiMatchPhoto);
  };

  const handleAiMatchFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 12 * 1024 * 1024) {
      toast({ title: 'Photo too large', description: 'Use an image under 12 MB.', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setAiMatchFile(file);
    setAiMatchResults(null);
    setAiMatchRanking(null);
    setAiMatchError(null);
    const reader = new FileReader();
    reader.onerror = () => {
      toast({ title: 'Could not read image', variant: 'destructive' });
    };
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const max = 800;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > max || h > max) {
            if (w > h) {
              h = Math.round((h * max) / w);
              w = max;
            } else {
              w = Math.round((w * max) / h);
              h = max;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setAiMatchPhoto(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          setAiMatchPhoto(canvas.toDataURL('image/jpeg', 0.78));
        } catch {
          setAiMatchPhoto(dataUrl);
        }
      };
      img.onerror = () => setAiMatchPhoto(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const createSubMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/api/lost-pet-alerts/subscriptions', { method: 'POST', body }),
    onSuccess: () => {
      refetchSubs();
      setSubscribeOpen(false);
      setSubForm({ alert_type: 'found', breed: '', radius_miles: 10, email_digest_enabled: false });
    },
  });
  const patchSubMutation = useMutation({
    mutationFn: ({ id, email_digest_enabled }: { id: string; email_digest_enabled: boolean }) =>
      apiRequest(`/api/lost-pet-alerts/subscriptions/${id}`, { method: 'PATCH', body: { email_digest_enabled } }),
    onSuccess: () => refetchSubs(),
  });
  const deleteSubMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/lost-pet-alerts/subscriptions/${id}`, { method: 'DELETE' }),
    onSuccess: () => refetchSubs(),
  });
  const importFetchMutation = useMutation({
    mutationFn: (url: string) =>
      apiRequest('/api/lost-dog/import', { method: 'POST', body: { url } }) as Promise<{
        source_platform: string;
        suggested_fields: Record<string, string>;
        original_url: string;
      }>,
    onSuccess: (data) => {
      setImportData(data);
      setImportForm({ ...data.suggested_fields, pet_name: data.suggested_fields?.dog_name || '' });
    },
    onError: (err: any) => {
      const msg = err?.message || err?.error || 'Could not fetch link';
      toast({ title: 'Import failed', description: msg, variant: 'destructive' });
    },
  });
  const importPublishMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest('/api/lost-dog/import/publish', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts/my'] });
      setImportOpen(false);
      setImportData(null);
      setImportUrl('');
    },
  });
  const startMissionMutation = useMutation({
    mutationFn: (alert_id: string) =>
      apiRequest('/api/search-missions', { method: 'POST', body: { alert_id } }) as Promise<{ id: string }>,
    onSuccess: () => refetchMission(),
  });
  const joinMissionMutation = useMutation({
    mutationFn: (missionId: string) =>
      apiRequest(`/api/search-missions/${missionId}/join`, { method: 'POST' }),
    onSuccess: () => refetchMission(),
  });
  const markReunitedMutation = useMutation({
    mutationFn: (alertId: string) =>
      apiRequest(`/api/lost-pet-alerts/${alertId}`, { method: 'PATCH', body: { status: 'reunited' } }) as Promise<any>,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/lost-pet-alerts/my'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recovery/scoreboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recovery/recent'] });
      if (detailAlert?.id === updated?.id) setDetailAlert((a: any) => (a ? { ...a, status: 'reunited', reunited_at: updated?.reunited_at } : null));
    },
    onError: () => {},
  });
  const vetApplyMutation = useMutation({
    mutationFn: (body: { business_name: string; license_number?: string; location?: string }) =>
      apiRequest('/api/vet-verification/apply', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vet-verification'] });
      setVetApplyForm({ business_name: '', license_number: '', location: '' });
    },
    onError: () => {},
  });
  const matchChipMutation = useMutation({
    mutationFn: ({ found_dog_id, microchip_number }: { found_dog_id: string; microchip_number: string }) =>
      apiRequest('/api/lost-dog/match-chip', { method: 'POST', body: { found_dog_id, microchip_number } }) as Promise<{ match: boolean; message?: string }>,
    onError: () => {},
  });
  const addDogMutation = useMutation({
    mutationFn: (body: { name: string; breed?: string }) => apiRequest('/api/dogs', { method: 'POST', body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
      setMyDogsAddOpen(false);
      setMyDogsAddForm({ name: '', breed: '' });
    },
    onError: () => {},
  });
  const registerMicrochipMutation = useMutation({
    mutationFn: ({ dogId, chip_number }: { dogId: string; chip_number: string }) =>
      apiRequest(`/api/dogs/${dogId}/microchip`, { method: 'POST', body: { chip_number } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
      setMicrochipDogId(null);
      setMicrochipNumber('');
    },
    onError: () => {},
  });
  const reportMutation = useMutation({
    mutationFn: ({ alertId, body }: { alertId: string; body: any }) =>
      apiRequest(`/api/lost-pet-alerts/${alertId}/reports`, { method: 'POST', body }),
    onSuccess: () => {
      refetchReports();
      setReportDialogOpen(false);
      setReportingAlert(null);
      setReportForm({ report_type: 'saw_dog', location_text: '', message: '', source_platform: 'mypup' });
    },
  });
  const alertForReport = () => detailAlert || reportingAlert;
  const submitReport = () => {
    const alert = alertForReport();
    if (!alert?.id) return;
    if (reportForm.report_type === 'sighted_location' && !reportForm.location_text.trim()) return;
    reportMutation.mutate({
      alertId: alert.id,
      body: {
        report_type: reportForm.report_type,
        location_text: reportForm.report_type === 'sighted_location' ? reportForm.location_text.trim() : undefined,
        message: reportForm.message.trim() || undefined,
        source_platform: reportForm.source_platform || 'mypup',
        ...(reportForm.report_type === 'sighted_location' && userCoords && {
          latitude: userCoords.lat,
          longitude: userCoords.lng,
        }),
      },
    });
  };
  const createSubscription = () => {
    if (!userCoords) {
      requestLocation();
      return;
    }
    createSubMutation.mutate({
      alert_type: subForm.alert_type,
      breed: subForm.breed || undefined,
      radius_miles: subForm.radius_miles,
      latitude: userCoords.lat,
      longitude: userCoords.lng,
      email_digest_enabled: subForm.email_digest_enabled,
    });
  };

  const openCreate = (type: 'lost' | 'found') => {
    setEditingAlertId(null);
    setForm({ ...createEmptyLostFoundForm(), alert_type: type });
    setCreateOpen(true);
  };

  const openCreateGuarded = (type: 'lost' | 'found') => {
    if (!user) {
      goToGreeting();
      return;
    }
    openCreate(type);
  };

  const openEditAlert = (a: any) => {
    if (!user?.id || a?.user_id !== user.id || a?.status !== 'active') return;
    setEditingAlertId(a.id);
    setForm(alertToForm(a));
    setCreateOpen(true);
    setDetailAlert(null);
    setDetailChipNumber('');
  };

  const openDetail = (a: any) => {
    setDetailAlert(a);
    if (a?.id) {
      apiRequest(`/api/lost-pet-alerts/${a.id}/view`, { method: 'POST' }).catch(() => {});
    }
  };

  /** Deep link (?alert=) + OG tags when opening /lost-and-found?alert=… */
  useEffect(() => {
    const alertId = searchParams.get('alert');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pageUrl = `${origin}/lost-and-found${alertId ? `?alert=${encodeURIComponent(alertId)}` : ''}`;

    if (!alertId) {
      if (typeof document !== 'undefined') document.title = DEFAULT_LF_TITLE;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = (await apiRequest(`/api/lost-pet-alerts/${alertId}/public`)) as { alert?: Record<string, unknown> };
        if (cancelled || !data?.alert) return;
        const a = data.alert as any;
        const kind = a.alert_type === 'lost' ? 'Lost' : 'Found';
        const title = `${kind} dog${a.pet_name ? `: ${a.pet_name}` : ''} — My Pup`;
        const desc = [a.breed, a.last_seen_address || a.city].filter(Boolean).join(' · ') || 'Lost & Found on My Pup';
        const img = (a.image_url || '').trim();
        setLostFoundPageMeta({
          title,
          description: desc,
          image: img || undefined,
          pageUrl,
        });
        setDetailAlert(a);
        apiRequest(`/api/lost-pet-alerts/${alertId}/view`, { method: 'POST' }).catch(() => {});
      } catch {
        if (!cancelled && typeof document !== 'undefined') document.title = DEFAULT_LF_TITLE;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }) as any,
      () => {}
    );
  };

  const handleListingPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!user) {
      toast({ title: 'Sign in to upload', description: 'Create an account or sign in to upload photos.', variant: 'destructive' });
      return;
    }
    const result = await uploadListingImage(file, { bucket: 'listings', kind: 'listing' });
    const url =
      (result as { url?: string } | null)?.url ??
      (result as { asset?: { publicUrl?: string } } | null)?.asset?.publicUrl ??
      null;
    if (url) {
      setForm((f) => ({ ...f, image_url: url }));
      toast({ title: 'Photo uploaded', description: 'Shown below. You can still paste an image URL instead.' });
    }
  };

  const getContactHref = (contact: string | null | undefined): { href: string; label: string } | null => {
    if (!contact || !contact.trim()) return null;
    const s = contact.trim();
    const phone = s.replace(/\D/g, '');
    if (phone.length >= 10) return { href: `tel:${s}`, label: 'Call' };
    if (s.includes('@')) return { href: `mailto:${s}`, label: 'Email' };
    return { href: `mailto:${s}`, label: 'Contact' };
  };
  const getCallHref = (contact: string | null | undefined): string | null => {
    if (!contact || !contact.trim()) return null;
    const s = contact.trim();
    if (s.replace(/\D/g, '').length >= 10) return `tel:${s}`;
    return null;
  };
  const getMessageHref = (contact: string | null | undefined): string | null => {
    if (!contact || !contact.trim()) return null;
    const s = contact.trim();
    if (s.includes('@')) return `mailto:${s}`;
    if (s.replace(/\D/g, '').length >= 10) return `sms:`;
    return `mailto:${s}`;
  };

  const getMilesAway = (a: any): string | null => {
    if (!userCoords || a.latitude == null || a.longitude == null) return null;
    const d = haversineKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude);
    const miles = d / 1.60934;
    return miles < 0.1 ? '< 0.1 miles' : `${miles.toFixed(1)} miles away`;
  };

  const locationLabel = (a: any) => {
    const city = a.city || (a.last_seen_address || '').split(',')[0]?.trim() || '—';
    const miles = getMilesAway(a);
    return miles ? `${city} – ${miles}` : (a.last_seen_address || city);
  };

  /** Opens app directly (SMS, bookmarks) */
  const getDeepLinkUrl = (a: any) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/lost-and-found?alert=${a.id}`;
  /** Server-rendered OG page for crawlers / rich previews (Facebook, Slack, iMessage) */
  const getSocialShareUrl = (a: any) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/share/lost-pet/${a.id}`;
  const getShareText = (a: any) =>
    `${a.alert_type === 'lost' ? 'Lost' : 'Found'} dog: ${a.breed || 'Dog'}${a.pet_name ? ` "${a.pet_name}"` : ''} – ${locationLabel(a)}. Help reunite! `;

  /** Longer blurb for paste-anywhere (post-create share modal). */
  const getSharePresetFull = (a: any) => {
    const head = a.alert_type === 'lost' ? '🚨 LOST DOG — please share' : '🐕 FOUND DOG — help find the owner';
    const lines = [
      head,
      `${a.breed || 'Dog'}${a.pet_name ? ` · "${a.pet_name}"` : ''}`,
      `Area: ${locationLabel(a)}`,
      a.reward_offered && a.alert_type === 'lost' ? 'Reward offered.' : null,
      a.description?.trim()
        ? `Notes: ${String(a.description).trim().slice(0, 400)}${String(a.description).length > 400 ? '…' : ''}`
        : null,
      '',
      `Details & contact (My Pup): ${getSocialShareUrl(a)}`,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');
    return lines;
  };

  const getShareMessageForNextdoor = (a: any) => {
    const url = getSocialShareUrl(a);
    if (a.alert_type === 'found') {
      return [
        '🐕 FOUND DOG',
        '',
        `Breed: ${a.breed || 'Unknown'}`,
        a.pet_name ? `Name (if known): ${a.pet_name}` : null,
        `Where: ${a.last_seen_address || a.city || 'Unknown'}`,
        '',
        'Posted on My Pup — proof of ownership required before release.',
        '',
        `View details: ${url}`,
      ]
        .filter(Boolean)
        .join('\n');
    }
    return `🚨 LOST DOG ALERT 🚨\n\nDog Name: ${a.pet_name || 'Unknown'}\nBreed: ${a.breed || 'Unknown'}\nLast Seen: ${a.last_seen_address || a.city || 'Unknown'}\nReward: ${a.reward_offered ? 'Yes' : 'N/A'}\n\nView details and report sightings here:\n${url}`;
  };

  const copySharePreset = (a: any, kind: 'short' | 'neighbors' | 'full') => {
    const text =
      kind === 'short'
        ? `${getShareText(a).trim()} ${getDeepLinkUrl(a)}`.trim()
        : kind === 'neighbors'
          ? getShareMessageForNextdoor(a)
          : getSharePresetFull(a);
    const labels: Record<typeof kind, string> = {
      short: 'Short message copied',
      neighbors: 'Neighbor-style message copied',
      full: 'Full message copied',
    };
    const write = navigator.clipboard?.writeText;
    if (!write) {
      toast({ title: 'Could not copy', description: 'Your browser does not support clipboard copy.', variant: 'destructive' });
      return;
    }
    write.call(navigator.clipboard, text)
      .then(() => {
        toast({ title: labels[kind], description: 'Paste into the app you use.' });
      })
      .catch(() => toast({ title: 'Could not copy', variant: 'destructive' }));
  };

  const handleCopyLink = (a: any) => {
    navigator.clipboard?.writeText(getSocialShareUrl(a)).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };
  const handleTextMessage = (a: any) => {
    window.open(`sms:?body=${encodeURIComponent(getShareText(a) + getDeepLinkUrl(a))}`, '_blank');
  };
  const handleShareFacebook = (a: any) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getSocialShareUrl(a))}`, '_blank', 'width=600,height=400');
  };
  const handleShareInstagram = (a: any) => {
    navigator.clipboard?.writeText(getShareText(a) + getSocialShareUrl(a)).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
    window.open('https://www.instagram.com/', '_blank');
  };
  const handleCopyForNextdoor = (a: any) => {
    navigator.clipboard?.writeText(getShareMessageForNextdoor(a)).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      toast({ title: 'Copied for Nextdoor', description: 'Paste into your Nextdoor post.' });
    }).catch(() => toast({ title: 'Copy failed', variant: 'destructive' }));
  };

  const openReportSighting = (a: any) => {
    setReportingAlert(a);
    setReportForm({ report_type: 'sighted_location', location_text: '', message: '', source_platform: 'mypup' });
    setReportDialogOpen(true);
  };

  /** Lost = reach owner; found = reach finder / poster (shelter or individual). */
  const contactCopyForAlert = (a: { alert_type?: string }) => {
    const isFound = a.alert_type === 'found';
    return {
      sectionTitle: isFound ? 'Contact the finder' : 'Contact the owner',
      /** Shorter line above action buttons on cards */
      sectionSubtitle: isFound
        ? 'This person or clinic posted the found dog — use the options below.'
        : 'Reach the owner if you’ve seen this dog or can help.',
      messageLabel: isFound ? 'Message finder' : 'Message owner',
      callLabel: isFound ? 'Call finder' : 'Call owner',
    };
  };

  const renderOwnerContactOptions = (a: any, size: 'sm' | 'default' = 'sm') => {
    const copy = contactCopyForAlert(a);
    const callHref = getCallHref(a.contact_info);
    const messageHref = getMessageHref(a.contact_info);
  return (
      <div className="flex flex-wrap gap-2">
        {messageHref && (
          <a href={messageHref}>
            <Button variant="outline" size={size} className="border-gray-300">
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              {copy.messageLabel}
            </Button>
          </a>
        )}
        {callHref && (
          <a href={callHref}>
            <Button variant="outline" size={size} className="border-gray-300">
              <Phone className="w-3.5 h-3.5 mr-1" />
              {copy.callLabel}
            </Button>
          </a>
        )}
        <Button
          variant="outline"
          size={size}
          className="border-gray-300"
          onClick={() => (user ? openReportSighting(a) : goToGreeting())}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          Report sighting
        </Button>
        {renderShareMenu(a, size)}
      </div>
    );
  };

  const renderShareMenu = (a: any, size: 'sm' | 'default' = 'sm') => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className="border-gray-300"
          aria-label={shareCopied ? 'Link copied' : 'Share listing'}
        >
          <Share2 className="w-3.5 h-3.5 mr-1" aria-hidden />
          {shareCopied ? 'Copied!' : 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => handleCopyLink(a)} className="cursor-pointer">
          <Link2 className="w-4 h-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTextMessage(a)} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2" />
          Text message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShareFacebook(a)} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2" />
          Share to Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShareInstagram(a)} className="cursor-pointer">
          <Instagram className="w-4 h-4 mr-2" />
          Share to Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyForNextdoor(a)} className="cursor-pointer">
          <ClipboardList className="w-4 h-4 mr-2" />
          Copy for Nextdoor
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const renderFeedCard = (a: any) => {
    const when = a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : null;
    const isLost = a.alert_type === 'lost';
    const cardTitleId = `lost-found-card-title-${a.id}`;
    const copy = contactCopyForAlert(a);
    return (
      <Card
        key={a.id}
        role="article"
        aria-labelledby={cardTitleId}
        className="overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
      >
        <div className="aspect-[4/3] bg-gray-100 relative">
          {a.image_url ? (
            <img
              src={a.image_url}
              alt={`${a.pet_name || a.breed || 'Dog'} — ${isLost ? 'lost' : 'found'} dog listing photo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl"
              role="img"
              aria-label="No photo for this listing"
            >
              🐕
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1 max-w-[70%]">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase shadow-sm ${
                isLost ? 'bg-red-800 text-white' : 'bg-green-800 text-white'
              }`}
            >
              {isLost ? 'Lost dog' : 'Found dog'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold leading-tight shadow-sm border ${
                isLost
                  ? 'bg-white/95 text-red-900 border-red-200'
                  : 'bg-white/95 text-green-900 border-green-200'
              }`}
            >
              {isLost ? 'Owner posting' : 'Finder / shelter'}
            </span>
          </div>
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[58%]">
            {a.status === 'reunited' && (
              <span
                role="status"
                className="px-2 py-0.5 rounded bg-green-900 text-white text-xs font-semibold flex items-center gap-0.5 shadow-sm border border-green-950/30"
                aria-label="Reunited"
              >
                <CheckCircle className="w-3 h-3 shrink-0" aria-hidden /> Reunited
              </span>
            )}
            {a.status === 'active' && (
              <span
                role="status"
                className="px-2 py-0.5 rounded bg-slate-950 text-white text-xs font-semibold shadow-sm ring-1 ring-white/20"
                aria-label="Active listing"
              >
                Active
              </span>
            )}
            {a.reward_offered && a.status === 'active' && (
              <span
                role="status"
                className="px-2 py-0.5 rounded bg-amber-700 text-white text-xs font-semibold flex items-center gap-0.5 shadow-sm"
                aria-label="Reward offered"
              >
                <Gift className="w-3 h-3 shrink-0" aria-hidden /> Reward
              </span>
            )}
          </div>
          {a.is_vet_listing && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-blue-700 text-white text-xs font-medium flex items-center gap-0.5 border border-blue-900/20">
              <ShieldCheck className="w-3 h-3" aria-hidden /> Verified Veterinary Clinic
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 id={cardTitleId} className="font-semibold text-gray-900 text-lg">
            {a.breed || 'Unknown breed'}
            {a.pet_name ? ` – "${a.pet_name}"` : ''}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" aria-hidden />
            {locationLabel(a)}
          </p>
          {when && <p className="text-xs text-gray-500 mt-0.5">Posted {when}</p>}
          {!isLost && (
            <p className="text-xs text-amber-950 bg-amber-50 border border-amber-300 rounded px-2 py-1.5 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-800" aria-hidden />
              Proof of ownership required before return
            </p>
          )}
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-800">{copy.sectionTitle}</p>
            <p className="text-xs text-gray-600">{copy.sectionSubtitle}</p>
            {renderOwnerContactOptions(a)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50 -ml-1"
            onClick={() => openDetail(a)}
          >
            View full details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderMapPin = (a: any) => {
    const isLost = a.alert_type === 'lost';
    const statusLine =
      a.status === 'reunited' ? 'Reunited' : a.status === 'active' ? 'Active listing' : '';
    const aria = [
      isLost ? 'Lost dog' : 'Found dog',
      [a.breed || 'Dog', a.pet_name].filter(Boolean).join(', '),
      statusLine,
      locationLabel(a),
      'Open full details',
    ]
      .filter(Boolean)
      .join('. ');
    return (
      <button
        key={a.id}
        type="button"
        onClick={() => openDetail(a)}
        className="flex items-center gap-3 w-full text-left p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all"
        aria-label={aria}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-lg leading-none ${
            isLost ? 'bg-red-600' : 'bg-green-600'
          }`}
          aria-hidden
        >
          {isLost ? '🔴' : '🟢'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {a.breed || 'Dog'} {a.pet_name ? `– ${a.pet_name}` : ''}
          </p>
          <p className="text-[10px] text-gray-500 truncate">{isLost ? 'Owner posting' : 'Finder / shelter'}</p>
          <p className="text-xs text-gray-600 truncate">{locationLabel(a)}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {a.status === 'reunited' ? (
              <span className="text-green-900 font-semibold">Reunited</span>
            ) : a.status === 'active' ? (
              <span className="text-slate-900 font-semibold">Active</span>
            ) : null}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <a
        href="#lost-found-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* 1️⃣ Header: 🚨 Lost & Found + [ Report Lost Dog ] [ Report Found Dog ] */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/explore"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Explore
          </Link>
          <h1
            data-testid="lost-found-title"
            className="text-2xl sm:text-3xl font-bold flex items-center gap-3"
            style={{ color: '#000000' }}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="w-5 h-5" aria-hidden />
            </span>
          Lost &amp; Found
        </h1>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {user ? (
              <>
                <Button
                  size="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => openCreate('lost')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Report Lost Dog
                </Button>
                <Button
                  size="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openCreateGuarded('found')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Report Found Dog
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="border-gray-300"
                  onClick={() => { setImportOpen(true); setImportUrl(''); setImportData(null); }}
                >
                  Import Lost Dog Post
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 max-w-full sm:max-w-md w-full mb-1">
                  Preview Lost &amp; Found on the map. Create an account to post, filter, import, and get alerts.
                </p>
                <div className="flex flex-wrap gap-2 w-full">
                  <Button
                    size="default"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={goToGreeting}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Report Lost Dog
                  </Button>
                  <Button
                    size="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={goToGreeting}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Report Found Dog
                  </Button>
                  <Button variant="outline" size="default" className="border-gray-300" onClick={goToGreeting}>
                    Import Lost Dog Post
                  </Button>
                </div>
                <Link to="/greeting" className="text-sm font-medium text-blue-600 hover:text-blue-700 w-full sm:w-auto">
                  Open sign-up / download →
                </Link>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Button
              variant={displayViewMode === 'map' ? 'secondary' : 'outline'}
              size="sm"
              className="border-gray-300"
              onClick={toggleMapList}
              aria-pressed={displayViewMode === 'map'}
              aria-label={displayViewMode === 'map' ? 'Map view, switch to list view' : 'List view, switch to map view'}
            >
              <MapIcon className="w-4 h-4 mr-1" aria-hidden />
              {displayViewMode === 'map' ? 'List view' : 'Map view'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300"
              onClick={requestLocation}
              aria-label={
                user
                  ? 'Request browser location for distances and alerts'
                  : 'Use your location for map distances. Sign in for saved alerts and filters.'
              }
            >
              <Bell className="w-4 h-4 mr-1" aria-hidden />
              {user ? 'Get alerts near me' : 'Use my location'}
            </Button>
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white border-0"
              data-testid="lf-ai-match-trigger"
              onClick={
                user
                  ? () => {
                      setAiMatchOpen(true);
                      setAiMatchPhoto(null);
                      setAiMatchFile(null);
                      setAiMatchResults(null);
                      setAiMatchRanking(null);
                      setAiMatchError(null);
                      aiMatchMutation.reset();
                    }
                  : goToGreeting
              }
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI Match
            </Button>
        {user && (
              <Button variant="outline" size="sm" className="border-gray-300" onClick={() => setSubscribeOpen(true)}>
                <Bell className="w-4 h-4 mr-1" />
                Alert me when…
            </Button>
            )}
          </div>
        </div>
      </div>

      <main
        id="lost-found-main"
        tabIndex={-1}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 outline-none"
      >
        {/* Filters: Lost | Found, Distance, Breed, Color, Size, Date, [ Map View ] */}
        <section
          className="rounded-xl bg-gray-50 border border-gray-200 p-3 sm:p-4 relative"
          aria-labelledby="lost-found-filters-heading"
        >
          {!user && (
            <button
              type="button"
              onClick={goToGreeting}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/80 backdrop-blur-[2px] border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:bg-white/90 transition-colors"
              aria-label="Sign in to use filters and list view. Opens sign up."
            >
              <span className="text-sm font-semibold text-gray-900">Sign in to use filters &amp; list view</span>
              <span className="text-xs text-gray-600 max-w-sm">
                Guests can browse the map below. Create a free account to narrow by breed, distance, and more.
              </span>
              <span className="text-sm font-medium text-blue-600">Tap to sign up →</span>
            </button>
          )}
          <div className={`mb-3 ${!user ? 'opacity-40 pointer-events-none' : ''}`}>
            <h2 id="lost-found-filters-heading" className="text-sm font-medium text-gray-800">
              Filters
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Narrow by type, distance, and traits. Use <span className="font-medium text-gray-600">All</span> to reset type.
            </p>
          </div>
          <div className={`flex flex-wrap items-end gap-3 gap-y-3 ${!user ? 'opacity-40 pointer-events-none' : ''}`}>
            <div
              className="flex rounded-lg bg-white border border-gray-200 p-0.5"
              role="group"
              aria-label="Listing type"
            >
              <button
                type="button"
                onClick={() => setAlertTypeFilter('lost')}
                aria-pressed={alertTypeFilter === 'lost'}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${alertTypeFilter === 'lost' ? 'bg-red-100 text-red-800' : 'text-gray-600'}`}
              >
                Lost
              </button>
              <button
                type="button"
                onClick={() => setAlertTypeFilter('found')}
                aria-pressed={alertTypeFilter === 'found'}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${alertTypeFilter === 'found' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}
              >
                Found
              </button>
              <button
                type="button"
                onClick={() => setAlertTypeFilter('all')}
                aria-pressed={alertTypeFilter === 'all'}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${alertTypeFilter === 'all' ? 'bg-gray-200 text-gray-900' : 'text-gray-600'}`}
              >
                All
              </button>
            </div>
            <div className="w-24">
              <Label className="text-xs text-gray-500">Distance</Label>
              <Select value={String(distanceMiles)} onValueChange={(v) => setDistanceMiles(Number(v))}>
                <SelectTrigger className="mt-0.5 border-gray-300 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTANCE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} mi</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <Label className="text-xs text-gray-500">Breed</Label>
              <Select value={breedFilter || 'any'} onValueChange={(v) => setBreedFilter(v === 'any' ? '' : v)}>
                <SelectTrigger className="mt-0.5 border-gray-300 h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {BREED_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <Label className="text-xs text-gray-500">Color</Label>
              <Select value={colorFilter || 'any'} onValueChange={(v) => setColorFilter(v === 'any' ? '' : v)}>
                <SelectTrigger className="mt-0.5 border-gray-300 h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <Label className="text-xs text-gray-500">Size</Label>
              <Select value={sizeFilter || 'any'} onValueChange={(v) => setSizeFilter(v === 'any' ? '' : v)}>
                <SelectTrigger className="mt-0.5 border-gray-300 h-9">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label className="text-xs text-gray-500">Date</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="mt-0.5 border-gray-300 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap" htmlFor="lost-found-filter-reward">
                <input
                  id="lost-found-filter-reward"
                  type="checkbox"
                  checked={rewardOnly}
                  onChange={(e) => setRewardOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Reward
              </label>
              {(alertTypeFilter === 'found' || alertTypeFilter === 'all') && (
                <label
                  className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap"
                  title="Show only found dogs posted by verified vets"
                  htmlFor="lost-found-filter-vets"
                >
                  <input
                    id="lost-found-filter-vets"
                    type="checkbox"
                    checked={foundAtVetsOnly}
                    onChange={(e) => setFoundAtVetsOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Found at Vets
                </label>
              )}
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="lost-found-sort" className="sr-only">
                  Sort listings
                </Label>
                <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                <SelectTrigger id="lost-found-sort" className="w-full sm:w-[10rem] border-gray-300 h-9" aria-label="Sort listings">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="viewed">Most Viewed</SelectItem>
                  <SelectItem value="reward">Reward Highest</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <Button
                variant={displayViewMode === 'map' ? 'secondary' : 'outline'}
                size="sm"
                className="border-gray-300 shrink-0"
                onClick={toggleMapList}
                aria-pressed={displayViewMode === 'map'}
                aria-label={displayViewMode === 'map' ? 'Map view, switch to list view' : 'List view, switch to map view'}
              >
                <MapIcon className="w-4 h-4 mr-1" aria-hidden />
                {displayViewMode === 'map' ? 'List view' : 'Map view'}
            </Button>
          </div>
          </div>
        </section>

        {/* Feed — Lost Dog Cards / Found Dog Cards */}
        <section aria-labelledby="lost-found-feed-heading" aria-busy={feedLoading}>
          <h2
            id="lost-found-feed-heading"
            data-testid="lost-found-feed-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Feed
          </h2>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {feedLoading
              ? 'Loading listings.'
              : `${alerts.length} listing${alerts.length === 1 ? '' : 's'} in view`}
          </p>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            {user
              ? 'Lost and found listings near you — open a card for contact options and details.'
              : displayViewMode === 'map'
                ? 'Map list: tap a row for details. Switch to list view for cards, or sign in to filter and post.'
                : 'List view: same cards as signed-in users. Sign in above to filter, post, and use AI Match.'}
          </p>
          {!user && displayViewMode === 'list' && (
            <p className="text-xs text-gray-600 mb-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/90 px-3 py-2">
              Browsing as a guest — filters stay locked.{' '}
              <Link to="/greeting" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in or create an account
              </Link>{' '}
              to narrow results and post alerts.
            </p>
          )}
          {displayViewMode === 'map' ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">Map list:</span> Lost (red) · Found (green). Tap a row to open the full listing.
              </p>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto -mx-1 px-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 mb-3">
                      <MapPin className="w-5 h-5" />
      </div>
                    <p className="text-gray-900 font-medium">
                      {user ? 'No listings match these filters' : 'No listings in the preview area'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 max-w-sm mx-auto">
                      {user ? (
                        <>
                          Widen distance, clear breed/color, or switch type to <span className="font-medium">All</span>.
                        </>
                      ) : (
                        <>Check back soon — or sign in to post a lost or found dog.</>
                      )}
                    </p>
                    {user && (
                      <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openCreateGuarded('lost')}>
                          Report lost dog
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openCreateGuarded('found')}>
                          Report found dog
                        </Button>
      </div>
                    )}
                    {!user && (
                      <p className="text-xs text-gray-500 mt-3">Sign in to post and help dogs get home.</p>
                    )}
                  </div>
                ) : (
                  alerts.map(renderMapPin)
                )}
              </div>
            </div>
          ) : (
            <div>
              {alertTypeFilter === 'all' && (
                <p className="text-sm text-gray-600 mb-3">
                  Showing <span className="font-medium text-gray-800">lost</span> and <span className="font-medium text-gray-800">found</span> cards together.
                </p>
              )}
              {alertTypeFilter !== 'all' && (
                <p className="text-sm text-gray-600 mb-3">
                  {alertTypeFilter === 'lost' ? 'Only lost dog listings.' : 'Only found dog listings.'}
                </p>
              )}
            {alerts.length === 0 ? (
              <div className="text-center py-12 sm:py-14 px-4 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-gray-900 font-semibold">Nothing here with these filters</p>
                <p className="text-sm text-gray-600 mt-1.5 max-w-md mx-auto">
                  Try a larger radius, pick <span className="font-medium">Any</span> for breed/color, or change the date range.
                </p>
                {user && (
                  <div className="flex flex-col sm:flex-row justify-center gap-2 mt-5">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openCreateGuarded('lost')}>
                      Report lost dog
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openCreateGuarded('found')}>
                      Report found dog
                    </Button>
                  </div>
                )}
                {!user && (
                  <p className="text-xs text-gray-500 mt-4 max-w-sm mx-auto">
                    Sign in to post a listing and save your edits under My alerts.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {alerts.map(renderFeedCard)}
              </div>
            )}
            </div>
          )}
        </section>

        {/* My alerts */}
        {user && (
          <Card className="border border-gray-200 rounded-xl">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base font-semibold text-gray-900">My alerts</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Tap a row to view; use the pencil to edit while the listing is active.</p>
            </CardHeader>
            <CardContent className="pb-4">
              {myAlerts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-center">
                  <p className="text-sm font-medium text-gray-900">You haven&apos;t posted a listing yet</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                    Your lost and found posts will appear here for quick edits and reunion updates.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openCreate('lost')}>
                      Report lost dog
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openCreateGuarded('found')}>
                      Report found dog
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {myAlerts.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-stretch gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden"
                    >
        <button
          type="button"
                        onClick={() => openDetail(a)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left min-w-0 flex-1"
                        aria-label={`${a.alert_type === 'found' ? 'Found' : 'Lost'} listing: ${a.pet_name || 'Unknown'}${a.breed ? `, ${a.breed}` : ''}. ${a.status === 'reunited' ? 'Reunited.' : a.status === 'active' ? 'Active.' : ''} Open details.`}
                      >
                        {a.image_url ? (
                          <img src={a.image_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                        ) : (
                          <span className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xl shrink-0" aria-hidden>
                            🐕
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {a.alert_type === 'found' ? 'Found: ' : ''}{a.pet_name || 'Unknown'}
                          {a.breed ? ` · ${a.breed}` : ''}
                        </span>
                        {a.status === 'reunited' && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold bg-green-200 text-green-950 flex items-center gap-0.5 border border-green-300/80">
                            <CheckCircle className="w-3 h-3 shrink-0" aria-hidden /> Reunited
                          </span>
                        )}
                        {a.status === 'active' && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-950 border border-slate-300/80">
                            Active
                          </span>
                        )}
        </button>
                      {a.status === 'active' && (
        <button
          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditAlert(a);
                          }}
                          className="shrink-0 px-2.5 border-l border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center"
                          aria-label="Edit listing"
                        >
                          <Pencil className="w-4 h-4" />
        </button>
                      )}
      </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* My Dogs */}
        {user && (
          <Card className="border border-gray-200 rounded-xl">
            <CardHeader className="pb-2 pt-4 flex flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">My Dogs</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Profiles for microchip registry and linking lost alerts.</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300 shrink-0" onClick={() => setMyDogsAddOpen(true)}>
                Add dog
              </Button>
          </CardHeader>
            <CardContent className="pb-4">
              {(dogsData?.dogs?.length ?? 0) === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-5 text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-900">Add your dog&apos;s profile</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-md">
                    Register a microchip and link a dog when you post a lost alert so finders can verify it&apos;s yours faster.
                  </p>
                  <Button size="sm" className="mt-3 bg-gray-900 hover:bg-gray-800 text-white" onClick={() => setMyDogsAddOpen(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add your first dog
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {(dogsData?.dogs ?? []).map((d: any) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                      <Link to={`/dog/${d.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {d.name}{d.breed ? ` · ${d.breed}` : ''}
                      </Link>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300" onClick={() => { setMicrochipDogId(d.id); setMicrochipNumber(''); }}>
                          Register microchip
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* My alert subscriptions */}
        {user && (
          <Card className="border border-gray-200 rounded-xl">
            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">My alert subscriptions</CardTitle>
              <Button variant="outline" size="sm" className="border-gray-300" onClick={() => setSubscribeOpen(true)}>
                <Bell className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="pb-4">
              {subscriptions.length === 0 ? (
                <p className="text-sm text-gray-500">No subscriptions yet. Get notified when a dog is found or lost near you.</p>
              ) : (
                <ul className="space-y-2">
                  {subscriptions.map((sub: any) => (
                    <li key={sub.id} className="flex flex-col gap-2 py-2 border-b border-gray-100 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-gray-900">
                          Alert me if a <strong>{sub.breed || 'any breed'}</strong> is <strong>{sub.alert_type}</strong> within <strong>{sub.radius_miles} miles</strong>
                        </span>
                        <label
                          className="mt-2 flex flex-wrap items-center gap-2 cursor-pointer text-sm text-gray-700"
                          htmlFor={`sub-digest-${sub.id}`}
                        >
                          <Checkbox
                            id={`sub-digest-${sub.id}`}
                            checked={!!sub.email_digest_enabled}
                            disabled={patchSubMutation.isPending}
                            onCheckedChange={(checked) => {
                              const next = checked === true;
                              patchSubMutation.mutate({ id: sub.id, email_digest_enabled: next });
                            }}
                          />
                          <span>
                            Weekly email digest
                            <span className="block text-xs font-normal text-gray-500">
                              Optional summary of matching alerts (in-app push still applies when enabled).
                            </span>
                          </span>
                        </label>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 self-start sm:self-center"
                        onClick={() => deleteSubMutation.mutate(sub.id)}
                        disabled={deleteSubMutation.isPending}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* City Lost Dog Radar */}
        {userCoords && (
          <Card className="border border-amber-200 bg-amber-50/30 rounded-xl">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base font-semibold text-gray-900">City Lost Dog Radar</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Quick pulse: dogs reported missing near you today (~10 mi).</p>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-gray-700">
                {radarData?.count == null ? (
                  <span className="text-gray-500">Loading nearby alerts…</span>
                ) : radarData.count > 0 ? (
                  <>
                    {radarData.count} dog{radarData.count !== 1 ? 's' : ''} reported missing near you today (within 10 mi).
                  </>
                ) : (
                  <span className="text-amber-900/90">
                    No new missing-dog reports within 10 miles today — good news. Check the feed above for a wider area.
                  </span>
                )}
              </p>
              {radarData?.alerts?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {radarData.alerts.slice(0, 5).map((a: any) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => openDetail(a)}
                      className="text-left px-3 py-2 rounded-lg border border-amber-200 bg-white hover:bg-amber-50 text-sm"
                    >
                      {a.breed || 'Dog'}{a.pet_name ? ` – ${a.pet_name}` : ''}
                    </button>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Lost Pet Checklist */}
        <Card className="border border-blue-100 bg-blue-50/50 rounded-xl">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              Lost pet? Quick guide for owners
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                Contact local shelters
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                Post flyers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                Alert vets
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                Post on My Pup
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Success Stories — real data */}
        {(() => {
          const weekCount = (scoreboardWeekData?.scoreboard ?? []).reduce((s, r) => s + (r.count || 0), 0);
          const recentReunions = recentReunionsData?.reunions ?? [];
          return (
            <>
              <Card className="border border-green-100 bg-green-50/50 rounded-xl overflow-hidden">
                <CardContent className="py-4 px-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    <span className="text-2xl sm:text-3xl" role="img" aria-label="celebrate">🎉</span>
                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                      <span className="text-green-700">{weekCount}</span> dogs reunited this week
                    </p>
                </div>
                  {weekCount === 0 && (
                    <p className="text-sm text-gray-600 w-full max-w-md">
                      Every reunion starts with a sighting or a share — post a listing or help someone search.
                    </p>
                  )}
                </CardContent>
              </Card>
              {recentReunions.length > 0 && (
                <Card className="border border-gray-200 rounded-xl">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base font-semibold text-gray-900">Recent reunions</CardTitle>
                    <p className="text-xs text-gray-500">Dogs recently marked reunited</p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-wrap gap-3">
                      {recentReunions.map((r: any) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => openDetail({ ...r, status: 'reunited', alert_type: 'lost' })}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-left hover:bg-gray-50 min-w-0"
                        >
                          {r.image_url ? (
                            <img src={r.image_url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                          ) : (
                            <span className="w-12 h-12 rounded bg-green-100 flex items-center justify-center text-xl shrink-0">🐕</span>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{r.pet_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 truncate">{r.city || '—'}{r.reunited_at ? ` · ${formatDistanceToNow(new Date(r.reunited_at), { addSuffix: true })}` : ''}</p>
              </div>
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Reunited</span>
                        </button>
            ))}
                    </div>
          </CardContent>
        </Card>
      )}
            </>
          );
        })()}

        {/* Recovery Scoreboard */}
        {scoreboardData?.scoreboard?.length ? (
          <Card className="border border-gray-200 rounded-xl">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base font-semibold text-gray-900">Recovery Scoreboard</CardTitle>
              <p className="text-xs text-gray-500">Cities with most reunions this month</p>
        </CardHeader>
            <CardContent className="pb-4">
              <ul className="space-y-1 text-sm">
                {scoreboardData.scoreboard.slice(0, 10).map((row: { city: string | null; count: number }, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-gray-700">{row.city || 'Unknown'}</span>
                    <span className="font-medium text-green-700">{row.count} reunited</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </main>

      {/* Create / Edit listing dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setEditingAlertId(null);
            setForm(createEmptyLostFoundForm());
          }
        }}
      >
        <DialogContent
          className="rounded-xl sm:max-w-md max-h-[90vh] overflow-y-auto w-[calc(100vw-1.5rem)] sm:w-full"
          aria-describedby="lost-found-form-desc"
        >
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {editingAlertId
                ? form.alert_type === 'lost'
                  ? 'Edit lost dog listing'
                  : 'Edit found dog listing'
                : form.alert_type === 'lost'
                  ? 'Report lost dog'
                  : 'Report found dog'}
            </DialogTitle>
            <DialogDescription id="lost-found-form-desc" className="text-left text-sm text-gray-600">
              {editingAlertId
                ? 'Update details anytime while your listing is active. Required fields must stay filled in.'
                : form.alert_type === 'lost'
                  ? 'Share your dog’s details and where they were last seen so the community can help.'
                  : 'Share what you know about this dog so we can reach the owner safely.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {!editingAlertId && (
              <div className="flex gap-2 p-1 rounded-lg bg-gray-100">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, alert_type: 'lost' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium ${
                    form.alert_type === 'lost' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Search className="w-4 h-4" /> Lost
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, alert_type: 'found' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium ${
                    form.alert_type === 'found' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Heart className="w-4 h-4" /> Found
                </button>
              </div>
            )}
            {editingAlertId && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                Listing type:{' '}
                <span className="font-semibold text-gray-900">
                  {form.alert_type === 'lost' ? 'Lost dog' : 'Found dog'}
                </span>{' '}
                (fixed)
              </div>
            )}

            {form.alert_type === 'found' && (
              <ProofOfOwnershipNotice />
            )}
            {/* Vet / shelter verification — only when posting a found dog */}
            {form.alert_type === 'found' && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-3 space-y-2">
                <p className="text-sm font-medium text-blue-900">Vet or shelter?</p>
                {vetVerificationData?.verification_status === 'approved' ? (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_vet_listing}
                      onChange={(e) => setForm((f) => ({ ...f, is_vet_listing: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-900">Post as <strong>Verified Veterinary Clinic</strong> — your listing will show a trusted badge.</span>
                  </label>
                ) : vetVerificationData?.verification_status === 'pending' ? (
                  <p className="text-sm text-blue-800">Verification pending — we&apos;re reviewing your application. You can still post; the verified badge will appear once approved.</p>
                ) : (
                  <>
                    <p className="text-sm text-blue-800">Get verified so your found-dog posts show a <strong>Verified Veterinary Clinic</strong> badge. Owners trust listings from verified clinics.</p>
                    <Button type="button" variant="outline" size="sm" className="border-blue-300 text-blue-800 hover:bg-blue-100" onClick={() => setVetApplyOpen((o) => !o)}>
                      {vetApplyOpen ? 'Cancel' : 'Get verified'}
                    </Button>
                    {vetApplyOpen && (
                      <div className="pt-2 space-y-2 border-t border-blue-200">
                        <Label className="text-xs text-blue-900">Business name <span className="text-red-600">*</span></Label>
                        <Input
                          placeholder="e.g. Midtown Animal Clinic"
                          value={vetApplyForm.business_name}
                          onChange={(e) => setVetApplyForm((f) => ({ ...f, business_name: e.target.value }))}
                          className="border-blue-200 bg-white"
                        />
                        <Label className="text-xs text-blue-900">License number (optional)</Label>
                        <Input
                          placeholder="State or practice license"
                          value={vetApplyForm.license_number}
                          onChange={(e) => setVetApplyForm((f) => ({ ...f, license_number: e.target.value }))}
                          className="border-blue-200 bg-white"
                        />
                        <Label className="text-xs text-blue-900">Location (optional)</Label>
                        <Input
                          placeholder="e.g. 123 Main St, City"
                          value={vetApplyForm.location}
                          onChange={(e) => setVetApplyForm((f) => ({ ...f, location: e.target.value }))}
                          className="border-blue-200 bg-white"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!vetApplyForm.business_name.trim() || vetApplyMutation.isPending}
                          onClick={() => vetApplyMutation.mutate(vetApplyForm)}
                        >
                          {vetApplyMutation.isPending ? 'Submitting…' : 'Submit for verification'}
                        </Button>
                        {vetApplyMutation.isSuccess && (
                          <p className="text-sm text-green-700 font-medium">Submitted! We&apos;ll review and notify you. Once approved, you can post with the Verified Veterinary Clinic badge.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Required */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">Required</p>
              <div className="space-y-1">
                <Label className="text-gray-900" htmlFor="lost-found-photo-url">
                  Photo <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    id="lost-found-photo-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleListingPhotoFile}
                    disabled={listingImageUploading || !user}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 shrink-0 w-full sm:w-auto"
                    disabled={listingImageUploading || !user}
                    onClick={() => document.getElementById('lost-found-photo-file')?.click()}
                  >
                    {listingImageUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading{listingUploadProgress ? ` ${listingUploadProgress}%` : '…'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload photo
                      </>
                    )}
                  </Button>
                  {!user && (
                    <span className="text-xs text-gray-500">Sign in to upload — or paste an image URL.</span>
                  )}
                </div>
                <Input
                  id="lost-found-photo-url"
                  className="border-gray-300"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="Image URL (e.g. https://…) or upload above"
                  aria-describedby="lost-found-photo-hint"
                />
                <p id="lost-found-photo-hint" className="text-xs text-gray-500">
                  Uses your account storage (same as marketplace listings). Max 10MB.
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-900">Dog name {form.alert_type === 'found' && '(if known)'} <span className="text-red-600">*</span></Label>
                <Input
                  className="border-gray-300"
                  value={form.pet_name}
                  onChange={(e) => setForm((f) => ({ ...f, pet_name: e.target.value }))}
                  placeholder="e.g. Max or Unknown"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-900">Breed <span className="text-red-600">*</span></Label>
                <Input
                  className="border-gray-300"
                  value={form.breed}
                  onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                  placeholder="e.g. Golden Retriever"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-gray-900">Color <span className="text-red-600">*</span></Label>
                  <Select value={form.color || ''} onValueChange={(v) => setForm((f) => ({ ...f, color: v }))}>
                    <SelectTrigger className="border-gray-300"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-900">Size <span className="text-red-600">*</span></Label>
                  <Select value={form.dog_size || ''} onValueChange={(v) => setForm((f) => ({ ...f, dog_size: v }))}>
                    <SelectTrigger className="border-gray-300"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-gray-900">Last seen location (map pin / address) <span className="text-red-600">*</span></Label>
                <Input
                  className="border-gray-300"
                  value={form.last_seen_address}
                  onChange={(e) => setForm((f) => ({ ...f, last_seen_address: e.target.value }))}
                  placeholder="Address or area where dog was last seen"
                />
                {userCoords && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 border-gray-300"
                    onClick={() => setForm((f) => ({ ...f, latitude: userCoords.lat, longitude: userCoords.lng }))}
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" /> Use my location
                  </Button>
                )}
              </div>
              {form.alert_type === 'lost' && (
                <div className="space-y-1">
                  <Label className="text-gray-900">Date lost <span className="text-red-600">*</span></Label>
                  <Input
                    type="date"
                    className="border-gray-300"
                    value={form.last_seen_at}
                    onChange={(e) => setForm((f) => ({ ...f, last_seen_at: e.target.value }))}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-gray-900">How can someone reach you? <span className="text-red-600">*</span></Label>
                <Input
                  className="border-gray-300"
                  value={form.contact_info}
                  onChange={(e) => setForm((f) => ({ ...f, contact_info: e.target.value }))}
                  placeholder="Phone or email"
                />
              </div>
            </div>

            {/* Optional: Reward, Collar description, Microchip status, Temperament */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Optional</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.reward_offered}
                  onChange={(e) => setForm((f) => ({ ...f, reward_offered: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Reward
              </label>
              <div className="space-y-1">
                <Label className="text-gray-700">Collar description</Label>
                <Input
                  className="border-gray-300"
                  value={form.collar_description}
                  onChange={(e) => setForm((f) => ({ ...f, collar_description: e.target.value }))}
                  placeholder="e.g. Blue collar with tag"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-700">Microchip status</Label>
                <Select value={form.microchip_status || ''} onValueChange={(v) => setForm((f) => ({ ...f, microchip_status: v }))}>
                  <SelectTrigger className="border-gray-300"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.alert_type === 'lost' && (dogsData?.dogs?.length ?? 0) > 0 && (
                <div className="space-y-1">
                  <Label className="text-gray-700">Link to My Dog</Label>
                  <Select value={form.dog_id || 'none'} onValueChange={(v) => setForm((f) => ({ ...f, dog_id: v === 'none' ? '' : v }))}>
                    <SelectTrigger className="border-gray-300"><SelectValue placeholder="Optional: link to a dog profile" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Don&apos;t link</SelectItem>
                      {(dogsData?.dogs ?? []).map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}{d.breed ? ` · ${d.breed}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Link this lost alert to a dog in My Dogs so finders can scan the dog&apos;s QR tag.</p>
                </div>
              )}
              {form.alert_type === 'found' && (
                <div className="space-y-1">
                  <Label className="text-gray-700">Microchip number (if scanned)</Label>
                  <Input
                    className="border-gray-300"
                    value={form.microchip_scan_result}
                    onChange={(e) => setForm((f) => ({ ...f, microchip_scan_result: e.target.value }))}
                    placeholder="e.g. 982000123456789"
                  />
                  <p className="text-xs text-gray-500">We&apos;ll try to notify the registered owner if they&apos;re on My Pup.</p>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-gray-700">Temperament</Label>
                <Input
                  className="border-gray-300"
                  value={form.temperament}
                  onChange={(e) => setForm((f) => ({ ...f, temperament: e.target.value }))}
                  placeholder="e.g. Friendly, shy around strangers"
                />
              </div>
            </div>

            {/* Additional details (optional) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500">Additional details</p>
              {form.alert_type === 'found' && (
                <div className="space-y-1">
                  <Label className="text-gray-600 text-sm">Date found</Label>
                  <Input
                    type="date"
                    className="border-gray-300"
                    value={form.last_seen_at}
                    onChange={(e) => setForm((f) => ({ ...f, last_seen_at: e.target.value }))}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-gray-600 text-sm">City</Label>
                <Input
                  className="border-gray-300"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="e.g. Houston TX"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 text-sm">Other details</Label>
                <Textarea
                  className="border-gray-300"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Markings, behavior, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-600 text-sm">Gender</Label>
                <Select value={form.gender || 'any'} onValueChange={(v) => setForm((f) => ({ ...f, gender: v === 'any' ? '' : v }))}>
                  <SelectTrigger className="border-gray-300"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {GENDER_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" className="border-gray-300 w-full sm:w-auto" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={() => {
                const body = buildLostFoundPayload(form, vetVerificationData);
                if (editingAlertId) {
                  updateAlertMutation.mutate({ id: editingAlertId, body });
                } else {
                  createMutation.mutate(body);
                }
              }}
              disabled={
                createMutation.isPending ||
                updateAlertMutation.isPending ||
                (form.alert_type === 'lost'
                  ? !(form.image_url?.trim() && form.pet_name?.trim() && form.breed?.trim() && form.color?.trim() && form.dog_size?.trim() && form.last_seen_address?.trim() && form.last_seen_at?.trim() && form.contact_info?.trim())
                  : !(form.image_url?.trim() && form.breed?.trim() && form.color?.trim() && form.dog_size?.trim() && form.last_seen_address?.trim() && form.contact_info?.trim()))
              }
            >
              {createMutation.isPending || updateAlertMutation.isPending
                ? editingAlertId
                  ? 'Saving…'
                  : 'Posting…'
                : editingAlertId
                  ? 'Save changes'
                  : form.alert_type === 'found'
                    ? 'Post found dog'
                    : 'Post lost dog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post-create share — presets reuse the same handlers as the listing detail share menu */}
      <Dialog
        open={postCreateShareOpen}
        onOpenChange={(open) => {
          setPostCreateShareOpen(open);
          if (!open) setPostCreateShareAlert(null);
        }}
      >
        <DialogContent className="rounded-xl sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="post-create-share-desc">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" aria-hidden />
              Spread the word
            </DialogTitle>
            <DialogDescription id="post-create-share-desc">
              Your listing is live. Copy a preset message or use the shortcuts below — sharing helps neighbors and shelters see it faster.
            </DialogDescription>
          </DialogHeader>
          {postCreateShareAlert && (
            <>
              <div className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3">
                {postCreateShareAlert.image_url ? (
                  <img
                    src={postCreateShareAlert.image_url}
                    alt={`${postCreateShareAlert.pet_name || postCreateShareAlert.breed || 'Dog'} listing`}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-2xl shrink-0" aria-hidden>
                    🐕
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {postCreateShareAlert.alert_type === 'lost' ? 'Lost' : 'Found'}:{' '}
                    {postCreateShareAlert.pet_name || postCreateShareAlert.breed || 'Dog'}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-3">{getShareText(postCreateShareAlert)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-create-share-full-text" className="text-sm font-medium text-gray-900">
                  Full message (preview)
                </Label>
                <Textarea
                  id="post-create-share-full-text"
                  readOnly
                  rows={6}
                  className="text-xs leading-relaxed border-gray-200 bg-white font-sans resize-none"
                  value={getSharePresetFull(postCreateShareAlert)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-gray-900"
                    onClick={() => copySharePreset(postCreateShareAlert, 'full')}
                  >
                    Copy full message
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-gray-900"
                    onClick={() => copySharePreset(postCreateShareAlert, 'short')}
                  >
                    Copy short
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-gray-900"
                    onClick={() => copySharePreset(postCreateShareAlert, 'neighbors')}
                  >
                    Copy neighbor / Nextdoor
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-600">Short</span> is one line plus your listing link.{' '}
                  <span className="font-medium text-gray-600">Neighbor</span> is a formatted block for Nextdoor-style posts.
                </p>
              </div>
              <p className="text-sm font-medium text-gray-800 pt-1">Share via app</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">
                <Button type="button" variant="outline" className="border-gray-300" onClick={() => handleCopyLink(postCreateShareAlert)}>
                  <Link2 className="w-4 h-4 mr-2 shrink-0" aria-hidden />
                  Copy link
                </Button>
                <Button type="button" variant="outline" className="border-gray-300" onClick={() => handleTextMessage(postCreateShareAlert)}>
                  <MessageCircle className="w-4 h-4 mr-2 shrink-0" aria-hidden />
                  Text / SMS
                </Button>
                <Button type="button" variant="outline" className="border-gray-300" onClick={() => handleShareFacebook(postCreateShareAlert)}>
                  <Facebook className="w-4 h-4 mr-2 shrink-0" aria-hidden />
                  Facebook
                </Button>
                <Button type="button" variant="outline" className="border-gray-300" onClick={() => handleCopyForNextdoor(postCreateShareAlert)}>
                  <ClipboardList className="w-4 h-4 mr-2 shrink-0" aria-hidden />
                  Copy for Nextdoor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 sm:col-span-2"
                  onClick={() => handleShareInstagram(postCreateShareAlert)}
                >
                  <Instagram className="w-4 h-4 mr-2 shrink-0" aria-hidden />
                  Copy text & open Instagram
                </Button>
              </div>
            </>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="border-gray-300 w-full sm:w-auto"
              onClick={() => {
                setPostCreateShareOpen(false);
                setPostCreateShareAlert(null);
              }}
            >
              Done
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={() => {
                if (postCreateShareAlert) openDetail(postCreateShareAlert);
                setPostCreateShareOpen(false);
                setPostCreateShareAlert(null);
              }}
            >
              View listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Lost Dog Post modal */}
      <Dialog open={importOpen} onOpenChange={(open) => { setImportOpen(open); if (!open) setImportData(null); }}>
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Lost Dog Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Paste a link from Facebook, Nextdoor, or Ring to create a Lost Dog listing on My Pup.</p>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input
              placeholder="https://nextdoor.com/..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              className="border-gray-300"
            />
          </div>
          {!importData ? (
            <div className="flex flex-col gap-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!importUrl.trim() || importFetchMutation.isPending}
                onClick={() => importFetchMutation.mutate(importUrl.trim())}
              >
                {importFetchMutation.isPending ? 'Fetching…' : 'Fetch preview'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300"
                disabled={!importUrl.trim()}
                onClick={() => {
                  const u = importUrl.trim();
                  let source = 'other';
                  if (u.includes('nextdoor.com')) source = 'nextdoor';
                  else if (u.includes('facebook.com') || u.includes('fb.com')) source = 'facebook';
                  else if (u.includes('ring.com')) source = 'ring';
                  setImportData({ source_platform: source, suggested_fields: {}, original_url: u });
                  setImportForm({});
                }}
              >
                Continue without preview
              </Button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Source: {importData.source_platform}. Edit below and publish.</p>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {['pet_name', 'dog_name', 'breed', 'image_url', 'photo_url', 'location_text', 'last_seen_address', 'description', 'contact_info'].map((key) => (
                  <div key={key}>
                    <Label className="text-xs">{key.replace(/_/g, ' ')}</Label>
                    <Input
                      value={importForm[key] ?? ''}
                      onChange={(e) => setImportForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={key}
                      className="border-gray-300 mt-0.5"
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportData(null)}>Back</Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={importPublishMutation.isPending || !(importForm.pet_name || importForm.dog_name || importForm.breed)}
                  onClick={() =>
                    importPublishMutation.mutate({
                      original_url: importData.original_url,
                      source_platform: importData.source_platform,
                      alert_type: 'lost',
                      pet_name: importForm.pet_name || importForm.dog_name || '',
                      breed: importForm.breed || '',
                      image_url: importForm.image_url || importForm.photo_url || '',
                      last_seen_address: importForm.last_seen_address || importForm.location_text || '',
                      description: importForm.description || '',
                      contact_info: importForm.contact_info || '',
                    })
                  }
                >
                  {importPublishMutation.isPending ? 'Publishing…' : 'Publish to My Pup'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Community report dialog */}
      <Dialog
        open={reportDialogOpen}
        onOpenChange={(open) => {
          setReportDialogOpen(open);
          if (!open) setReportingAlert(null);
        }}
      >
        <DialogContent className="rounded-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {reportForm.report_type === 'saw_dog' && 'I saw this dog'}
              {reportForm.report_type === 'possible_match' && 'Possible match'}
              {reportForm.report_type === 'sighted_location' && 'Report sighted location'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-gray-900">Reported via</Label>
              <Select
                value={reportForm.source_platform || 'mypup'}
                onValueChange={(v) => setReportForm((f) => ({ ...f, source_platform: v }))}
              >
                <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mypup">My Pup</SelectItem>
                  <SelectItem value="ring">Ring</SelectItem>
                  <SelectItem value="nextdoor">Nextdoor</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportForm.report_type === 'sighted_location' && (
              <div className="space-y-1">
                <Label className="text-gray-900">Where did you see the dog?</Label>
                <Input
                  className="border-gray-300"
                  placeholder="e.g. Midtown Park"
                  value={reportForm.location_text}
                  onChange={(e) => setReportForm((f) => ({ ...f, location_text: e.target.value }))}
                />
                {userCoords && (
                  <p className="text-xs text-green-700">Your location will be saved for the sightings map.</p>
                )}
                {!userCoords && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 mt-1"
                    onClick={requestLocation}
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" /> Use my location for map
                  </Button>
                )}
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-gray-900">Additional details (optional)</Label>
              <Textarea
                className="border-gray-300 min-h-[60px]"
                placeholder="Any extra info..."
                value={reportForm.message}
                onChange={(e) => setReportForm((f) => ({ ...f, message: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-300" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={submitReport}
              disabled={
                reportMutation.isPending ||
                (reportForm.report_type === 'sighted_location' && !reportForm.location_text.trim())
              }
            >
              {reportMutation.isPending ? 'Submitting…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <Dialog open={!!detailAlert} onOpenChange={() => { setDetailAlert(null); setDetailChipNumber(''); }}>
        <DialogContent className="rounded-xl sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="lost-found-detail-desc">
          {detailAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  {detailAlert.alert_type === 'lost' ? 'Lost dog' : 'Found dog'}
                  {detailAlert.pet_name ? ` – ${detailAlert.pet_name}` : ''}
                </DialogTitle>
                <DialogDescription id="lost-found-detail-desc" className="text-left text-sm text-gray-600">
                  {detailAlert.alert_type === 'found'
                    ? 'Reach the person or clinic who posted this found dog. Proof of ownership is required before taking the dog home.'
                    : 'Reach the owner if you’ve seen this dog or can help. Share this listing to widen the search.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {detailAlert.image_url && (
                  <img
                    src={detailAlert.image_url}
                    alt={detailAlert.pet_name || 'Dog'}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                )}
                <p className="font-medium text-gray-900">
                  {detailAlert.breed || 'Unknown breed'}
                  {detailAlert.pet_name ? ` – "${detailAlert.pet_name}"` : ''}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {locationLabel(detailAlert)}
                </p>
                {detailAlert.created_at && (
                  <p className="text-xs text-gray-500">
                    Posted {formatDistanceToNow(new Date(detailAlert.created_at), { addSuffix: true })}
                  </p>
                )}
                {detailAlert.status === 'active' && (
                  <p className="text-xs font-medium text-slate-800">
                    Status: <span className="text-slate-900">Active</span>
                  </p>
                )}
                {detailAlert.status === 'reunited' && (
                  <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    Reunited
                    {detailAlert.reunited_at && (
                      <span className="text-gray-500 font-normal">
                        · {formatDistanceToNow(new Date(detailAlert.reunited_at), { addSuffix: true })}
                      </span>
                    )}
                  </p>
                )}
                {detailAlert.reward_offered && (
                  <p className="text-sm font-medium text-amber-700 flex items-center gap-1">
                    <Gift className="w-4 h-4" /> Reward offered
                  </p>
                )}
                {detailAlert.is_vet_listing && (
                  <p className="text-sm font-medium text-blue-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Verified Veterinary Clinic
                  </p>
                )}
                {detailAlert.alert_type === 'found' && (
                  <ProofOfOwnershipNotice />
                )}
                {detailAlert.alert_type === 'found' && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">Microchip</p>
                    {(detailAlert.microchip_scan_result || detailChipNumber) ? (
                      <p className="text-sm text-gray-700">
                        {detailAlert.microchip_scan_result || detailChipNumber}
                        {user && (
                          <Button
                            type="button"
                            size="sm"
                            className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                            disabled={matchChipMutation.isPending}
                            onClick={() => {
                              const num = (detailAlert.microchip_scan_result || detailChipNumber || '').trim();
                              if (num) matchChipMutation.mutate({ found_dog_id: detailAlert.id, microchip_number: num });
                            }}
                          >
                            {matchChipMutation.isPending ? 'Checking…' : 'Notify registered owner'}
                          </Button>
                        )}
                      </p>
                    ) : user ? (
                      <div className="flex gap-2 items-center flex-wrap">
                        <Input
                          placeholder="Enter microchip number"
                          value={detailChipNumber}
                          onChange={(e) => setDetailChipNumber(e.target.value)}
                          className="flex-1 min-w-[140px] border-gray-300"
                        />
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!detailChipNumber.trim() || matchChipMutation.isPending}
                          onClick={() => matchChipMutation.mutate({ found_dog_id: detailAlert.id, microchip_number: detailChipNumber.trim() })}
                        >
                          {matchChipMutation.isPending ? 'Checking…' : 'Check for owner'}
                        </Button>
                  </div>
                    ) : null}
                    {matchChipMutation.isSuccess && matchChipMutation.data?.match && (
                      <p className="text-xs text-green-700 mt-1">Owner notified.</p>
                    )}
                    {matchChipMutation.isSuccess && !matchChipMutation.data?.match && (
                      <p className="text-xs text-gray-600 mt-1">No microchip registered on My Pup.</p>
                    )}
                </div>
                )}
                {detailAlert.description && (
                  <p className="text-sm text-gray-700">{detailAlert.description}</p>
                )}
                {detailAlert.dog_id && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2 mb-3">
                    <p className="text-xs font-medium text-blue-900">Linked to dog profile</p>
                    <Link to={`/dog/${detailAlert.dog_id}`} className="text-sm text-blue-700 hover:underline">
                      View dog profile →
                    </Link>
                  </div>
                )}
                {detailAlert.alert_type === 'lost' && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Cross-post this alert</p>
                    <p className="text-xs text-gray-600 mb-2">Share on social or neighborhood apps so more people see it.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="border-gray-300" onClick={() => handleShareFacebook(detailAlert)}>
                        <Facebook className="w-3.5 h-3.5 mr-1" />
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300" onClick={() => handleCopyForNextdoor(detailAlert)}>
                        <ClipboardList className="w-3.5 h-3.5 mr-1" />
                        Copy for Nextdoor
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300" onClick={() => handleCopyLink(detailAlert)}>
                        <Link2 className="w-3.5 h-3.5 mr-1" />
                        Copy link
                      </Button>
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{contactCopyForAlert(detailAlert).sectionTitle}</p>
                  <p className="text-xs text-gray-600 mb-3">{contactCopyForAlert(detailAlert).sectionSubtitle}</p>
                  {renderOwnerContactOptions(detailAlert, 'default')}
                  {detailAlert.alert_type === 'lost' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2 border-gray-300">
                          Get flyer <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[200px]">
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const data = await apiRequest(`/api/lost-dog/flyer/${detailAlert.id}`) as Record<string, unknown>;
                              const url = (data.listing_url || data.qr_data) as string;
                              const qrDataUrl = url ? await QRCode.toDataURL(url, { width: 180, margin: 1 }) : '';
                              const w = window.open('', '_blank');
                              if (w) {
                                w.document.write(`
                                  <!DOCTYPE html><html><head><title>Lost Dog Flyer</title></head><body style="font-family:sans-serif;padding:20px;text-align:center;max-width:400px;margin:0 auto">
                                  <h1 style="margin-bottom:12px">LOST DOG</h1>
                                  ${data.image_url ? `<img src="${String(data.image_url)}" alt="Dog" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:0 auto 12px" crossorigin="anonymous" />` : ''}
                                  <p><strong>${String(data.pet_name || 'Unknown')}</strong> · ${String(data.breed || '')} · ${String(data.color || '')}</p>
                                  <p>Last seen: ${String(data.last_seen_address || data.city || '—')}</p>
                                  <p>${data.reward_offered ? 'Reward offered' : ''}</p>
                                  <p>Contact: ${String(data.contact_info || '—')}</p>
                                  <p><a href="${String(data.listing_url)}">View on My Pup</a></p>
                                  ${qrDataUrl ? `<p style="margin-top:12px"><img src="${qrDataUrl}" alt="QR code" width="120" height="120" style="display:block;margin:0 auto" /><br/><small>Scan to view listing</small></p>` : ''}
                                  <p style="margin-top:16px"><button onclick="window.print()" style="padding:8px 16px;font-size:14px;cursor:pointer">Print flyer</button></p>
                                  </body></html>`);
                                w.document.close();
                              }
                            } catch (_e) {}
                          }}
                        >
                          Print flyer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const data = await apiRequest(`/api/lost-dog/flyer/${detailAlert.id}`) as Record<string, unknown>;
                              const url = (data.listing_url || data.qr_data) as string;
                              const qrDataUrl = url ? await QRCode.toDataURL(url, { width: 160, margin: 1 }) : '';
                              const div = document.createElement('div');
                              div.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:24px;font-family:sans-serif;text-align:center;boxSizing:border-box;';
                              div.innerHTML = `
                                <h1 style="margin:0 0 12px;font-size:20px">LOST DOG</h1>
                                ${data.image_url ? `<img src="${String(data.image_url)}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:0 auto 12px" crossorigin="anonymous" />` : '<div style="height:120px;background:#eee;border-radius:8px;margin-bottom:12px"></div>'}
                                <p style="margin:4px 0;font-size:14px"><strong>${String(data.pet_name || 'Unknown')}</strong> · ${String(data.breed || '')}</p>
                                <p style="margin:4px 0;font-size:12px;color:#555">Last seen: ${String(data.last_seen_address || data.city || '—')}</p>
                                <p style="margin:4px 0;font-size:12px">${String(data.contact_info || '')}</p>
                                ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR" width="100" height="100" style="margin-top:8px" />` : ''}
                              `;
                              document.body.appendChild(div);
                              await new Promise(r => setTimeout(r, 600));
                              const dataUrl = await toPng(div, { backgroundColor: '#ffffff', pixelRatio: 2 });
                              document.body.removeChild(div);
                              const a = document.createElement('a');
                              a.href = dataUrl;
                              a.download = `lost-dog-${(data.pet_name || 'flyer').toString().replace(/\s+/g, '-')}.png`;
                              a.click();
                              toast({ title: 'Flyer downloaded', description: 'PNG saved.' });
                            } catch (e) {
                              toast({ title: 'Download failed', description: (e as Error)?.message || 'Could not generate PNG', variant: 'destructive' });
                            }
                          }}
                        >
                          Download PNG
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const data = await apiRequest(`/api/lost-dog/flyer/${detailAlert.id}`) as Record<string, unknown>;
                              const url = (data.listing_url || data.qr_data) as string;
                              const qrDataUrl = url ? await QRCode.toDataURL(url, { width: 160, margin: 1 }) : '';
                              const div = document.createElement('div');
                              div.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:24px;font-family:sans-serif;text-align:center;boxSizing:border-box;';
                              div.innerHTML = `
                                <h1 style="margin:0 0 12px;font-size:20px">LOST DOG</h1>
                                ${data.image_url ? `<img src="${String(data.image_url)}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:0 auto 12px" crossorigin="anonymous" />` : '<div style="height:120px;background:#eee;border-radius:8px;margin-bottom:12px"></div>'}
                                <p style="margin:4px 0;font-size:14px"><strong>${String(data.pet_name || 'Unknown')}</strong> · ${String(data.breed || '')}</p>
                                <p style="margin:4px 0;font-size:12px;color:#555">Last seen: ${String(data.last_seen_address || data.city || '—')}</p>
                                <p style="margin:4px 0;font-size:12px">${String(data.contact_info || '')}</p>
                                ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR" width="100" height="100" style="margin-top:8px" />` : ''}
                              `;
                              document.body.appendChild(div);
                              await new Promise(r => setTimeout(r, 600));
                              const dataUrl = await toPng(div, { backgroundColor: '#ffffff', pixelRatio: 2 });
                              document.body.removeChild(div);
                              const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                              const imgW = 190;
                              const imgH = 240;
                              pdf.addImage(dataUrl, 'PNG', 10, 10, imgW, imgH);
                              pdf.save(`lost-dog-${(data.pet_name || 'flyer').toString().replace(/\s+/g, '-')}.pdf`);
                              toast({ title: 'Flyer downloaded', description: 'PDF saved.' });
                            } catch (e) {
                              toast({ title: 'Download failed', description: (e as Error)?.message || 'Could not generate PDF', variant: 'destructive' });
                            }
                          }}
                        >
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}` : '';
                              const listingUrl = `${baseUrl}/lost-and-found?alert=${detailAlert.id}`;
                              const msg = `🚨 LOST DOG 🚨\n\n${detailAlert.pet_name || 'Unknown'} · ${detailAlert.breed || ''}\nLast seen: ${detailAlert.last_seen_address || detailAlert.city || '—'}\nReward: ${detailAlert.reward_offered ? 'Yes' : 'N/A'}\n\nView details & report sightings:\n${listingUrl}`;
                              await navigator.clipboard.writeText(msg);
                              toast({ title: 'Copied for Nextdoor', description: 'Paste into your Nextdoor post.' });
                            } catch (_e) {
                              toast({ title: 'Copy failed', description: 'Clipboard access denied', variant: 'destructive' });
                            }
                          }}
                        >
                          Copy for Nextdoor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {!user && (
                    <p className="text-xs text-gray-500 mt-1.5">Sign in to use Report sighting</p>
                  )}
                  {/* Search Mode: Start / Join search */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Search Mode</p>
                    {missionData?.mission ? (
                      <p className="text-xs text-gray-600">
                        {missionData.participants?.length ?? 0} people helping.{' '}
                        {user && detailAlert.user_id !== user.id ? (
                          <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => joinMissionMutation.mutate(missionData.mission.id)}>
                            Join search
                          </Button>
                        ) : !user ? (
                          <Button variant="link" className="p-0 h-auto text-blue-600" onClick={goToGreeting}>
                            Join search
                          </Button>
                        ) : null}
                      </p>
                    ) : user && detailAlert.user_id === user.id && detailAlert.alert_type === 'lost' && (
                      <Button variant="outline" size="sm" className="border-gray-300" onClick={() => startMissionMutation.mutate(detailAlert.id)} disabled={startMissionMutation.isPending}>
                        {startMissionMutation.isPending ? 'Starting…' : 'Start search (get help from community)'}
                      </Button>
                    )}
                  </div>
                  {/* Edit listing / Mark as reunited — owner only */}
                  {user && detailAlert.user_id === user.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {detailAlert.status === 'active' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-gray-300 w-full sm:w-auto"
                          onClick={() => openEditAlert(detailAlert)}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          Edit listing
                        </Button>
                      )}
                      {detailAlert.status === 'reunited' ? (
                        <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Reunited
                          {detailAlert.reunited_at && (
                            <span className="text-gray-500 font-normal">
                              {formatDistanceToNow(new Date(detailAlert.reunited_at), { addSuffix: true })}
                            </span>
                          )}
                        </p>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                          onClick={() => markReunitedMutation.mutate(detailAlert.id)}
                          disabled={markReunitedMutation.isPending}
                        >
                          {markReunitedMutation.isPending ? 'Updating…' : 'Mark as reunited'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {/* Sightings heatmap — areas where this dog has been seen */}
                {(() => {
                  const sightedReports = communityReports.filter((r: any) => r.report_type === 'sighted_location');
                  const byPlace = new globalThis.Map<string, { count: number; lat?: number; lng?: number }>();
                  sightedReports.forEach((r: any) => {
                    const key = (r.location_text || 'Unknown location').trim() || 'Unknown location';
                    const prev = byPlace.get(key) || { count: 0 };
                    byPlace.set(key, {
                      count: prev.count + 1,
                      lat: prev.lat ?? (r.latitude != null && r.longitude != null ? Number(r.latitude) : undefined),
                      lng: prev.lng ?? (r.latitude != null && r.longitude != null ? Number(r.longitude) : undefined),
                    });
                  });
                  const hasLastSeen = detailAlert.last_seen_address?.trim() || (detailAlert.latitude != null && detailAlert.longitude != null);
                  const hasSightings = byPlace.size > 0 || hasLastSeen;
                  if (!hasSightings) return null;
                  const lastSeenLat = detailAlert.latitude != null ? Number(detailAlert.latitude) : undefined;
                  const lastSeenLng = detailAlert.longitude != null ? Number(detailAlert.longitude) : undefined;
                  const mapLink = (lat: number, lng: number) => `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;
                  return (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-blue-600" />
                        Sightings heatmap
                      </p>
                      <p className="text-xs text-gray-600 mb-2">Areas where this dog has been seen</p>
                      <ul className="space-y-2">
                        {hasLastSeen && (
                          <li className="flex items-center justify-between gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                            <span className="font-medium text-gray-900">
                              Last seen: {detailAlert.last_seen_address?.trim() || 'Location pinned'}
                            </span>
                            {lastSeenLat != null && lastSeenLng != null && (
                              <a
                                href={mapLink(lastSeenLat, lastSeenLng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium shrink-0"
                              >
                                View on map
                              </a>
                            )}
                          </li>
                        )}
                        {Array.from(byPlace.entries() as Iterable<[string, { count: number; lat?: number; lng?: number }]>).map(
                          ([place, { count, lat, lng }]) => (
                          <li key={place} className="flex items-center justify-between gap-2 text-sm bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="text-gray-900">
                              <strong>{place}</strong>
                              {count > 1 && (
                                <span className="ml-1.5 text-amber-700 font-medium">({count} reports)</span>
                              )}
                            </span>
                            {lat != null && lng != null && (
                              <a
                                href={mapLink(lat, lng)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium shrink-0"
                              >
                                View on map
                              </a>
                            )}
                          </li>
                          ),
                        )}
                      </ul>
            </div>
                  );
                })()}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Community reporting — users nearby can help</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      onClick={() => {
                        if (!user) {
                          goToGreeting();
                          return;
                        }
                        setReportForm({ report_type: 'saw_dog', location_text: '', message: '', source_platform: 'mypup' });
                        setReportDialogOpen(true);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      I Saw This Dog
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      onClick={() => {
                        if (!user) {
                          goToGreeting();
                          return;
                        }
                        setReportForm({ report_type: 'possible_match', location_text: '', message: '', source_platform: 'mypup' });
                        setReportDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Possible Match
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                      onClick={() => {
                        if (!user) {
                          goToGreeting();
                          return;
                        }
                        setReportForm({ report_type: 'sighted_location', location_text: '', message: '', source_platform: 'mypup' });
                        setReportDialogOpen(true);
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      Report Sighted Location
                    </Button>
                  </div>
                  {!user && (
                    <p className="text-xs text-gray-500">Sign in to submit sightings and help the community.</p>
                  )}
                  {user && communityReports.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No community tips yet — report if you saw this dog or a possible match.</p>
                  )}
                  {communityReports.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {communityReports.map((r: any) => (
                        <li key={r.id} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                          {r.report_type === 'sighted_location' && r.location_text && (
                            <>Someone reported seeing this dog near <strong>{r.location_text}</strong>.</>
                          )}
                          {r.report_type === 'sighted_location' && !r.location_text && (
                            <>Someone reported a sighted location.</>
                          )}
                          {r.report_type === 'saw_dog' && (
                            <>Someone reported seeing this dog{r.message ? `: ${r.message}` : '.'}</>
                          )}
                          {r.report_type === 'possible_match' && (
                            <>Possible match reported{r.message ? `: ${r.message}` : '.'}</>
                          )}
                          <span className="text-xs text-gray-500 ml-1">
                            {r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
            </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Matching Tool */}
      <Dialog
        open={aiMatchOpen}
        onOpenChange={(open) => {
          setAiMatchOpen(open);
          if (!open) {
            setAiMatchPhoto(null);
            setAiMatchFile(null);
            setAiMatchResults(null);
            setAiMatchRanking(null);
            setAiMatchError(null);
            aiMatchMutation.reset();
          }
        }}
      >
        <DialogContent
          className="rounded-xl sm:max-w-lg max-h-[90vh] overflow-y-auto w-[calc(100vw-1.5rem)] sm:w-full"
          aria-describedby="ai-match-desc"
          data-testid="lf-ai-match-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2" id="ai-match-title">
              <Sparkles className="w-5 h-5 text-violet-600" aria-hidden />
              AI Match — Find your lost dog
            </DialogTitle>
          </DialogHeader>
          <p id="ai-match-desc" className="text-sm text-gray-600">
            Upload a photo of your lost dog. We compare it to recent lost and found posts and to active dogs listed on Explore (sale or rehoming) so you can spot possible stolen-dog listings.
          </p>
          <div id="ai-match-status" aria-live="polite" aria-atomic="true" className="sr-only">
            {aiMatchMutation.isPending && 'Searching for matching dogs and listings.'}
            {aiMatchError && `Search failed. ${aiMatchError}`}
            {aiMatchResults != null &&
              !aiMatchMutation.isPending &&
              !aiMatchError &&
              (aiMatchResults.length === 0
                ? 'Search finished. No close matches.'
                : `Search finished. ${aiMatchResults.length} possible match${aiMatchResults.length === 1 ? '' : 'es'}.`)}
          </div>
          {aiMatchError && !aiMatchMutation.isPending && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
              role="alert"
            >
              <p className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
                Something went wrong
              </p>
              <p className="mt-1 text-red-800">{aiMatchError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 border-red-200 text-red-900 hover:bg-red-100"
                onClick={() => {
                  setAiMatchError(null);
                  setAiMatchResults(null);
                  setAiMatchRanking(null);
                }}
              >
                Dismiss
              </Button>
            </div>
          )}
          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-2 text-xs text-violet-900 space-y-1">
            <p>
              <strong>Dog face recognition:</strong> When configured (HF_TOKEN), we use CLIP image embeddings and cosine similarity. Otherwise results are ordered by location.
            </p>
            <p className="text-violet-800/90">
              Visual similarity is not proof of identity—same breed or coloring can look alike. Use matches as leads and verify with documentation before making claims.
            </p>
            {user && (
              <p className="text-violet-800/90">
                While signed in, your own lost/found posts and marketplace listings are left out of results. Explore matches need a stronger photo match (server default) so weak listings do not clutter the list.
              </p>
            )}
          </div>

          {!aiMatchResults && !aiMatchMutation.isPending && !aiMatchError && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full min-h-[180px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAiMatchFile}
                />
                {aiMatchPhoto ? (
                  <img
                    src={aiMatchPhoto}
                    alt="Your dog"
                    className="max-h-48 w-full object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Upload photo of your lost dog</span>
                    <span className="text-xs text-gray-500 mt-0.5">PNG, JPG — up to 12 MB</span>
                  </>
                )}
              </label>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                onClick={runAiMatch}
                disabled={!aiMatchPhoto || aiMatchMutation.isPending}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Search for matches
              </Button>
            </div>
          )}

          {aiMatchMutation.isPending && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-600">
              <Loader2 className="w-12 h-12 animate-spin text-violet-600 mb-4" aria-hidden />
              <p className="font-medium">Searching for matches…</p>
              <p className="text-sm mt-1 text-center max-w-xs">
                Comparing your photo can take up to a minute when visual matching is enabled.
              </p>
            </div>
          )}

          {aiMatchResults && !aiMatchMutation.isPending && !aiMatchError && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-gray-900">Results</p>
                {aiMatchRanking === 'visual' && (
                  <span className="text-xs font-medium text-violet-800 bg-violet-100 border border-violet-200 rounded-full px-2.5 py-0.5 w-fit">
                    Ranked by visual similarity
                  </span>
                )}
                {aiMatchRanking === 'proximity' && (
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 w-fit">
                    Distance order — not a visual score
                  </span>
                )}
              </div>
              {aiMatchRanking === 'proximity' && aiMatchResults.length > 0 && (
                <p className="text-xs text-slate-600 -mt-1">
                  Visual matching is unavailable or could not score these posts. Showing nearby lost, found, and marketplace
                  listings so you still have leads to review.
                </p>
              )}
              {aiMatchResults.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {aiMatchRanking === 'empty'
                      ? 'Nothing to compare yet'
                      : 'No close matches right now'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1.5 max-w-sm mx-auto">
                    {aiMatchRanking === 'empty'
                      ? 'There are no active lost, found, or marketplace listings with photos in range. Check back later or widen your area in the feed.'
                      : 'Try a different angle or lighting, widen your feed filters, or check back as new listings are posted.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {aiMatchResults.map((row, i) => {
                    const kind = row.kind ?? (row.listing ? 'listing' : 'alert');
                    const a = row.alert;
                    const l = row.listing;
                    const { matchScore, distanceMiles } = row;
                    const thumb =
                      kind === 'listing'
                        ? l?.image_url || (Array.isArray(l?.images) ? l.images[0] : null)
                        : a?.image_url;
                    const titleLine =
                      kind === 'listing'
                        ? `${l?.dog_name || 'Listed dog'}${l?.breed ? ` – ${l.breed}` : ''}`
                        : `${a?.breed || 'Dog'}${a?.pet_name ? ` – ${a.pet_name}` : ''}`;
                    return (
                      <div
                        key={kind === 'listing' ? `listing-${l?.id ?? i}` : `alert-${a?.id ?? i}`}
                        className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🐕</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">Possible match</p>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {kind === 'listing'
                              ? l?.rehoming
                                ? 'Explore — rehoming listing'
                                : 'Explore — marketplace listing'
                              : a?.alert_type === 'found'
                                ? 'Found listing'
                                : 'Lost listing'}
                          </p>
                          <p className="text-sm text-gray-600">{titleLine}</p>
                          {kind === 'listing' && l?.price != null && (
                            <p className="text-xs text-gray-500">Listed at ${String(l.price)}</p>
                          )}
                          {aiMatchRanking === 'visual' && (
                            <p className="text-xs text-violet-700 font-medium">
                              ~{Math.round(Math.max(0, Math.min(1, matchScore)) * 100)}% visual similarity
                            </p>
                          )}
                          {distanceMiles != null && (
                            <p className="text-xs text-violet-600 font-medium">{distanceMiles} miles away</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Posted{' '}
                            {(kind === 'listing' ? l?.created_at : a?.created_at)
                              ? formatDistanceToNow(new Date(kind === 'listing' ? l.created_at : a.created_at), {
                                  addSuffix: true,
                                })
                              : '—'}
                          </p>
                          {kind === 'listing' && l?.id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 border-gray-300"
                              onClick={() => {
                                navigate(`/listing/${l.id}`);
                                setAiMatchOpen(false);
                              }}
                            >
                              View listing
                            </Button>
                          ) : a ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 border-gray-300"
                              onClick={() => {
                                openDetail(a);
                                setAiMatchOpen(false);
                              }}
                            >
                              View Details
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => {
                  setAiMatchPhoto(null);
                  setAiMatchFile(null);
                  setAiMatchResults(null);
                  setAiMatchRanking(null);
                  setAiMatchError(null);
                }}
              >
                Try another photo
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto Alert subscription dialog */}
      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Alert me when…
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-left text-sm text-gray-600">
            Get a push when a dog matching your criteria is reported found or lost near you.
          </DialogDescription>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-gray-900">Notify me when a dog is</Label>
              <Select
                value={subForm.alert_type}
                onValueChange={(v: 'lost' | 'found') => setSubForm((f) => ({ ...f, alert_type: v }))}
              >
                <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900">Breed (optional)</Label>
              <Select
                value={subForm.breed || 'any'}
                onValueChange={(v) => setSubForm((f) => ({ ...f, breed: v === 'any' ? '' : v }))}
              >
                <SelectTrigger className="border-gray-300"><SelectValue placeholder="Any breed" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any breed</SelectItem>
                  {BREED_OPTIONS.filter((b) => b !== 'Unknown').map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900">Within</Label>
              <Select
                value={String(subForm.radius_miles)}
                onValueChange={(v) => setSubForm((f) => ({ ...f, radius_miles: Number(v) }))}
              >
                <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DISTANCE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} miles</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3">
              <Checkbox
                id="sub-email-digest"
                checked={subForm.email_digest_enabled}
                onCheckedChange={(v) => setSubForm((f) => ({ ...f, email_digest_enabled: v === true }))}
                aria-describedby="sub-email-digest-desc"
              />
              <div className="space-y-0.5 min-w-0">
                <Label htmlFor="sub-email-digest" className="text-sm font-medium text-gray-900 cursor-pointer leading-tight">
                  Also send a weekly email summary
                </Label>
                <p id="sub-email-digest-desc" className="text-xs text-gray-600">
                  When enabled, we&apos;ll email matching alerts in your area (in addition to in-app notifications). You can turn this off anytime.
                </p>
            </div>
            </div>
            {!userCoords && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Allow location access so we can notify you when a match is near you.
            </div>
            )}
            </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-300" onClick={() => setSubscribeOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={createSubscription}
              disabled={!userCoords || createSubMutation.isPending}
            >
              {!userCoords ? 'Allow location first' : createSubMutation.isPending ? 'Creating…' : 'Create alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dog */}
      <Dialog open={myDogsAddOpen} onOpenChange={(open) => { setMyDogsAddOpen(open); if (!open) setMyDogsAddForm({ name: '', breed: '' }); }}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add dog</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-gray-900">Name *</Label>
              <Input
                value={myDogsAddForm.name}
                onChange={(e) => setMyDogsAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Dog name"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-900">Breed (optional)</Label>
              <Input
                value={myDogsAddForm.breed}
                onChange={(e) => setMyDogsAddForm((f) => ({ ...f, breed: e.target.value }))}
                placeholder="Breed"
                className="border-gray-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-300" onClick={() => setMyDogsAddOpen(false)}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!myDogsAddForm.name.trim() || addDogMutation.isPending}
              onClick={() => addDogMutation.mutate({ name: myDogsAddForm.name.trim(), breed: myDogsAddForm.breed.trim() || undefined })}
            >
              {addDogMutation.isPending ? 'Adding…' : 'Add dog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register microchip */}
      <Dialog open={!!microchipDogId} onOpenChange={(open) => { if (!open) { setMicrochipDogId(null); setMicrochipNumber(''); } }}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Register microchip</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-gray-900">Microchip number</Label>
            <Input
              value={microchipNumber}
              onChange={(e) => setMicrochipNumber(e.target.value)}
              placeholder="15-digit microchip number"
              className="border-gray-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-300" onClick={() => { setMicrochipDogId(null); setMicrochipNumber(''); }}>Cancel</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!microchipNumber.trim() || registerMicrochipMutation.isPending}
              onClick={() => microchipDogId && registerMicrochipMutation.mutate({ dogId: microchipDogId, chip_number: microchipNumber.trim() })}
            >
              {registerMicrochipMutation.isPending ? 'Registering…' : 'Register'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
