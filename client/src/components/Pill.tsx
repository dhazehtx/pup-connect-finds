import * as React from "react";

type PillProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
};

export default function Pill({
  label,
  selected,
  onClick,
  icon,
  className = "",
}: PillProps) {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap " +
    "h-10 rounded-full px-6 py-2 text-sm font-medium border-2 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  const unselected = "bg-white text-blue-700 border-blue-600 hover:bg-blue-50";
  const active = "bg-blue-600 text-white border-blue-600 hover:bg-blue-700";

  return (
    <button
      type="button"
      data-pill
      onClick={onClick}
      className={`${base} ${selected ? active : unselected} ${className}`}
    >
      {icon ? <span aria-hidden className="leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}