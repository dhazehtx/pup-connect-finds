/** Cool = cyan-leaning blue; warm = indigo-leaning — matches greeting page ambience */
type AmbientChroma = 'cool' | 'warm';

const PUPPY_AMBIENT_TILES: { src: string; className: string; chroma: AmbientChroma }[] = [
  {
    src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=320&q=70&auto=format&fit=crop',
    className: 'left-[-12%] top-[6%] h-28 w-28 rotate-6 sm:left-[-4%] sm:h-32 sm:w-32',
    chroma: 'cool',
  },
  {
    src: 'https://images.unsplash.com/photo-1530281700549-e82e7bf080d6?w=320&q=70&auto=format&fit=crop',
    className: 'right-[-10%] top-[10%] h-32 w-32 -rotate-3 sm:right-[-2%] sm:h-36 sm:w-36',
    chroma: 'warm',
  },
  {
    src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=320&q=70&auto=format&fit=crop',
    className: 'bottom-[38%] left-[-8%] h-24 w-24 -rotate-6 sm:bottom-[32%] sm:h-28 sm:w-28',
    chroma: 'cool',
  },
  {
    src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=320&q=70&auto=format&fit=crop',
    className: 'bottom-[36%] right-[-6%] h-28 w-28 rotate-3 sm:h-32 sm:w-32',
    chroma: 'warm',
  },
  {
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=320&q=70&auto=format&fit=crop',
    className: 'left-[4%] top-[42%] hidden h-20 w-20 rotate-12 opacity-80 sm:block',
    chroma: 'cool',
  },
  {
    src: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=320&q=70&auto=format&fit=crop',
    className: 'right-[2%] top-[48%] hidden h-20 w-20 -rotate-12 opacity-80 sm:block',
    chroma: 'warm',
  },
];

const shell = (chroma: AmbientChroma) =>
  chroma === 'cool'
    ? 'bg-sky-400/10 ring-1 ring-sky-300/25 shadow-lg shadow-sky-500/10'
    : 'bg-indigo-400/10 ring-1 ring-indigo-300/20 shadow-lg shadow-indigo-500/10';

const wash = (chroma: AmbientChroma) =>
  chroma === 'cool'
    ? 'bg-gradient-to-br from-sky-400/20 via-blue-400/10 to-blue-500/5'
    : 'bg-gradient-to-bl from-indigo-400/18 via-blue-500/12 to-blue-600/10';

/** Blurred puppy tiles + chromatic wash — use inside a `relative overflow-hidden` container */
export function ChromaticAmbience() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {PUPPY_AMBIENT_TILES.map((tile, i) => (
        <div
          key={i}
          className={`absolute overflow-hidden rounded-3xl ${shell(tile.chroma)} ${tile.className}`}
        >
          <div className={`pointer-events-none absolute inset-0 z-[1] rounded-3xl ${wash(tile.chroma)}`} />
          <img
            src={tile.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="relative z-0 h-full w-full scale-110 rounded-3xl object-cover blur-2xl opacity-50 saturate-110"
          />
        </div>
      ))}
    </div>
  );
}
