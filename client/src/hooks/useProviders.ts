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

type UseProvidersResult = {
  providers: ServiceProvider[];
  isDemo: boolean;
  isLoading: boolean;
  isError: boolean;
};

export function useProviders(): UseProvidersResult {
  const isSignedIn = useSignedIn();
  const queryClient = useQueryClient();

  // Flip cache when auth status changes so we don't "reuse" demo results
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["providers"] });
  }, [isSignedIn, queryClient]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["providers", isSignedIn ? "live" : "guest"], // cache split
    queryFn: async () => {
      if (!isSignedIn) {
        // Guests see demo only
        return DEMO_PROVIDERS;
      }
      // Signed-in: fetch live only — NO fallback to demo
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('rating', { ascending: false });

      if (error) {
        // Live failed: show "Empty" state, not demo
        return [] as ServiceProvider[];
      }
      
      // Convert Supabase providers to ServiceProvider format
      const convertedProviders: ServiceProvider[] = (data || []).map((p: SupabaseServiceProvider) => ({
        id: p.id,
        name: p.business_name,
        headline: p.description || `Professional ${p.service_types.join(', ')} services`,
        since: `Provider since ${new Date().toLocaleDateString()}`,
        tags: p.service_types,
        isDemo: false, // Explicitly mark live data as non-demo
      }));
      
      // Extra guard: if someone left demo in the DB by mistake, remove it
      return convertedProviders.filter((p) => !p.isDemo);
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 0,
  });

  // Final safety filter: ensure demo never shows for signed-in users
  const providers = (data ?? []).filter((p) => !isSignedIn ? true : !p.isDemo);
  
  return {
    providers,
    isDemo: !isSignedIn,
    isLoading,
    isError,
  };
}