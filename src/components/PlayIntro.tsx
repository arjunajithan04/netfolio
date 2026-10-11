import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { introSlides, profile } from '../data/portfolio';
import { useScrollLock } from '../hooks/smoothScroll';
import { useReducedMotionPref } from '../hooks/useMedia';
import { EASE } from './fx';

const SLIDE_MS = 5000;

type Phase = 'zoom' | 'reel' | 'end';

function playCue(context: AudioContext, step: number) {
  // Tiny, opt-in tonal cue only; no audio is created or played until the viewer enables sound.
  const now = context.currentTime;
  const notes = step === 0 ? [220, 329.63] : step === 3 ? [164.81, 246.94, 329.63] : [196, 293.66];
  notes.forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + i * 0.045);
    gain.gain.exponentialRampToValueAtTime(0.035, now + i * 0.045 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.42);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + i * 0.045);
    oscillator.stop(now + i * 0.045 + 0.45);
  });
}

export default function PlayIntro({ onClose }: { onClose: () => void }) {
  useScrollLock(true);
  const reduced = useReducedMotionPref();
  const [phase, setPhase] = useState<Phase>(reduced ? 'reel' : 'zoom');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const progress = useMotionValue(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (phase !== 'zoom') return;
    const timer = window.setTimeout(() => setPhase('reel'), reduced ? 0 : 1700);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  const goTo = useCallback((target: number) => {
    if (target < 0) return;
    if (target >= introSlides.length) {
      setPhase('end');
      setPaused(false);
      progress.set(1);
      return;
    }
    setIndex(target);
    setPhase('reel');
    setPaused(false);
    progress.set(0);
  }, [progress]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(Math.max(0, index - 1)), [goTo, index]);

  useEffect(() => {
    if (phase !== 'reel' || paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const value = progress.get() + (now - last) / SLIDE_MS;
      last = now;
      if (value >= 1) {
        next();
        return;
      }
      progress.set(value);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, paused, index, next, progress]);

  useEffect(() => {
    if (!soundOn || phase !== 'reel') return;
    const context = audioRef.current;
    if (context && context.state === 'running') playCue(context, index);
  }, [soundOn, phase, index]);

  useEffect(() => () => {
    if (audioRef.current) void audioRef.current.close();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && phase === 'reel') next();
      if (event.key === 'ArrowLeft' && phase === 'reel') prev();
      if (event.key === ' ' && phase === 'reel') {
        event.preventDefault();
        setPaused((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, next, prev, phase]);

  const toggleSound = async () => {
    if (soundOn) {
      setSoundOn(false);
      return;
    }
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const context = audioRef.current ?? new AudioContextClass();
      audioRef.current = context;
      if (context.state === 'suspended') await context.resume();
      setSoundOn(true);
      playCue(context, index);
    } catch {
      setSoundOn(false);
    }
  };

  const replay = () => {
    setIndex(0);
    progress.set(0);
    setPaused(false);
    setPhase(reduced ? 'reel' : 'zoom');
  };
  const slide = introSlides[index];

  return (
    <motion.div
      className="fixed inset-0 z-[130] overflow-hidden bg-black text-bone"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.55 }}
      role="dialog" aria-modal="true" aria-label="Arjun Ajithan cinematic portfolio intro"
    >
      {/* Opening portrait beat */}
      <motion.div
        className="absolute inset-0 flex items-end justify-center"
        initial={false}
        animate={phase === 'zoom' && !reduced ? { scale: [1, 1.08, 2.4], opacity: [0.9, 1, 0] } : { opacity: 0.12, scale: 1.04 }}
        transition={{ duration: reduced ? 0.1 : 1.7, ease: [0.7, 0, 0.2, 1], times: [0, 0.3, 1] }}
        style={{ transformOrigin: '50% 30%' }}
        aria-hidden="true"
      >
        <img src={profile.portrait.src} srcSet={profile.portrait.srcSet} sizes="100vw" alt="" className="h-[88vh] w-auto max-w-none object-contain [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" />
      </motion.div>

      {phase === 'reel' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`backdrop-${index}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: reduced ? 1 : 1.045 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
            transition={{ duration: reduced ? 0.12 : 0.85, ease: EASE }}
            aria-hidden="true"
          >
            <img src={slide.image} alt="" className={`h-full w-full object-cover ${slide.imageFit === 'contain' ? 'object-contain' : ''}`} style={{ objectPosition: slide.position ?? 'center' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/30" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at ${slide.glow ?? '75% 35%'}, ${slide.accent}38 0%, transparent 58%)` }} />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.25),transparent_42%,rgba(0,0,0,0.25))]" />
            {index === 4 && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,245,255,0.16),transparent_42%)]" />
                <div className="absolute inset-x-[12%] bottom-[8%] top-[16%] rounded-[45%] border border-white/[0.12]" />
                <div className="absolute bottom-[8%] left-1/2 top-[16%] w-px -translate-x-1/2 bg-white/[0.10]" />
                <div className="absolute left-1/2 top-1/2 h-[18vw] w-[18vw] max-h-52 max-w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.10]" />
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#123b78]/30 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#7a1535]/35 to-transparent" />
                <motion.div
                  className="absolute -inset-y-1/3 left-0 w-[18%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                  animate={reduced ? undefined : { x: ['-20vw', '120vw'] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(120,10,25,0.22),transparent_70%)]" />

      {/* Seven-part timeline */}
      {phase !== 'zoom' && (
        <div className="absolute inset-x-0 top-0 z-30 flex gap-1.5 px-4 pt-4 sm:px-10 sm:pt-6" aria-label={`Episode ${index + 1} of ${introSlides.length}`}>
          {introSlides.map((item, i) => (
            <button key={item.kicker} type="button" onClick={() => goTo(i)} aria-label={`Go to episode ${i + 1}: ${item.kicker}`} className="h-3 flex-1 overflow-hidden rounded-sm bg-white/15 py-[5px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-crimson-2">
              <motion.div className="h-[3px] origin-left rounded-full bg-crimson-2" style={{ scaleX: i === index && phase === 'reel' ? progress : i < index || phase === 'end' ? 1 : 0 }} />
            </button>
          ))}
        </div>
      )}

      <div className="relative z-10 flex h-full items-center px-6 pb-20 pt-16 sm:px-12 lg:px-[9vw]">
        <AnimatePresence mode="wait">
          {phase === 'reel' && (
            <motion.div
              key={index}
              className="w-full max-w-3xl text-left"
              initial={{ opacity: 0, x: reduced ? 0 : 28, filter: reduced ? 'none' : 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: reduced ? 0 : -18, filter: reduced ? 'none' : 'blur(6px)' }}
              transition={{ duration: reduced ? 0.15 : 0.65, ease: EASE }}
            >
              <p className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.42em] text-crimson-2 sm:text-xs">
                <span className="inline-block h-px w-8 bg-crimson-2" /> Episode {String(index + 1).padStart(2, '0')} <span className="text-bone/45">/ 07</span> · {slide.kicker}
              </p>
              <h2 className="max-w-4xl font-display leading-[0.88] text-bone" style={{ fontSize: 'clamp(3rem, 8.6vw, 8rem)', textWrap: 'balance' }}>
                {slide.title}
              </h2>
              <div className="mt-6 max-w-2xl space-y-2 sm:mt-8">
                {slide.lines.map((line, lineIndex) => (
                  <motion.p key={line} className="text-sm leading-relaxed text-bone/80 sm:text-lg lg:text-xl" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.25 + lineIndex * 0.13, duration: reduced ? 0.15 : 0.55, ease: EASE }}>
                    {line}
                  </motion.p>
                ))}
              </div>
              {slide.chips && (
                <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
                  {slide.chips.map((chip, chipIndex) => (
                    <motion.span key={chip} className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-bone/85 backdrop-blur-md sm:text-xs" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.45 + chipIndex * 0.06 }}>
                      {chip}
                    </motion.span>
                  ))}
                </div>
              )}
              {index === 0 && <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.32em] text-bone/45">Bengaluru, India · The story so far</p>}
              {index === 4 && <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.34em] text-[#c9a6b7]">Blaugrana spirit · Love for the game</p>}
            </motion.div>
          )}
          {phase === 'end' && (
            <motion.div key="end" className="mx-auto w-full max-w-4xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0.15 : 0.9 }}>
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.5em] text-crimson-2 sm:text-xs">The next episode</p>
              <h2 className="font-display leading-[0.9] text-bone" style={{ fontSize: 'clamp(3.5rem, 11vw, 9.5rem)' }}>TO BE CONTINUED<span className="text-crimson-2">.</span></h2>
              <p className="mt-6 text-sm tracking-[0.28em] text-bone/80 sm:text-lg">{profile.displayName.toUpperCase()}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-mist sm:text-xs">MCA Student · AI with Python Intern</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a href={profile.links.github} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-5 py-3 text-xs font-bold tracking-[0.12em] transition hover:border-crimson-2 hover:bg-crimson-2/10">GITHUB ↗</a>
                <a href={profile.links.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-5 py-3 text-xs font-bold tracking-[0.12em] transition hover:border-crimson-2 hover:bg-crimson-2/10">INSTAGRAM ↗</a>
                <a href={profile.links.email} className="rounded-full border border-white/20 px-5 py-3 text-xs font-bold tracking-[0.12em] transition hover:border-crimson-2 hover:bg-crimson-2/10">EMAIL ↗</a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={replay} className="rounded-full bg-bone px-6 py-3 text-xs font-bold tracking-[0.14em] text-ink transition hover:bg-white">↺ REPLAY INTRO</button>
                <button type="button" onClick={onClose} className="rounded-full border border-white/25 px-6 py-3 text-xs font-bold tracking-[0.14em] text-bone transition hover:bg-white/10">EXPLORE PORTFOLIO →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'reel' && (
        <>
          <button type="button" aria-label="Previous episode" onClick={prev} className="absolute inset-y-20 left-0 z-[5] w-[8%] cursor-w-resize focus-visible:outline focus-visible:outline-2 focus-visible:outline-crimson-2" />
          <button type="button" aria-label="Next episode" onClick={next} className="absolute inset-y-20 right-0 z-[5] w-[8%] cursor-e-resize focus-visible:outline focus-visible:outline-2 focus-visible:outline-crimson-2" />
        </>
      )}

      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-7">
        <div className="flex items-center gap-2 sm:gap-3">
          {phase === 'reel' && (
            <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume intro' : 'Pause intro'} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xs text-bone transition hover:bg-white/10">{paused ? '▶' : 'Ⅱ'}</button>
          )}
          <button type="button" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Turn sound off' : 'Enable optional sound'} className={`rounded-full border px-3 py-2.5 text-[9px] font-bold tracking-[0.15em] transition sm:px-4 sm:text-[10px] ${soundOn ? 'border-crimson-2/70 bg-crimson-2/10 text-bone' : 'border-white/20 text-mist hover:text-bone'}`}>{soundOn ? 'SOUND ON' : 'SOUND OFF'}</button>
          <span className="hidden text-[10px] tracking-[0.18em] text-smoke md:block">{phase === 'reel' ? `${String(index + 1).padStart(2, '0')} / 07  ·  SPACE PAUSE  ·  ← → SKIP` : 'ESC TO EXIT'}</span>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-bone px-4 py-2.5 text-[10px] font-bold tracking-[0.14em] text-ink transition hover:bg-white sm:px-5">SKIP INTRO / EXIT</button>
      </div>
    </motion.div>
  );
}
