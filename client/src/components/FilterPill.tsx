import * as React from "react";

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode; // optional emoji or icon
};

export function FilterPill({ label, selected, onClick, icon }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
  const styles = selected
    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
    : "border-blue-500 bg-white text-blue-600 hover:bg-blue-50";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}