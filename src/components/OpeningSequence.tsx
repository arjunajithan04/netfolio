import SafeAnimatePresence from "./SafeAnimatePresence";
import { useEffect, useState } from 'react';
import {motion} from "framer-motion";
import { profile } from '../data/portfolio';
import { useReducedMotionPref } from '../hooks/useMedia';
import { EASE, Magnetic } from './fx';

/**
 * Cinematic opening: signal → name → series mark → portrait → role → play.
 * The portrait itself is never filtered or altered; all atmosphere sits behind it.
 */
const TIMELINE = [
  { at: 180, beat: 1 },
  { at: 850, beat: 2 },
  { at: 1450, beat: 3 },
  { at: 2050, beat: 4 },
  { at: 2750, beat: 5 },
  { at: 3350, beat: 6 },
];

const particles = [
  { x: '8%', y: '34%', delay: 0.2, size: 2 },
  { x: '17%', y: '72%', delay: 1.1, size: 3 },
  { x: '29%', y: '22%', delay: 0.7, size: 2 },
  { x: '73%', y: '17%', delay: 1.5, size: 2 },
  { x: '88%', y: '39%', delay: 0.4, size: 3 },
  { x: '81%', y: '76%', delay: 1.8, size: 2 },
  { x: '47%', y: '85%', delay: 0.9, size: 2 },
  { x: '62%', y: '29%', delay: 1.3, size: 2 },
];

