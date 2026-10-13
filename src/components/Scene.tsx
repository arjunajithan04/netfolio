import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTrackProgress } from '../hooks/sectionProgress';
import LivingAtmosphere from './LivingAtmosphere';

/**
 * A section of the series. Fades up out of black with a short blur-to-focus,
 * and reports viewing progress for the Continue Exploring row.
 */
export default function Scene({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const atmosphereVariant: 'about' | 'journey' | 'projects' | 'skills' | 'moments' | 'story' | 'default' =
    id === 'originals' || id === 'picks'
      ? 'projects'
      : id === 'about' || id === 'journey' || id === 'skills' || id === 'moments' || id === 'story'
        ? id
        : 'default';
  useTrackProgress(id, ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  return (
    <motion.section id={id} ref={ref} style={{ opacity, scale }} className={`relative isolate scroll-mt-16 py-16 sm:py-24 ${className}`}>
      <LivingAtmosphere variant={atmosphereVariant} targetRef={ref} />
      <div className="relative z-[1]">{children}</div>
    </motion.section>
  );
}
