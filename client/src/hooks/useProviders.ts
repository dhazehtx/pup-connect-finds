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
      
      // Signed-in users: fetch only live data from Supabase
      const { data: providers, error } = await supabase
        .from('pet_service_providers' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching service providers:', error);
        // Return empty array for signed-in users when there's a database error
        // This will show the proper empty state instead of demo data
        return [];
      }
      
      // Convert Supabase providers to ServiceProvider format
      const convertedProviders: ServiceProvider[] = (providers || []).map((p: any) => ({
        id: p.id,
        name: `${p.service_type} Provider`,
        headline: p.bio || `Professional ${p.service_type} services`,
        since: `Provider since ${new Date(p.created_at).toLocaleDateString()}`,
        tags: [p.service_type],
        isDemo: false, // Always false for live data
        service_type: p.service_type,
        location: p.location || undefined,
        price: p.price || undefined,
        is_verified: p.is_verified || false,
      }));
      
      return convertedProviders;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
  });

  return {
    providers: data || [],
    isDemo: !isSignedIn,
    isLoading,
    isError,
  };
}