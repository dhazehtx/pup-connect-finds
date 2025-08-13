import { Filter } from "lucide-react";

type Props = {
  onClick?: () => void;
  active?: boolean;
  count?: number;
  className?: string;
};

export default function FilterPill({ onClick, active, count, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // base pill
        "inline-flex items-center gap-2 rounded-full border px-5 py-2",
        "text-sm font-medium shadow-sm transition-colors",
        // inactive = Store look
        !active
          ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          // active = brand filled
          : "bg-[#2363FF] text-white border-[#2363FF] hover:bg-[#1E55D6]",
        className || ""
      ].join(" ")}
    >
      <Filter className={active ? "h-4 w-4 opacity-90" : "h-4 w-4 text-slate-500"} />
      <span>Filter{count ? ` (${count})` : ""}</span>
    </button>
  );
}