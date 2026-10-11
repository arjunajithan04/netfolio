import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { skillCategories, skillEvidence, type Skill } from '../data/portfolio';
import { EASE, SectionHeading } from './fx';

const HUES = ['#ff3d5a', '#4cc9ff', '#9a8cff', '#ffb547', '#b98bff', '#ff8a5c', '#7ee0ff'];
const SKILL_CONTEXT: Record<string, string> = {
  Python: 'Programming language', Java: 'Programming language', C: 'Programming language', HTML: 'Markup', CSS: 'Styling and layout', JavaScript: 'Web programming',
  React: 'Frontend library', TypeScript: 'Typed JavaScript', Flutter: 'Cross-platform UI', PHP: 'Server-side development', Flask: 'Python web framework',
  'REST APIs': 'Application integration', Streamlit: 'Python app framework', MySQL: 'Relational database', SQLite: 'Embedded database',
  'Git / GitHub': 'Version control and collaboration', 'VS Code': 'Development environment', 'Android Studio': 'Android development', Figma: 'Interface design',
  'Google Cloud Platform': 'Cloud platform', 'Machine Learning Basics': 'Machine learning foundations', Wireframing: 'Interface planning', 'User-Centered Design': 'Design approach',
  'Team Collaboration': 'Working with others', 'Problem-Solving': 'Analytical thinking', Communication: 'Clear technical communication',
};

