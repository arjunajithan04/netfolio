import { useState } from 'react';
import { motion } from 'framer-motion';
import { achievements, certifications } from '../data/portfolio';
import { EASE, SectionHeading, Tilt } from './fx';

function Laurel({ side }: { side: 'l' | 'r' }) {
  return (
    <svg viewBox="0 0 30 64" className={`h-14 w-auto text-[#d9b46a] ${side === 'r' ? '-scale-x-100' : ''}`} aria-hidden>
      <path d="M26 62C10 52 4 36 8 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {[10, 18, 26, 34, 42, 50].map((y, i) => (
        <ellipse key={y} cx={i < 2 ? 9 : 8 + i * 1.6} cy={y} rx="5" ry="2.2" fill="currentColor" opacity="0.85" transform={`rotate(-40 ${8 + i * 1.6} ${y})`} />
      ))}
    </svg>
  );
}

export default function Achievements() {
  const [selectedCertificate, setSelectedCertificate] = useState<(typeof certifications)[number] | null>(null);

  return (
    <>
      <SectionHeading kicker="Awards season" title="Top Moments" />

      <div className="gutter grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 [perspective:1400px]">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 50, rotateX: 18 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
          >
            <Tilt max={8} className="group h-full rounded-2xl">
              <article className="relative flex h-full min-h-[340px] flex-col items-center overflow-hidden rounded-2xl bg-[radial-gradient(120%_80%_at_50%_0%,#2a1f10,#0d0b08_60%,#07070a)] px-5 pb-6 pt-8 text-center ring-1 ring-[#d9b46a]/20 transition duration-500 group-hover:ring-[#d9b46a]/60">
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b46a]/70 to-transparent" />
                <div aria-hidden className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#d9b46a]/10 blur-3xl transition duration-700 group-hover:bg-[#d9b46a]/25" />
                <div className="relative flex items-center gap-1">
                  <Laurel side="l" />
                  <div className="px-1">
                    <p className="text-[9px] font-bold uppercase leading-tight tracking-[0.24em] text-[#d9b46a]">{a.laurel}</p>
                  </div>
                  <Laurel side="r" />
                </div>
                <h3 className="relative mt-6 font-display text-[2.1rem] leading-[0.92] tracking-wide text-bone">{a.title}</h3>
                <p className="relative mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b46a]">{a.org}</p>
                <p className="relative mt-4 text-[13px] leading-relaxed text-bone/70">{a.detail}</p>
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="relative mt-auto inline-flex min-h-10 items-center gap-1 pt-5 text-xs font-semibold tracking-wide text-bone underline decoration-[#d9b46a]/60 underline-offset-4 hover:decoration-[#d9b46a]"
                  >
                    View certificate ↗
                  </a>
                )}
              </article>
            </Tilt>
          </motion.div>
        ))}
      </div>

      {/* Credentials — editorial milestone grid */}
      <section className="mt-20" aria-labelledby="credentials-heading">
        <div className="gutter mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-crimson-2">The credentials</p>
            <h3 id="credentials-heading" className="font-display text-4xl leading-none tracking-wide text-bone sm:text-5xl">Proof of progress.</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
              A growing foundation in cloud engineering, human behaviour, and agile delivery.
            </p>
          </div>
          <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">{String(certifications.length).padStart(2, '0')} milestones</p>
        </div>

        <div className="gutter grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c, i) => {
            const date = c.name.match(/\((Jan|May|Mar) (202[0-9])\)/);
            return (
              <motion.article key={c.name} className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-xl bg-gradient-to-br from-ink-2 via-[#101014] to-[#0b0b0e] p-5 ring-1 ring-white/10 transition duration-500 hover:-translate-y-1 hover:ring-crimson-2/35 hover:shadow-[0_18px_55px_rgba(229,19,43,0.07)]"
                initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}>
                <div aria-hidden className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-crimson-2/50 to-transparent opacity-70 transition duration-500 group-hover:via-crimson-2" />
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-crimson-2/15 bg-crimson/5 text-lg text-crimson-2" aria-hidden>
                    {i === 0 ? '⌘' : i === 1 ? '◉' : '↗'}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-smoke">Credential {String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-crimson-2">{c.issuer}</p>
                  <h4 className="mt-3 text-base font-semibold leading-snug text-bone sm:text-lg">{c.name.replace(/ \((Jan|May|Mar) 202[0-9]\)/, '')}</h4>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4 mt-6">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-smoke">{date ? `${date[1]} ${date[2]}` : 'Completed'}</span>
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer" data-cursor="link"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-crimson-2/35 bg-crimson/10 px-3 py-2 text-xs font-semibold text-bone transition hover:border-crimson-2 hover:bg-crimson/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson-2">
                      View certificate <span aria-hidden>↗</span>
                    </a>
                  ) : (
                    <button type="button" onClick={() => setSelectedCertificate(c)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-crimson-2/35 bg-crimson/10 px-3 py-2 text-xs font-semibold text-bone transition hover:border-crimson-2 hover:bg-crimson/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson-2">
                      View certificate <span aria-hidden>↗</span>
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        {selectedCertificate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCertificate(null); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="certificate-dialog-title" className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#101014] p-6 shadow-2xl sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-crimson-2">Certificate viewer</p>
                  <h4 id="certificate-dialog-title" className="mt-2 font-display text-2xl text-bone">{selectedCertificate.issuer}</h4>
                </div>
                <button type="button" onClick={() => setSelectedCertificate(null)} aria-label="Close certificate viewer" className="rounded-md px-3 py-2 text-sm text-mist transition hover:bg-white/5 hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-crimson-2">✕</button>
              </div>
              <p className="text-sm leading-relaxed text-mist">{selectedCertificate.name.replace(/ \((Jan|May|Mar) 202[0-9]\)/, '')}</p>
              <div className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5">
                <p className="text-sm font-medium text-bone">Certificate file not connected yet</p>
                <p className="mt-2 text-sm leading-relaxed text-smoke">Add the certificate PDF/image under <code className="text-crimson-2">public/certificates/</code> and set its path in <code className="text-crimson-2">src/data/portfolio.ts</code>. This viewer button is ready to be connected, but no certificate document or verification URL is currently included in the project.</p>
              </div>
              <button type="button" onClick={() => setSelectedCertificate(null)} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-crimson px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-crimson-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson-2">Got it</button>
            </section>
          </div>
        )}

        <div className="gutter mt-8" aria-hidden>
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-crimson" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-crimson-2">The pilot</span>
            <span className="h-px flex-1 bg-gradient-to-r from-crimson/40 via-white/10 to-transparent" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-smoke">Next chapter</span>
          </div>
        </div>
      </section>
    </>
  );
}
