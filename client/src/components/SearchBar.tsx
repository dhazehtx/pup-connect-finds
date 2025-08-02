import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { Search } from "lucide-react";
import { COMPONENTS, buildCardClass } from "../styles/constants";

export default function SearchBar({ placeholder = "Search breeders, puppies, shelters…", className = "" }: { placeholder?: string; className?: string }) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { results, loading } = useGlobalSearch(query);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const choose = (result: typeof results[number]) => {
    console.log('[SEARCH BAR] Result selected:', result);
    setLocation(result.type === "listing" ? `/listing/${result.id}` : `/profile/${result.id}`);
    setQuery(""); 
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0); // retain focus
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // Instagram-style behavior: Enter selects highlighted result or first result if none highlighted
      const targetResult = highlightedIndex >= 0 ? results[highlightedIndex] : results[0];
      if (targetResult) {
        choose(targetResult);
      }
    }
    if (e.key === "Escape") {
      setQuery("");
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <form onSubmit={e => e.preventDefault()} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${COMPONENTS.INPUT_BASE} pl-10 pr-4 w-full`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Enhanced suggestions dropdown */}
      {query && (
        <ul className={`absolute z-50 mt-1 max-h-80 w-full overflow-y-auto ${buildCardClass('elevated')}`}>
          {results.length === 0 ? (
            <li className="p-4 text-sm text-gray-500 text-center">
              {loading ? "Searching..." : "No results found"}
            </li>
          ) : (
            results.map((result, index) => (
              <li
                key={result.id}
                onMouseDown={() => choose(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-200 border-b border-gray-100 last:border-b-0
                  ${index === highlightedIndex ? "bg-primary-50" : "hover:bg-gray-50"}`}
              >
                {result.thumb ? (
                  <img
                    src={result.thumb}
                    alt={result.title}
                    className={`h-10 w-10 object-cover ${
                      result.type === "profile" ? "rounded-full" : "rounded"
                    } flex-shrink-0`}
                  />
                ) : (
                  <div className={`h-10 w-10 bg-gray-200 flex-shrink-0 ${
                    result.type === "profile" ? "rounded-full" : "rounded"
                  }`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{result.title}</p>
                  <p className="truncate text-xs text-gray-500">{result.sub}</p>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}