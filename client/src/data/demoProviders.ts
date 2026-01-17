// client/src/data/demoProviders.ts
export type ServiceProvider = {
  id: string;
  name: string;
  headline: string;
  since: string;      // e.g., "Provider since 8/11/2025"
  tags?: string[];    // Grooming, Walking, etc.
  isDemo?: boolean;   // Flag to identify demo providers
  service_type?: string;
  location?: string;
  price?: number;
  is_verified?: boolean;
  avatar_url?: string;
  bio?: string;
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
    name: "Sarah Mitchell",
    headline: "Professional grooming services with 10+ years experience",
    since: "Provider since 2024",
    tags: ["Grooming"],
    isDemo: true,
    service_type: "grooming",
    location: "San Francisco, CA",
    price: 65,
    is_verified: true,
    bio: "Certified professional groomer specializing in all breeds. I treat every pup like family!",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    user: {
      id: "demo-user-1",
      username: "sarah_grooms",
      full_name: "Sarah Mitchell",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      verified: true,
    },
  },
  {
    id: "demo-2",
    name: "Marcus Johnson",
    headline: "Reliable dog walking service for busy pet owners",
    since: "Provider since 2023",
    tags: ["Dog Walking"],
    isDemo: true,
    service_type: "walking",
    location: "Los Angeles, CA",
    price: 25,
    is_verified: true,
    bio: "Daily walks, group adventures, and personalized exercise plans for your furry friend.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    user: {
      id: "demo-user-2",
      username: "marcus_walks",
      full_name: "Marcus Johnson",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      verified: true,
    },
  },
  {
    id: "demo-3",
    name: "Emily Chen",
    headline: "In-home pet care while you are away",
    since: "Provider since 2024",
    tags: ["Dog Sitting"],
    isDemo: true,
    service_type: "sitting",
    location: "Seattle, WA",
    price: 45,
    is_verified: true,
    bio: "Your pet will feel right at home with me. Overnight stays and daily check-ins available.",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    user: {
      id: "demo-user-3",
      username: "emily_petsitter",
      full_name: "Emily Chen",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      verified: true,
    },
  },
];