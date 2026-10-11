import { useState } from 'react';
import { motion } from 'framer-motion';
import { certifications } from '../data/portfolio';
import { EASE, SectionHeading } from './fx';

export default function Achievements() {
  const [selectedCertificate, setSelectedCertificate] = useState<(typeof certifications)[number] | null>(null);

  return (
    <>
      <SectionHeading
        kicker="An original story"
        title="Milestones & Highlights"
        aside={<p className="max-w-xs text-sm text-mist">Different chapters. A growing perspective. Still being written.</p>}
      />

      <div className="gutter relative mt-2">
        <div aria-hidden className="absolute bottom-10 left-[29px] top-8 w-px bg-gradient-to-b from-crimson via-crimson/45 to-transparent sm:left-[39px]" />
        <div className="space-y-5 sm:space-y-7">
          {[
            { number: '01', label: 'THE FOUNDATION', period: '2022–2025', title: 'The Christ University Chapter', detail: 'Completing a Bachelor of Computer Applications and building the academic foundation for the next stage in computer science.', image: '/assets/milestones/01-christ-campus.webp', imagePosition: 'center 52%', tags: ['BCA', 'Christ University'] },
            { number: '02', label: 'COMMUNITY & COLLABORATION', period: 'AUG 2022 – APR 2023', title: 'Building Beyond the Classroom', detail: 'Serving as a Core Team Member of Google Developer Student Clubs at Christ University — a chapter centred on community and collaboration.', image: '/assets/milestones/02-community-collaboration.webp', imagePosition: 'center 52%', tags: ['Google Developer Student Clubs', 'Christ University'] },
            { number: '03', label: 'THE NEXT CHAPTER', period: 'CURRENTLY PURSUING', title: 'The MCA Journey', detail: 'Continuing the journey through a Master of Computer Applications at Presidency College, Bengaluru, while deepening knowledge across computer science.', image: '/assets/milestones/03-mca-journey.webp', imagePosition: 'center 52%', tags: ['MCA', 'Presidency College'] },
            { number: '04', label: 'PROFESSIONAL GROWTH', period: 'CURRENT CHAPTER', title: 'Stepping Into Industry', detail: 'Learning through hands-on work as an AI with Python Intern at Hope Foundation, Bengaluru.', image: '/assets/milestones/04-industry-internship.webp', imagePosition: 'center 52%', tags: ['AI with Python', 'Hope Foundation · Bengaluru'] },
            { number: '05', label: 'BEYOND THE CAREER', period: 'THE PERSONAL SIDE', title: 'More Than the Work', detail: 'FC Barcelona at heart, and a love for football beyond one club. A reminder that the story is about the person behind the code, too.', image: '/assets/milestones/05-football-beyond-work.webp', imagePosition: 'center 52%', tags: ['FC Barcelona', 'Football'] },
          ].map((moment, i) => (
            <motion.article key={moment.number}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.65, delay: i * 0.04, ease: EASE }}
              className="group relative grid gap-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0c0c0f] transition-colors duration-500 hover:border-crimson-2/35 md:grid-cols-[minmax(220px,0.82fr)_1.18fr]">
              <div className="absolute left-[22px] top-7 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-crimson-2 bg-[#0c0c0f] shadow-[0_0_18px_rgba(229,19,43,0.28)] sm:left-[32px] md:left-[calc(50%-8px)] md:top-8">
                <span className="h-1.5 w-1.5 rounded-full bg-crimson-2" />
              </div>
              <div className="relative min-h-[190px] overflow-hidden sm:min-h-[230px] md:min-h-[250px]">
                <img src={moment.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-85" style={{ objectPosition: moment.imagePosition }} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-[#0c0c0f] md:bg-gradient-to-r md:from-transparent md:via-black/10 md:to-[#0c0c0f]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-black/10 md:bg-gradient-to-t md:from-[#0c0c0f]/45 md:via-transparent md:to-transparent" />
                <div className="absolute bottom-4 left-12 sm:left-16 md:bottom-5 md:left-6">
                  <p className="font-display text-5xl leading-none text-white/90 drop-shadow-lg sm:text-6xl">{moment.number}</p>
                  <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.22em] text-crimson-2">{moment.label}</p>
                </div>
              </div>
              <div className="relative flex flex-col justify-center px-5 pb-6 pl-12 pt-5 sm:px-7 sm:pl-16 md:py-8 md:pl-8 md:pr-9">
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-smoke">
                  <span className="h-px w-5 bg-crimson-2" />{moment.period}
                </div>
                <h3 className="mt-3 max-w-xl font-display text-3xl leading-[0.98] tracking-wide text-bone sm:text-4xl">{moment.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-[15px]">{moment.detail}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {moment.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-bone/65">{tag}</span>)}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-3 pl-12 sm:pl-16">
          <span className="h-px w-7 bg-crimson" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-crimson-2">Next episode</span>
          <span className="h-px flex-1 bg-gradient-to-r from-crimson/40 via-white/10 to-transparent" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-smoke">To be continued</span>
        </div>
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
