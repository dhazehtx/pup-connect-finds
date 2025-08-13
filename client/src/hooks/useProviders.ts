import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { DEMO_PROVIDERS, ServiceProvider } from "@/data/demoProviders";
import { useSignedIn } from '@/hooks/useSignedIn';

interface SupabaseServiceProvider {
  id: string;
  business_name: string;
  service_types: string[];
  description: string | null;
  location: string;
  pricing: any;
  rating: number | null;
  total_bookings: number | null;
  verified: boolean | null;
  user_id: string;
}

export function useProviders() {
  const isSignedIn = useSignedIn();
  const qc = useQueryClient();

  // Keep auth state in the key so cache never leaks across guest/signed-in
  const { data: liveProviders, isLoading, isError } = useQuery({
    queryKey: ["providers", { authed: isSignedIn }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      
      // Convert Supabase providers to ServiceProvider format
      const convertedProviders: ServiceProvider[] = (data || []).map((p: SupabaseServiceProvider) => ({
        id: p.id,
        name: p.business_name,
        headline: p.description || `Professional ${p.service_types.join(', ')} services`,
        since: `Provider since ${new Date().toLocaleDateString()}`,
        tags: p.service_types
      }));
      
      return convertedProviders;
    },
    enabled: isSignedIn,          // don't fetch live when guest
    staleTime: 0, // Always refetch to ensure fresh data
  });

  // If auth status flips, make sure stale guest/live caches don't linger
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["providers"] });
  }, [isSignedIn, qc]);

  if (!isSignedIn) {
    return { providers: DEMO_PROVIDERS, source: "demo" as const, isLoading: false, isError: false };
  }

  // Signed in: show ONLY live data. If none, show empty state (not demo).
  return {
    providers: liveProviders ?? [],
    source: "live" as const,
    isLoading,
    isError,
  };
}