export default function Skills() {
  const [cat, setCat] = useState(0);
  const [selectedName, setSelectedName] = useState('Python');
  const reduceMotion = useReducedMotion();
  const category = skillCategories[cat];
  const hue = HUES[cat % HUES.length];
  const selectedSkill = useMemo(
    () => category.skills.find((skill) => skill.name === selectedName) ?? category.skills[0],
    [category, selectedName],
  );
  const selectedEvidence = skillEvidence[selectedSkill.name] ?? [];

  function selectCategory(index: number) {
    setCat(index);
    setSelectedName(skillCategories[index].skills[0]?.name ?? '');
  }

  return (
    <>
      <SectionHeading kicker="Genres" title="My Skill Universe" aside={<p className="max-w-xs text-sm text-mist">Explore the technologies behind my work. Select a skill to reveal its context and project connections.</p>} />

      <div className="gutter grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
        <div className="relative">
          <div aria-hidden className="absolute bottom-5 left-[7px] top-5 hidden w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent lg:block" />
          <div className="rail -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0" role="tablist" aria-label="Skill categories">
            {skillCategories.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`skill-tab-${c.id}`}
                aria-selected={i === cat}
                aria-controls="skill-panel"
                onClick={() => selectCategory(i)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    const next = (i + 1) % skillCategories.length;
                    selectCategory(next);
                    document.getElementById(`skill-tab-${skillCategories[next].id}`)?.focus();
                  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    event.preventDefault();
                    const next = (i - 1 + skillCategories.length) % skillCategories.length;
                    selectCategory(next);
                    document.getElementById(`skill-tab-${skillCategories[next].id}`)?.focus();
                  }
                }}
                className={`group relative shrink-0 rounded-lg px-4 py-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:px-5 ${i === cat ? 'text-bone' : 'text-smoke hover:text-bone'}`}
              >
                {i === cat && <motion.span layoutId="skill-tab" className="absolute inset-0 rounded-lg bg-white/[0.07] ring-1 ring-white/10" transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }} />}
                {i === cat && <motion.span layoutId="skill-bar" className="absolute bottom-2 left-0 top-2 hidden w-[3px] rounded lg:block" style={{ background: hue }} transition={{ duration: reduceMotion ? 0 : 0.3 }} />}
                <span className="relative block font-display text-2xl tracking-wide lg:text-3xl">{c.title}</span>
                <span className="relative hidden text-xs text-smoke lg:block">{c.skills.length} skills · {c.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="skill-panel" role="tabpanel" aria-labelledby={`skill-tab-${category.id}`} className="min-h-[380px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={category.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.28 }}
            >
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-mist"><span className="font-semibold text-bone">{category.title}</span> <span className="text-smoke">/</span> {category.subtitle}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-smoke">{String(cat + 1).padStart(2, '0')} <span className="mx-1 text-smoke/60">—</span> {String(skillCategories.length).padStart(2, '0')} categories</p>
                </div>
                <span className="hidden text-xs text-smoke sm:block">Hover, focus, or select a skill</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {category.skills.map((skill, index) => (
                  <SkillCard
                    key={skill.name}
                    skill={skill}
                    hue={hue}
                    index={index}
                    selected={selectedSkill.name === skill.name}
                    reduceMotion={!!reduceMotion}
                    onSelect={() => setSelectedName(skill.name)}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.section
                  key={selectedSkill.name}
                  aria-live="polite"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  className="relative mt-4 overflow-hidden rounded-xl bg-ink-2 p-4 ring-1 ring-white/10 sm:p-5"
                  style={{ boxShadow: `inset 3px 0 0 ${hue}` }}
                >
                  <div aria-hidden className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: hue }} />
                  <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: hue }}>Selected skill</p>
                      <h3 className="mt-1 font-display text-2xl tracking-wide text-bone">{selectedSkill.name}</h3>
                      <p className="mt-1 text-sm text-mist">{SKILL_CONTEXT[selectedSkill.name] ?? 'Skill and practice'}</p>
                    </div>
                    <div className="sm:max-w-[55%] sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-smoke">Project connections</p>
                      {selectedEvidence.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                          {selectedEvidence.map((item) => <span key={item} className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-bone">{item}</span>)}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-mist">No project link is listed for this skill yet.</p>
                      )}
                    </div>
                  </div>
                </motion.section>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function SkillCard({
  skill,
  hue,
  index,
  selected,
  reduceMotion,
  onSelect,
}: {
  skill: Skill;
  hue: string;
  index: number;
  selected: boolean;
  reduceMotion: boolean;
  onSelect: () => void;
}) {
  const evidence = skillEvidence[skill.name] ?? [];

  return (
    <motion.button
      type="button"
      onMouseEnter={onSelect}
      onFocus={onSelect}
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative isolate flex min-h-[148px] flex-col overflow-hidden rounded-xl bg-ink-2 p-4 text-left transition-[border-color,background,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${selected ? 'border border-white/20' : 'border border-white/[0.07] hover:border-white/20'}`}
      style={{ boxShadow: selected ? `0 14px 36px -22px ${hue}bb, inset 0 0 0 1px ${hue}40` : undefined }}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : index * 0.035 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 100% 0%, ${hue}20, transparent 58%)` }} />
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 -z-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40" style={{ background: hue }} />
      <div className="flex w-full items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border font-display text-2xl tracking-wide transition-colors duration-300" style={{ background: selected ? `${hue}24` : `${hue}12`, color: hue, borderColor: `${hue}${selected ? '88' : '45'}` }} aria-hidden>
          {skill.mono}
        </span>
        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300" style={{ borderColor: selected ? `${hue}99` : 'rgba(255,255,255,.12)', background: selected ? `${hue}22` : 'transparent' }} aria-hidden>
          {selected && <span className="h-1.5 w-1.5 rounded-full" style={{ background: hue }} />}
        </span>
      </div>
      <span className="mt-4 flex items-center gap-2 text-[15px] font-semibold text-bone">
        {skill.name}
        {skill.note && <span className="rounded px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-ink" style={{ background: hue }}>{skill.note}</span>}
      </span>
      <span className="mt-1 text-[11px] text-smoke">{evidence.length > 0 ? `${evidence.length} project connection${evidence.length === 1 ? '' : 's'}` : (SKILL_CONTEXT[skill.name] ?? 'Skill and practice')}</span>
      <span aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left transition-transform duration-300" style={{ background: hue, transform: selected ? 'scaleX(1)' : 'scaleX(0)' }} />
    </motion.button>
  );
}
