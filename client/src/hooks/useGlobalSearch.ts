import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult =
  | { type: "listing"; id: string; name: string; breed: string; price: number; image: string; location?: string }
  | { type: "profile"; id: string; username: string; avatar_url: string; full_name?: string };

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { 
      setResults([]);
      setLoading(false);
      return; 
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        console.log('[GLOBAL SEARCH] Searching for:', query);
        
        // Search both listings and profiles in parallel
        const [listResp, profResp] = await Promise.all([
          // Search in dog_listings table first, then fallback to listings
          supabase
            .from("dog_listings")
            .select("id, dog_name, breed, price, image_url, location")
            .or(`dog_name.ilike.%${query}%, breed.ilike.%${query}%, location.ilike.%${query}%`)
            .eq("status", "active")
            .limit(8),
          
          // Search profiles by username and full_name
          supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .or(`username.ilike.%${query}%, full_name.ilike.%${query}%`)
            .limit(6),
        ]);

        console.log('[GLOBAL SEARCH] Listings found:', listResp.data?.length || 0);
        console.log('[GLOBAL SEARCH] Profiles found:', profResp.data?.length || 0);

        // Transform listings data
        const listings: SearchResult[] = (listResp.data ?? []).map(l => ({
          type: "listing" as const,
          id: l.id,
          name: l.dog_name || '',
          breed: l.breed || '',
          price: l.price || 0,
          image: l.image_url || "",
          location: l.location || '',
        }));

        // Transform profiles data
        const profiles: SearchResult[] = (profResp.data ?? []).map(p => ({
          type: "profile" as const,
          id: p.id,
          username: p.username || '',
          avatar_url: p.avatar_url || '',
          full_name: p.full_name || '',
        }));

        // Combine and set results
        const combinedResults = [...listings, ...profiles];
        console.log('[GLOBAL SEARCH] Total results:', combinedResults.length);
        setResults(combinedResults);
      } catch (error) {
        console.error('[GLOBAL SEARCH] Error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [query]);

  return { results, loading };
}