export default function OpeningSequence({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotionPref();
  const [beat, setBeat] = useState(reduced ? 6 : 0);

  useEffect(() => {
    if (reduced) return;
    const timers = TIMELINE.map(({ at, beat }) => window.setTimeout(() => setBeat(beat), at));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone();
      if (e.key === 'Enter' && (e.target === document.body || e.target === document.documentElement)) onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[120] isolate overflow-hidden bg-black"
      exit={{ opacity: 0, scale: 1.025, filter: 'blur(8px)' }}
      transition={{ duration: 0.72, ease: EASE }}
      role="dialog"
      aria-label="Opening titles"
      aria-modal="true"
    >
      {/* Deep studio atmosphere: intentionally restrained and always behind the portrait. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0.25 }}
        animate={{ opacity: beat >= 2 ? 1 : 0.35 }}
        transition={{ duration: 1.2, ease: EASE }}
        style={{ background: 'radial-gradient(ellipse 54% 46% at 50% 57%, rgba(103, 7, 25, 0.48) 0%, rgba(48, 5, 15, 0.24) 42%, transparent 75%), linear-gradient(180deg, #030304 0%, #080507 48%, #030304 100%)' }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-[-20%] bottom-[-34%] h-[78vh] rounded-[50%] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at center, rgba(180, 17, 42, 0.22), rgba(70, 5, 17, 0.09) 42%, transparent 72%)' }}
        animate={reduced ? { opacity: 0.65 } : { opacity: [0.3, 0.75, 0.48], scale: [0.98, 1.035, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Fine, slow-moving particles. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-full bg-[#ff5368]"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, boxShadow: '0 0 12px rgba(255, 61, 90, 0.55)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={reduced ? { opacity: 0.25 } : { opacity: [0.08, 0.5, 0.12], y: [8, -14, 8], scale: [0.85, 1.15, 0.9] }}
            transition={{ duration: 5 + (i % 3), delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#ff3d5a]/30 to-transparent"
          initial={{ top: '18%', opacity: 0 }}
          animate={reduced ? { opacity: 0 } : { top: ['18%', '82%'], opacity: [0, 0.65, 0] }}
          transition={{ duration: 4.8, delay: 0.45, repeat: Infinity, repeatDelay: 1.8, ease: 'linear' }}
        />
      </div>

      {/* Letterbox bars release as the title sequence resolves. */}
      <motion.div className="absolute inset-x-0 top-0 z-30 h-[5vh] bg-black" initial={{ y: 0 }} animate={{ y: beat >= 6 ? '-100%' : 0 }} transition={{ duration: 0.85, ease: EASE }} />
      <motion.div className="absolute inset-x-0 bottom-0 z-30 h-[5vh] bg-black" initial={{ y: 0 }} animate={{ y: beat >= 6 ? '100%' : 0 }} transition={{ duration: 0.85, ease: EASE }} />

      <SafeAnimatePresence>
        {beat === 1 && (
          <motion.div key="studio" className="absolute inset-0 z-10 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(5px)' }} transition={{ duration: 0.45 }}>
            <motion.p className="font-sans text-[10px] font-semibold uppercase text-mist sm:text-xs" initial={{ letterSpacing: '0.18em', opacity: 0, y: 8 }} animate={{ letterSpacing: '0.48em', opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: EASE }}>
              {profile.originalLabel}
            </motion.p>
          </motion.div>
        )}
      </SafeAnimatePresence>

      {/* Red separation glow behind the original portrait, not an image filter. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-5%] z-[2] mx-auto h-[54vh] max-w-[760px] rounded-[50%] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(130, 10, 29, 0.34), rgba(69, 7, 20, 0.12) 45%, transparent 72%)' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={beat >= 4 ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.25, ease: EASE }}
      />

      {/* The character image stays untouched. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-[3] mx-auto flex h-[66vh] max-h-[760px] min-h-[360px] max-w-[900px] items-end justify-center sm:h-[70vh]"
        initial={{ opacity: 0, scale: 1.055, y: 18, filter: 'blur(12px)' }}
        animate={beat >= 4 ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1.25, ease: EASE }}
      >
        <img
          src={profile.portrait.src}
          srcSet={profile.portrait.srcSet}
          sizes="(max-width: 768px) 100vw, 900px"
          alt={profile.portrait.alt}
          className="h-full w-auto max-w-none object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_58%,transparent_99%)]"
          draggable={false}
        />
      </motion.div>

      {/* Filmic vignette keeps the edges quiet and text readable. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(ellipse_72%_68%_at_50%_42%,transparent_35%,rgba(0,0,0,0.48)_78%,#000_120%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[35vh] bg-gradient-to-t from-black via-black/55 to-transparent" />

      {/* Title reveals first, then lifts to create room for the portrait. */}
      <div className="absolute inset-0 z-10 flex flex-col items-center px-4 pt-[12vh] text-center sm:pt-[10vh]">
        <motion.h1
          className="max-w-full font-display leading-[0.82] text-bone drop-shadow-[0_8px_40px_rgba(0,0,0,0.8)]"
          style={{ fontSize: 'clamp(2.7rem, 11.8vw, 10.5rem)' }}
          initial={{ opacity: 0, scale: 1.07, filter: 'blur(16px)', letterSpacing: '0.18em', y: 18 }}
          animate={beat >= 2 ? { opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '0.025em', y: beat >= 4 ? '-1.5vh' : 0 } : {}}
          transition={{ duration: 1.05, ease: EASE }}
        >
          {profile.firstName}
        </motion.h1>
        <motion.p
          className="mt-3 font-sans text-[10px] font-bold text-crimson-2 [text-shadow:0_2px_20px_rgba(0,0,0,0.9)] sm:mt-4 sm:text-sm"
          initial={{ opacity: 0, letterSpacing: '0.95em', y: 8 }}
          animate={beat >= 3 ? { opacity: 1, letterSpacing: '0.62em', y: beat >= 4 ? '-1.5vh' : 0 } : {}}
          transition={{ duration: 0.85, ease: EASE }}
        >
          {profile.seriesTag}
        </motion.p>
        <motion.div
          aria-hidden
          className="mt-5 h-px w-16 bg-gradient-to-r from-transparent via-crimson-2/75 to-transparent sm:mt-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={beat >= 3 ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </div>

      {/* Role and primary action. The button remains available immediately for reduced motion. */}
      <div className="absolute inset-x-0 bottom-[8vh] z-20 flex flex-col items-center gap-5 px-5 text-center sm:bottom-[8.5vh] sm:gap-6">
        <motion.p
          className="max-w-5xl font-sans text-[9px] font-semibold uppercase leading-relaxed tracking-[0.18em] text-bone/85 sm:text-xs sm:tracking-[0.32em] md:text-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={beat >= 5 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: EASE }}
        >
          {profile.tagline.join('  •  ')}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12, scale: 0.94 }} animate={beat >= 6 ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 0.65, ease: EASE }}>
          <Magnetic>
            <button
              type="button"
              data-cursor="play"
              onClick={onDone}
              tabIndex={beat >= 6 ? 0 : -1}
              className="group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-full bg-bone px-9 py-3.5 font-sans text-sm font-bold tracking-[0.12em] text-ink shadow-[0_0_42px_rgba(229,19,43,0.24)] transition-[background,box-shadow,transform] duration-300 hover:bg-white hover:shadow-[0_0_58px_rgba(229,19,43,0.42)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson-2 sm:px-10 sm:py-4 sm:text-base"
            >
              <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative text-lg transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-110">▶</span>
              <span className="relative">PLAY</span>
            </button>
          </Magnetic>
        </motion.div>
      </div>

      <button
        type="button"
        onClick={onDone}
        className="absolute right-4 top-[calc(5vh+12px)] z-40 rounded-full border border-white/15 bg-black/20 px-3.5 py-2 font-sans text-[10px] font-semibold tracking-[0.18em] text-mist backdrop-blur-sm transition hover:border-white/45 hover:text-bone sm:right-6 sm:px-4 sm:text-[11px]"
      >
        SKIP INTRO
      </button>
    </motion.div>
  );
}
