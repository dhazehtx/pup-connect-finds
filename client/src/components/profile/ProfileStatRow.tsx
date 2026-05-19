import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
  posts: number;
  followers: number;
  following: number;
  className?: string;
  onPostsClick?: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
};

function StatButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50 md:text-xl">
        {value}
      </span>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {inner}
      </button>
    );
  }

  return <div className="flex flex-col items-center gap-0.5 px-2 py-1">{inner}</div>;
}

export function ProfileStatRow({
  posts,
  followers,
  following,
  className,
  onPostsClick,
  onFollowersClick,
  onFollowingClick,
}: Props) {
  return (
    <div className={cn('flex items-end justify-around gap-2 sm:justify-start sm:gap-6', className)}>
      <StatButton label="Posts" value={posts} onClick={onPostsClick} />
      <StatButton label="Followers" value={followers} onClick={onFollowersClick} />
      <StatButton label="Following" value={following} onClick={onFollowingClick} />
    </div>
  );
}
