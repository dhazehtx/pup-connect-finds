// client/src/data/demoProviders.ts
export type ServiceProvider = {
  id: string;
  name: string;
  headline: string;
  since: string;      // e.g., "Provider since 8/11/2025"
  tags?: string[];    // Grooming, Walking, etc.
};

export const DEMO_PROVIDERS: ServiceProvider[] = [
  {
    id: "demo-1",
    name: "Austin Reyes",
    headline: "Professional grooming services with 10+ years experience",
    since: "Provider since 8/11/2025",
    tags: ["Grooming"],
  },
  {
    id: "demo-2",
    name: "Austin Reyes",
    headline: "Reliable dog walking service for busy pet owners",
    since: "Provider since 8/11/2025",
    tags: ["Dog Walking"],
  },
  {
    id: "demo-3",
    name: "Austin Reyes",
    headline: "In-home pet care while you are away",
    since: "Provider since 8/11/2025",
    tags: ["Dog Sitting"],
  },
];