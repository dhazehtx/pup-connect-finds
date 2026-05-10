import React, { useState, useRef, useEffect } from 'react';
import { Heart, Smile, Sparkles, ThumbsUp } from 'lucide-react';

export type ReactionType = 'like' | 'love' | 'care' | 'interested';

const REACTIONS: { type: ReactionType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'like', label: 'Like', Icon: ThumbsUp },
  { type: 'love', label: 'Love', Icon: Heart },
  { type: 'care', label: 'Care', Icon: Smile },
  { type: 'interested', label: 'Interested', Icon: Sparkles },
];

interface ReactionPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (reaction: ReactionType) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  /** Preferred position relative to anchor */
  position?: 'above' | 'below';
}

export function ReactionPicker({ open, onClose, onSelect, anchorRef, position = 'above' }: ReactionPickerProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const pickerHeight = 48;
    const gap = 4;
    if (position === 'above') {
      setCoords({
        left: rect.left + rect.width / 2 - 120,
        top: rect.top - pickerHeight - gap,
      });
    } else {
      setCoords({
        left: rect.left + rect.width / 2 - 120,
        top: rect.bottom + gap,
      });
    }
  }, [open, anchorRef, position]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const t = setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={pickerRef}
      className="fixed z-[100] flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-lg"
      style={{ left: coords.left, top: coords.top }}
      role="listbox"
      aria-label="Choose reaction"
    >
      {REACTIONS.map(({ type, label, Icon }) => (
        <button
          key={type}
          type="button"
          role="option"
          className="flex flex-col items-center rounded-full p-1.5 transition hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => onSelect(type)}
          aria-label={label}
        >
          <Icon className="h-6 w-6 text-gray-700" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}

export { REACTIONS };
