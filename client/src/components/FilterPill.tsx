import * as React from "react";

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
};

// MY PUP Filter Pill styles - NO white-on-white issues
const PILL_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm " +
  "h-10 rounded-full px-6 py-2 font-medium transition-all duration-200 border " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const PILL_INACTIVE =
  "filter-chip"; // Uses CSS class from utilities.css with MP theme tokens

const PILL_ACTIVE =
  "btn--primary"; // Uses CSS class from utilities.css with MP theme tokens

export function FilterPill({ label, selected, onClick, icon, className }: Props) {
  const isActive = selected;
  
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE} ${className || ""}`}
    >
      {icon ? <span className="leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}