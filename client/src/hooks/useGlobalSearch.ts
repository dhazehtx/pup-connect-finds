import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apiRequest } from "@/lib/api";

export type SearchResult =
  | { type: "listing"; id: string; name: string; breed: string; price: number; image: string; location?: string }
  | { type: "profile"; id: string; username: string; full_name: string; avatar_url: string; verified?: boolean };

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
        const like = `%${query}%`;
        
        const [listResp, profData] = await Promise.all([
          supabase
            .from("dog_listings")
            .select("id, dog_name, breed, price, image_url, description, location")
            .or(`dog_name.ilike.${like}, breed.ilike.${like}, description.ilike.${like}`)
            .eq("status", "active")
            .order('created_at', { ascending: false })
            .limit(8),
          
          apiRequest(`/api/profiles/search?q=${encodeURIComponent(query)}&limit=8`),
        ]);

        const list = listResp.data || [];
        const prof = Array.isArray(profData) ? profData : [];

        const listings: SearchResult[] = list.map((l: any) => ({
          type: "listing" as const,
          id: l.id,
          name: l.dog_name || '',
          breed: l.breed || '',
          price: l.price || 0,
          image: l.image_url || '',
          location: l.location || undefined,
        }));

        const profiles: SearchResult[] = prof.map((p: any) => ({
          type: "profile" as const,
          id: p.id,
          username: p.username || '',
          full_name: p.full_name || p.fullName || '',
          avatar_url: p.avatar_url || p.avatarUrl || '',
          verified: p.verified || false,
        }));

        setResults([...listings, ...profiles]);
      } catch (error) {
        console.error('[GLOBAL SEARCH] Error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}