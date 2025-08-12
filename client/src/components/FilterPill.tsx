import * as React from "react";

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
};

export function FilterPill({ label, selected, onClick, icon, className }: Props) {
  const INACTIVE_CLASSES = "inline-flex items-center justify-center gap-2 h-10 rounded-full px-6 py-2 text-sm font-medium border-2 transition-colors bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  const ACTIVE_CLASSES = "inline-flex items-center justify-center gap-2 h-10 rounded-full px-6 py-2 text-sm font-medium border-2 transition-colors bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${selected ? ACTIVE_CLASSES : INACTIVE_CLASSES} ${className || ""}`}
    >
      {icon ? <span className="leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </button>
  );
}