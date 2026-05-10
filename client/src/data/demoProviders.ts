// client/src/data/demoProviders.ts
import type { PetServiceProvider } from '@shared/schema';

export type ServiceProvider = {
  id: string;
  user_id?: string;
  name: string;
  headline: string;
  since: string;
  tags?: string[];
  isDemo?: boolean;
  service_type?: string;
  location?: string;
  price?: number;
  is_verified?: boolean;
  bio?: string;
  availability?: string;
  dog_name?: string;
  breed?: string;
  age?: string;
  stud_method?: string;
  images?: string[];
  transport_type?: string;
  vehicle_type?: string;
  max_distance?: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    verified?: boolean;
  };
};

export const DEMO_PROVIDERS: ServiceProvider[] = [
  {
    id: "demo-1",
    name: "Verified Pet Groomer",
    headline: "Professional pet grooming services",
    since: "Provider since 2024",
    tags: ["Grooming"],
    isDemo: true,
    service_type: "grooming",
    location: "San Francisco, CA",
    price: 65,
    is_verified: true,
    bio: "Certified professional groomer specializing in all breeds. Full service grooming, nail trimming, and spa treatments.",
  },
  {
    id: "demo-2",
    name: "Certified Dog Walker",
    headline: "Reliable and caring dog walking",
    since: "Provider since 2023",
    tags: ["Dog Walking"],
    isDemo: true,
    service_type: "walking",
    location: "Los Angeles, CA",
    price: 25,
    is_verified: true,
    bio: "Daily walks, group adventures, and personalized exercise plans for your furry friend.",
  },
  {
    id: "demo-3",
    name: "Trusted Pet Sitter",
    headline: "In-home pet care while you're away",
    since: "Provider since 2024",
    tags: ["Pet Sitting"],
    isDemo: true,
    service_type: "sitting",
    location: "Seattle, WA",
    price: 45,
    is_verified: true,
    bio: "Your pet will feel right at home. Overnight stays and daily check-ins available.",
  },
  {
    id: "demo-4",
    name: "Professional Dog Trainer",
    headline: "Expert obedience and behavior training",
    since: "Provider since 2022",
    tags: ["Training"],
    isDemo: true,
    service_type: "training",
    location: "Austin, TX",
    price: 75,
    is_verified: true,
    bio: "Positive reinforcement training methods. Puppy classes, basic obedience, and advanced skills.",
  },
  {
    id: "demo-5",
    name: "Pet Boarding Specialist",
    headline: "Safe and comfortable overnight stays",
    since: "Provider since 2023",
    tags: ["Boarding"],
    isDemo: true,
    service_type: "boarding",
    location: "Denver, CO",
    price: 55,
    is_verified: true,
    bio: "Spacious accommodations with 24/7 supervision. Your pet's home away from home.",
  },
  {
    id: "demo-6",
    name: "Mobile Grooming Pro",
    headline: "Convenient grooming at your doorstep",
    since: "Provider since 2024",
    tags: ["Mobile Grooming"],
    isDemo: true,
    service_type: "mobile_grooming",
    location: "Miami, FL",
    price: 85,
    is_verified: false,
    bio: "Full-service mobile grooming van. We come to you for stress-free grooming experiences.",
  },
];

/** Card + booking modal expect `PetServiceProvider` + nested `user` (join). Demo/summary rows only have `name` — map them here. */
export type ServiceProviderForUi = PetServiceProvider & {
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    verified?: boolean;
  };
};

export function enrichServiceProviderForUi(p: ServiceProvider): ServiceProviderForUi {
  const fullName = p.name?.trim() || 'Service Provider';
  return {
    id: p.id,
    user_id: p.id,
    service_type: p.service_type ?? 'grooming',
    bio: p.bio ?? p.headline ?? null,
    price: p.price != null ? String(p.price) : null,
    availability: null,
    location: p.location ?? null,
    is_verified: p.is_verified ?? false,
    is_active: true,
    verification_status: 'pending',
    created_at: null,
    updated_at: null,
    user: {
      id: p.id,
      username: 'provider',
      full_name: fullName,
    },
  } as ServiceProviderForUi;
}
