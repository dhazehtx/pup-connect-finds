import React from 'react';

export function ProfileHeroBanner() {
  return (
    <div
      className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-500 md:h-48"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" />
    </div>
  );
}
