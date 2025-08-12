import * as React from "react";

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
};

export function FilterPill({ label, selected, onClick, icon, className }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium " +
    "transition-colors select-none border " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const unselected =
    "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100 active:bg-blue-200";

  const selectedCls =
    "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${base} ${selected ? selectedCls : unselected} ${className || ""}`}
    >
      {icon ? <span className="leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}