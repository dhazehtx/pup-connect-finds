export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      Verified
    </span>
  );
}
