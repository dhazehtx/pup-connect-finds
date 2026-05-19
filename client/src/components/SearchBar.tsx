import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGlobalSearch,
  searchResultPath,
  type SearchResult,
} from "../hooks/useGlobalSearch";
import { COMPONENTS, buildCardClass } from "../styles/constants";

function resultLabel(result: SearchResult): string {
  if (result.type === "listing") return result.name;
  if (result.type === "service") return result.name;
  return result.full_name || `@${result.username}`;
}

function resultSubtext(result: SearchResult): string {
  if (result.type === "listing") {
    return `$${result.price.toLocaleString()} · ${result.breed}`;
  }
  if (result.type === "service") {
    return `${result.service_type}${result.location ? ` · ${result.location}` : ""}`;
  }
  return `@${result.username}`;
}

function resultThumb(result: SearchResult): string | undefined {
  if (result.type === "listing") return result.image;
  if (result.type === "service") return result.avatar_url;
  return result.avatar_url;
}

export default function SearchBar({
  placeholder = "Search breeders, puppies, services…",
  className = "",
}: {
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { results, loading } = useGlobalSearch(query);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const choose = (result: SearchResult) => {
    navigate(searchResultPath(result));
    setQuery("");
    setHighlightedIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const targetResult =
        highlightedIndex >= 0 ? results[highlightedIndex] : results[0];
      if (targetResult) choose(targetResult);
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

  const isRoundThumb = (result: SearchResult) =>
    result.type === "profile" || result.type === "service";

  return (
    <div role="search" className={`relative w-full ${className}`}>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
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

      {query && (
        <ul
          className={`absolute z-50 mt-1 max-h-80 w-full overflow-y-auto ${buildCardClass("elevated")}`}
        >
          {results.length === 0 ? (
            <li className="p-4 text-sm text-gray-500 text-center">
              {loading ? "Searching..." : "No results found"}
            </li>
          ) : (
            results.map((result, index) => {
              const thumb = resultThumb(result);
              return (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={searchResultPath(result)}
                  onClick={() => {
                    setQuery("");
                    setHighlightedIndex(-1);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer
                  ${index === highlightedIndex ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={resultLabel(result)}
                      className={`h-10 w-10 object-cover flex-shrink-0 ${
                        isRoundThumb(result) ? "rounded-full" : "rounded"
                      }`}
                    />
                  ) : (
                    <div
                      className={`h-10 w-10 bg-gray-200 flex-shrink-0 ${
                        isRoundThumb(result) ? "rounded-full" : "rounded"
                      }`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {resultLabel(result)}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {resultSubtext(result)}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
