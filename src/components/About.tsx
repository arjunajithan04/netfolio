import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { education, experience, profile } from '../data/portfolio';
import { useReducedMotionPref } from '../hooks/useMedia';
import { EASE, SectionHeading, Tilt } from './fx';

export default function About() {
  const [footballNoteOpen, setFootballNoteOpen] = useState(false);
  const reducedMotion = useReducedMotionPref();
  const facts = [
    { k: 'Now', v: 'MCA', s: `${education[0].school} · ${education[0].period}` },
    { k: 'Building', v: `${experience[0].role}`, s: experience[0].company },
    { k: 'Working across', v: 'Web + Python', s: 'UI, automation, and data projects' },
    { k: 'Based in', v: profile.location, s: 'India' },
  ];

  return (
    <>
      <SectionHeading kicker="The Pilot" title="About Me" />
      <div className="gutter grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <motion.div
          className="mx-auto w-full max-w-md lg:max-w-none"
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, ease: EASE }}
        >
        <Tilt max={5} className="rounded-2xl">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,#5a0b1b,#14060a_60%,#07070a)]" />
            <div className="absolute inset-0 opacity-50 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_28px)]" />
            <img
              src="/assets/portrait-720.webp"
              srcSet={profile.portrait.srcSet}
              sizes="(max-width: 1024px) 90vw, 40vw"
              alt={profile.portrait.alt}
              loading="lazy"
              className="absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-crimson-2">STARRING</p>
                <p className="font-display text-3xl leading-none text-bone">{profile.displayName}</p>
              </div>
              <span className="rounded border border-white/30 px-1.5 text-[10px] font-bold text-bone">S01–S05</span>
            </div>
          </div>
        </Tilt>
        </motion.div>

        <div>
          <motion.p
            className="font-serif text-[clamp(1.6rem,3.2vw,2.6rem)] italic leading-[1.15] text-bone"
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
          >
            “{profile.intro}”
          </motion.p>
          <p className="mt-4 text-sm text-mist">— {profile.fullName}</p>

          <motion.dl
            className="mt-10 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
          >
            {facts.map((f) => (
              <motion.div
                key={f.k}
                className="bg-ink-2 p-5"
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              >
                <dt className="text-[10px] font-bold uppercase tracking-[0.28em] text-smoke">{f.k}</dt>
                <dd className="mt-2 text-base font-semibold text-bone">{f.v}</dd>
                <dd className="mt-0.5 text-xs text-mist">{f.s}</dd>
              </motion.div>
            ))}
          </motion.dl>

          <div className="mt-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-smoke">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="glass rounded-full px-3 py-1.5 text-xs font-medium text-bone">
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 border-l border-[#7a1535]/80 pl-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-smoke">Beyond the build</p>
            <p className="mt-2 text-sm font-medium text-bone">FC Barcelona at heart. Football, always.</p>
            <button
              type="button"
              aria-expanded={footballNoteOpen}
              aria-controls="football-easter-egg"
              onClick={() => setFootballNoteOpen((open) => !open)}
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-mist transition hover:border-[#7a1535]/80 hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-crimson-2"
            >
              <span aria-hidden="true">⚽</span> {footballNoteOpen ? 'Close the extra' : 'A little extra'}
            </button>
            <AnimatePresence initial={false}>
              {footballNoteOpen && (
                <motion.div
                  id="football-easter-egg"
                  initial={{ opacity: 0, height: 0, y: reducedMotion ? 0 : 5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: reducedMotion ? 0 : 3 }}
                  transition={{ duration: reducedMotion ? 0 : 0.28 }}
                  className="overflow-hidden"
                  role="region"
                  aria-label="Football Easter egg"
                >
                  <div className="relative mt-3 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b10] p-4">
                    <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1/2 bg-[#123b78]/20" />
                    <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 bg-[#7a1535]/20" />
                    <div className="relative">
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#c9a6b7]">A personal match-day note</p>
                      <p className="mt-2 font-display text-2xl leading-none text-bone">MÉS QUE UN CLUB.</p>
                      <p className="mt-2 text-xs leading-relaxed text-mist">For the colours, the craft, the atmosphere — and the love of football itself.</p>
                      <div aria-hidden="true" className="mt-4 h-px w-full bg-gradient-to-r from-[#123b78] via-[#7a1535] to-transparent" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
