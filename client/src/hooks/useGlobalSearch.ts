import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export type SearchResult =
  | { type: "listing"; id: string; name: string; breed: string; price: number; image: string; location?: string }
  | { type: "profile"; id: string; username: string; full_name: string; avatar_url: string; verified?: boolean }
  | { type: "service"; id: string; user_id: string; name: string; service_type: string; location?: string; avatar_url?: string };

type ApiSearchResult =
  | { type: "profile"; id: string; username: string; full_name: string; avatar_url: string; verified?: boolean }
  | { type: "listing"; id: string; name: string; breed: string; price: number; image: string; location?: string }
  | { type: "service"; id: string; user_id: string; name: string; service_type: string; location?: string; avatar_url?: string };

export function searchResultPath(result: SearchResult): string {
  if (result.type === "profile") {
    return result.username ? `/profile/${result.id}` : `/profile/${result.id}`;
  }
  if (result.type === "listing") {
    return `/listing/${result.id}`;
  }
  return `/services/provider/${result.id}`;
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = (await apiRequest(
          `/api/search?q=${encodeURIComponent(q)}&limit=12`,
        )) as { results?: ApiSearchResult[] };

        const mapped: SearchResult[] = (data.results || []).map((r) => {
          if (r.type === "profile") {
            return {
              type: "profile" as const,
              id: r.id,
              username: r.username || "",
              full_name: r.full_name || "",
              avatar_url: r.avatar_url || "",
              verified: r.verified,
            };
          }
          if (r.type === "listing") {
            return {
              type: "listing" as const,
              id: r.id,
              name: r.name,
              breed: r.breed,
              price: r.price,
              image: r.image,
              location: r.location,
            };
          }
          return {
            type: "service" as const,
            id: r.id,
            user_id: r.user_id,
            name: r.name,
            service_type: r.service_type,
            location: r.location,
            avatar_url: r.avatar_url,
          };
        });

        console.log("[PROOF:SEARCH] client results", JSON.stringify({ query: q, count: mapped.length }));
        setResults(mapped);
      } catch (error) {
        console.error("[PROOF:SEARCH] client error", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}
