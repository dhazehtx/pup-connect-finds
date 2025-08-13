import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SegmentedTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  children: React.ReactNode;
}

export const SegmentedTab = ({ active, children, className, ...props }: SegmentedTabProps) => (
  <button
    {...props}
    className={clsx(
      "px-4 h-9 rounded-full border text-sm font-medium transition-all duration-200",
      active
        ? "bg-primary text-white border-primary shadow-sm"
        : "bg-white text-primary border-primary hover:bg-primary/10",
      className
    )}
  >
    {children}
  </button>
);