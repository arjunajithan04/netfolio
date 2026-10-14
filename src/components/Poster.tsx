import type { ReactNode } from 'react';
import type { Palette, Project } from '../data/portfolio';

/** Shared gradient backdrop retained for the Journey and Top Picks sections. */
export function PosterBackdrop({ palette, children, className = '' }: { palette: Palette; children?: ReactNode; className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, ${palette.via} 0%, transparent 60%),
          radial-gradient(90% 80% at 0% 100%, ${palette.from} 0%, transparent 70%),
          linear-gradient(160deg, ${palette.from} 0%, ${palette.to} 100%)`,
      }}
    >
      <div aria-hidden="true" className="absolute -right-1/4 -top-1/3 h-[140%] w-[70%] rotate-[18deg] opacity-40 blur-2xl" style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}55, transparent)` }} />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_4px)]" />
      {children}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
    </div>
  );
}

/**
 * Project key art uses locally bundled, project-specific graphics.
 * `card` is a 4:3 crop for Originals tiles; `detail` is a wide 16:9 crop
 * for the expanded project billboard. Text stays in React, never baked into art.
 */
export function ProjectArt({
  project,
  className = '',
  variant = 'card',
}: {
  project: Project;
  className?: string;
  variant?: 'card' | 'detail';
}) {
  const suffix = variant === 'detail' ? 'detail' : 'card';
  return (
    <div className={`absolute inset-0 overflow-hidden bg-ink ${className}`}>
      <img
        src={project.image || `/assets/project-art/${project.id}-${suffix}.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-cine)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)]" />
    </div>
  );
}

/** Small fictional platform mark used in the nav and on cards. */
export function SeriesMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <img src="/logo-ab.png" alt="A" className="h-[1.7em] w-[1.7em] rounded-md object-contain" />
      <span className="font-sans text-[0.62em] font-bold tracking-[0.36em] text-mist">SERIES</span>
    </span>
  );
}
