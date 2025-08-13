import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { DEMO_PROVIDERS, ServiceProvider } from "@/data/demoProviders";
import { useSignedIn } from '@/hooks/useSignedIn';

interface SupabaseServiceProvider {
  id: string;
  user_id: string;
  service_type: string;
  bio: string | null;
  price: number | null;
  availability: string | null;
  location: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
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
        .from('pet_service_providers' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // Live failed: show "Empty" state, not demo
        return [] as ServiceProvider[];
      }
      
      // Convert Supabase providers to ServiceProvider format
      const convertedProviders: ServiceProvider[] = ((data as SupabaseServiceProvider[]) || []).map((p: SupabaseServiceProvider) => ({
        id: p.id,
        name: `${p.service_type} Provider`, // Use service type as name since we don't have business name
        headline: p.bio || `Professional ${p.service_type} services`,
        since: `Provider since ${new Date(p.created_at).toLocaleDateString()}`,
        tags: [p.service_type],
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