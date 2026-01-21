// client/src/data/demoProviders.ts
export type ServiceProvider = {
  id: string;
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
