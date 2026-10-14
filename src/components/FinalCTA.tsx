import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { profile } from '../data/portfolio';
import { useSmoothScroll } from '../hooks/smoothScroll';
import { EASE, Magnetic } from './fx';
import { SeriesMark } from './Poster';
import LivingAtmosphere from './LivingAtmosphere';

export default function FinalCTA({ onReplay }: { onReplay: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  // Keep the title reveal tied to entry, while the artwork follows the full
  // section journey and dissolves into the footer as the visitor reaches the end.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.2'] });
  const { scrollYProgress: sceneProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const spacing = useTransform(scrollYProgress, [0, 1], ['0.38em', '0.015em']);
  const blur = useTransform(scrollYProgress, [0, 1], ['blur(12px)', 'blur(0px)']);
  const opacity = useTransform(scrollYProgress, [0.08, 0.82], [0, 1]);
  const sceneY = useTransform(sceneProgress, [0, 0.45, 1], ['2%', '-1%', '-11%']);
  const sceneScale = useTransform(sceneProgress, [0, 0.55, 1], [1.06, 1.035, 1.12]);
  const sceneOpacity = useTransform(sceneProgress, [0, 0.12, 0.68, 1], [0.5, 1, 0.96, 0.28]);
  const blendOpacity = useTransform(sceneProgress, [0, 0.48, 0.78, 1], [0.12, 0.18, 0.52, 1]);

  const ctas = [
    { label: 'GitHub', href: profile.links.github, symbol: 'GH' },
    { label: 'Instagram', href: profile.links.instagram, symbol: '◎' },
    { label: 'Gmail', href: profile.links.email, symbol: '✉' },
  ];

  return (
    <section id="contact" ref={ref} className="finale-section relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-28 pt-24 text-center sm:px-6">
      <LivingAtmosphere variant="finale" targetRef={ref} />
      {/* Precision-built CSS finale: orbital geometry, restrained grid, and crimson light. */}
      <div className="finale-atmosphere" aria-hidden="true">
        <motion.div
          className="finale-scene-layer"
          style={{ y: sceneY, scale: sceneScale, opacity: sceneOpacity }}
        >
          <div className="finale-technical-grid" />
          <div className="finale-orbit finale-orbit-outer" />
          <div className="finale-orbit finale-orbit-inner" />
          <div className="finale-orbit finale-orbit-tilted" />
          <div className="finale-eclipse-halo" />
          <div className="finale-eclipse">
            <div className="finale-eclipse-corona" />
            <div className="finale-eclipse-core" />
            <div className="finale-eclipse-flare finale-eclipse-flare-one" />
            <div className="finale-eclipse-flare finale-eclipse-flare-two" />
          </div>
          <div className="finale-light-column" />
          <div className="finale-horizon" />
          <div className="finale-starfield" />
          <span className="finale-orbit-node finale-node-top" />
          <span className="finale-orbit-node finale-node-left" />
          <span className="finale-orbit-node finale-node-right" />
          <span className="finale-orbit-node finale-node-bottom" />
          <div className="finale-scanline" />
        </motion.div>
        <motion.div className="finale-scroll-blend" style={{ opacity: blendOpacity }} />
      </div>

      <div className="finale-topline" aria-hidden="true">
        <span><b>NETFOLIO</b><i /> FINAL EPISODE</span>
        <span>A PERSONAL SERIES <i /> STILL IN PROGRESS</span>
      </div>
      <div className="finale-side-label finale-side-left" aria-hidden="true">
        <span>IDEAS</span><span>CODE</span><span>LEARN</span><span>BUILD</span><span>REPEAT</span>
      </div>
      <div className="finale-side-label finale-side-right" aria-hidden="true">
        <span>EP ∞</span><span>END OF SEASON</span><span>NEW CHAPTER AHEAD</span>
      </div>
      <span className="finale-corner finale-corner-tl" aria-hidden="true" />
      <span className="finale-corner finale-corner-tr" aria-hidden="true" />
      <span className="finale-corner finale-corner-bl" aria-hidden="true" />
      <span className="finale-corner finale-corner-br" aria-hidden="true" />

      <div className="finale-content relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
        <motion.p
          className="finale-kicker relative mb-5 text-[10px] font-bold uppercase tracking-[0.48em] text-crimson-2 sm:mb-6 sm:text-xs"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="finale-kicker-rule" /> THE NEXT EPISODE <span className="finale-kicker-rule" />
        </motion.p>

        <motion.h2
          className="finale-title relative font-display leading-[0.84] text-bone"
          style={{ fontSize: 'clamp(3rem, 10.7vw, 10.5rem)', letterSpacing: spacing, filter: blur, opacity }}
        >
          <span>TO BE </span><span className="finale-title-accent">CONTINUED<span className="finale-ellipsis"></span></span>
        </motion.h2>

        <motion.div
          className="relative mt-8 sm:mt-9"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.15 }}
        >
          <p className="finale-name font-sans text-xl font-semibold tracking-[0.2em] text-bone sm:text-2xl md:text-3xl">{profile.displayName.toUpperCase()}</p>
          <p className="mt-2 text-[10px] font-semibold tracking-[0.26em] text-mist sm:text-xs sm:tracking-[0.4em]">{profile.role.toUpperCase()}</p>
        </motion.div>

        <motion.div
          className="relative mt-8 flex w-full flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.25 }}
        >
          {ctas.map((c) => (
            <motion.div key={c.label} variants={{ hidden: { opacity: 0, y: 18, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } } }}>
              <Magnetic>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  data-cursor="link"
                  aria-label={c.label === 'Gmail' ? 'Email Arjun' : `Visit Arjun on ${c.label}`}
                  className="finale-social-link flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-[11px] font-bold tracking-[0.2em] text-bone transition sm:min-w-48 sm:px-7"
                >
                  <span className="finale-social-symbol" aria-hidden="true">{c.symbol}</span>
                  {c.label.toUpperCase()} <span className="finale-social-arrow" aria-hidden="true">↗</span>
                </a>
              </Magnetic>
            </motion.div>
          ))}
        </motion.div>

        <div className="finale-action-divider" aria-hidden="true"><span /></div>
        <motion.div
          className="relative mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[10px] font-semibold tracking-[0.25em] text-smoke sm:gap-x-8 sm:text-[11px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <button type="button" onClick={() => scrollTo(0, { offset: 0 })} className="finale-text-action">
            <span aria-hidden="true">▶</span> WATCH AGAIN
          </button>
          <span className="finale-action-separator" aria-hidden="true" />
          <button type="button" onClick={onReplay} className="finale-text-action">
            <span aria-hidden="true">↻</span> REPLAY OPENING
          </button>
        </motion.div>
      </div>

      <footer className="finale-footer absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(1.15rem,env(safe-area-inset-bottom))] text-center">
        <div className="mb-2 text-base"><SeriesMark /></div>
        <p className="text-[10px] leading-relaxed text-smoke sm:text-[11px]">
          © {new Date().getFullYear()} {profile.displayName}. A personal, streaming-inspired portfolio — not affiliated with any streaming service.
        </p>
      </footer>
    </section>
  );
}
