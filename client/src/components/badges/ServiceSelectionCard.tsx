import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceSelectionCardProps {
  label: string;
  emoji: string;
  description: string;
  selected: boolean;
  onToggle: (nextSelected: boolean) => void;
  testId?: string;
}

export function ServiceSelectionCard({
  label,
  emoji,
  description,
  selected,
  onToggle,
  testId,
}: ServiceSelectionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      data-testid={testId}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition-all duration-200',
        'hover:shadow-sm hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        selected
          ? 'border-blue-500 bg-blue-50/80 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
          : 'border-slate-200 bg-white hover:border-blue-300',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg leading-none">{emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        </div>
        {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />}
      </div>
    </button>
  );
}
