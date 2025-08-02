import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult =
  | { type: "listing"; id: string; title: string; sub: string; thumb: string }
  | { type: "profile"; id: string; title: string; sub: string; thumb: string };

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
        const like = `%${query}%`;
        
        // Enhanced search covering all relevant columns
        const [listResp, profResp] = await Promise.all([
          // Search dog_listings: name, breed, and description
          supabase
            .from("dog_listings")
            .select("id, dog_name, breed, price, image_url, description")
            .or(`dog_name.ilike.${like}, breed.ilike.${like}, description.ilike.${like}`)
            .eq("status", "active")
            .order('created_at', { ascending: false })
            .limit(8),
          
          // Search profiles: username and full_name for comprehensive results
          supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .or(`username.ilike.${like}, full_name.ilike.${like}`)
            .order('created_at', { ascending: false })
            .limit(8),
        ]);

        console.log('[GLOBAL SEARCH] Listings found:', listResp.data?.length || 0);
        console.log('[GLOBAL SEARCH] Profiles found:', profResp.data?.length || 0);

        // Transform listings data to match SearchResult interface
        const listings: SearchResult[] = (listResp.data ?? []).map(l => ({
          type: "listing" as const,
          id: l.id,
          title: l.dog_name || '',
          sub: `$${(l.price || 0).toLocaleString()} · ${l.breed || ''}`,
          thumb: l.image_url || "",
        }));

        // Transform profiles data with enhanced display logic
        const profiles: SearchResult[] = (profResp.data ?? []).map(p => ({
          type: "profile" as const,
          id: p.id,
          title: p.full_name ? p.full_name : `@${p.username || ''}`,
          sub: p.username ? `@${p.username}` : "User Profile",
          thumb: p.avatar_url || "",
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
    }, 250); // reduced debounce for snappier feel

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}