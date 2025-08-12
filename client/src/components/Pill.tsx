import * as React from "react";

type PillProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  as?: "button" | "a";
  href?: string;
};

export function Pill({
  label,
  selected,
  onClick,
  icon,
  className,
  as = "button",
  href
}: PillProps) {
  const Base = (as === "a" ? "a" : "button") as any;

  const base =
    "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium " +
    "whitespace-nowrap select-none border transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const unselected = "bg-blue-50 text-blue-700 border-blue-600 hover:bg-blue-100";
  const selectedCls = "bg-blue-600 text-white border-blue-600 hover:bg-blue-700";

  return (
    <Base
      data-pill
      href={href}
      aria-pressed={as === "button" ? selected : undefined}
      onClick={onClick}
      className={`${base} ${selected ? selectedCls : unselected} ${className || ""}`}
    >
      {icon ? <span aria-hidden className="leading-none">{icon}</span> : null}
      <span className="leading-none">{label}</span>
    </Base>
  );
}