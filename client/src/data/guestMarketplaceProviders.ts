import type { ServiceProvider } from '@/data/demoProviders';

/** Mirrors `ProvidersSearchFilters` in useProviders (kept separate to avoid circular imports). */
export type GuestMarketplaceFilter = {
  type?: string;
  location?: string;
  breed?: string;
  stud_method?: string;
  max_distance?: string;
  transport_scope?: string;
  min_price?: string;
  max_price?: string;
};

/**
 * Realistic preview listings for guests only (not labeled as samples).
 * Logged-in users always see live API data instead.
 */
export const GUEST_MARKETPLACE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'preview-groom-sf',
    user_id: 'preview-user-groom',
    name: 'Marina Pet Spa',
    headline: 'Full-service grooming and spa for all coat types',
    since: 'Provider since 2022',
    service_type: 'grooming',
    location: 'San Francisco, CA',
    price: 85,
    is_verified: true,
    bio: 'Certified master groomers, breed-specific cuts, nail care, teeth brushing, and a calm salon environment.',
    availability: 'Tue–Sat 8am–6pm',
    user: {
      id: 'preview-user-groom',
      username: 'marinapetspa',
      full_name: 'Marina Pet Spa',
      avatar_url:
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
      verified: true,
    },
  },
  {
    id: 'preview-sit-east',
    user_id: 'preview-user-sit',
    name: 'East Bay In-Home Sitting',
    headline: 'Overnight stays and drop-in visits',
    since: 'Provider since 2021',
    service_type: 'sitting',
    location: 'Oakland, CA',
    price: 55,
    is_verified: true,
    bio: 'Insured sitter with references. Medication administration, updates with photos, and flexible scheduling.',
    availability: '7 days a week',
    user: {
      id: 'preview-user-sit',
      username: 'eastbaysitting',
      full_name: 'East Bay In-Home Sitting',
      avatar_url:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop',
      verified: true,
    },
  },
  {
    id: 'preview-train-pen',
    user_id: 'preview-user-train',
    name: 'Peninsula Obedience',
    headline: 'Positive-reinforcement training & behavior',
    since: 'Provider since 2020',
    service_type: 'training',
    location: 'San Mateo, CA',
    price: 95,
    is_verified: true,
    bio: 'AKC CGC prep, leash reactivity, puppy foundations, and in-home sessions available.',
    availability: 'Weekday evenings & weekends',
    user: {
      id: 'preview-user-train',
      username: 'peninsulaobedience',
      full_name: 'Peninsula Obedience',
      avatar_url:
        'https://images.unsplash.com/photo-1558929996-da64ba858215?w=200&h=200&fit=crop',
      verified: true,
    },
  },
  {
    id: 'preview-stud-golden',
    user_id: 'preview-user-stud',
    name: 'Atlas',
    headline: 'Golden Retriever · health-tested lines',
    since: 'Provider since 2023',
    service_type: 'stud_services',
    location: 'San Jose, CA',
    price: 1200,
    is_verified: true,
    bio: 'OFA hips/elbows clear, full pedigree on request. Experienced with shipped and live arrangements.',
    availability: 'By appointment',
    dog_name: 'Atlas',
    breed: 'Golden Retriever',
    age: '3 years',
    stud_method: 'both',
    images: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600&h=600&fit=crop',
    ],
    user: {
      id: 'preview-user-stud',
      username: 'goldenstudatlas',
      full_name: 'Jordan M.',
      avatar_url:
        'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=200&h=200&fit=crop',
      verified: true,
    },
  },
  {
    id: 'preview-transport-bay',
    user_id: 'preview-user-trans',
    name: 'BayRun Pet Transport',
    headline: 'Climate-controlled long-distance transport',
    since: 'Provider since 2022',
    service_type: 'transportation',
    location: 'Bay Area, CA',
    price: 450,
    is_verified: true,
    bio: 'Door-to-door routing, rest stops every 3–4 hours, GPS updates, and crates sanitized between trips.',
    availability: 'Book 1–2 weeks ahead',
    transport_type: 'long_distance',
    vehicle_type: 'Mercedes Sprinter (climate-controlled)',
    max_distance: '500 miles',
    user: {
      id: 'preview-user-trans',
      username: 'bayruntransport',
      full_name: 'BayRun Pet Transport',
      avatar_url:
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop',
      verified: true,
    },
  },
];

export function filterGuestMarketplaceProviders(
  list: ServiceProvider[],
  filters?: GuestMarketplaceFilter,
  searchTerm?: string
): ServiceProvider[] {
  let out = [...list];

  if (filters?.type) {
    out = out.filter((p) => p.service_type === filters.type);
  }
  if (filters?.location?.trim()) {
    const loc = filters.location.trim().toLowerCase();
    out = out.filter((p) => p.location?.toLowerCase().includes(loc));
  }
  if (filters?.breed?.trim()) {
    const b = filters.breed.trim().toLowerCase();
    out = out.filter(
      (p) =>
        p.breed?.toLowerCase().includes(b) ||
        p.name?.toLowerCase().includes(b) ||
        p.dog_name?.toLowerCase().includes(b)
    );
  }
  if (filters?.stud_method?.trim()) {
    const m = filters.stud_method.trim().toLowerCase();
    out = out.filter((p) => p.stud_method?.toLowerCase() === m);
  }
  if (filters?.max_distance?.trim()) {
    const d = filters.max_distance.trim().toLowerCase();
    out = out.filter((p) => p.max_distance?.toLowerCase().includes(d));
  }
  if (filters?.transport_scope === 'local') {
    out = out.filter((p) => p.transport_type === 'local_pickup');
  } else if (filters?.transport_scope === 'long') {
    out = out.filter(
      (p) => p.transport_type === 'long_distance' || p.transport_type === 'airport'
    );
  }
  if (filters?.min_price) {
    const min = parseFloat(filters.min_price);
    if (!Number.isNaN(min)) out = out.filter((p) => (p.price ?? 0) >= min);
  }
  if (filters?.max_price) {
    const max = parseFloat(filters.max_price);
    if (!Number.isNaN(max)) out = out.filter((p) => (p.price ?? 0) <= max);
  }

  const q = searchTerm?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.headline?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q) ||
        p.service_type?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.breed?.toLowerCase().includes(q) ||
        (p.dog_name && String(p.dog_name).toLowerCase().includes(q)) ||
        (p.max_distance && String(p.max_distance).toLowerCase().includes(q)) ||
        (p.vehicle_type && String(p.vehicle_type).toLowerCase().includes(q))
    );
  }

  return out;
}
