/**
 * PAWS + single 🐾 — single “stamp” lockup; place inside a `group` for hover wobble (see index.css).
 * Emoji scales to ~110% of the wordmark for a more intentional mark.
 */
export function PawsWordmarkLockup() {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="translate-y-[0.02em]">PAWS</span>
      <span
        className="greeting-paw-emoji inline-block select-none text-[1.1em] leading-none"
        aria-hidden
      >
        🐾
      </span>
    </span>
  );
}
