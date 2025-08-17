import * as React from "react";

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
};

// Pill styles (keep these exactly)
const PILL_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm " +
  "h-10 rounded-full px-6 py-2 font-medium transition-all duration-200 border-2 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const PILL_INACTIVE =
  "bg-[#E5EEFF] text-primary-600 border-primary-600 hover:opacity-80";

const PILL_ACTIVE =
  "bg-primary-600 text-white border-primary-600 hover:bg-primary-700";

export function FilterPill({ label, selected, onClick, icon, className }: Props) {
  const isActive = selected;
  
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE} ${className || ""}`}
      style={{ border: "2px solid" }}
    >
      {icon ? <span className="leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}