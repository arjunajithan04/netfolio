import { useRef, type RefObject } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotionPref } from '../hooks/useMedia';

type LivingAtmosphereProps = {
  variant: 'hero' | 'about' | 'journey' | 'projects' | 'skills' | 'moments' | 'story' | 'finale' | 'default';
  targetRef?: RefObject<HTMLElement | null>;
};

/**
 * Decorative Crimson Current layer. SVG keeps the contours crisp and cheap;
 * Framer Motion links a small amount of drift to section scroll progress.
 * It never captures pointer events or changes document flow.
 */
export default function LivingAtmosphere({ variant, targetRef }: LivingAtmosphereProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const { scrollYProgress } = useScroll({
    target: targetRef ?? ownRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 0.5, 1], ['2.5%', '0%', '-2.5%']);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.2, 0.78, 0.68, 0.16]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.985, 1, 1.02]);

  return (
    <motion.div
      ref={ownRef}
      aria-hidden="true"
      className={`living-atmosphere living-atmosphere--${variant}${reduced ? ' living-atmosphere--still' : ''}`}
      style={reduced ? undefined : { y, opacity, scale }}
    >
      <div className="living-atmosphere__wash" />
      <svg className="living-atmosphere__ribbons" viewBox="0 0 1440 720" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={`current-${variant}-primary`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e5132b" stopOpacity="0" />
            <stop offset="35%" stopColor="#ff304f" stopOpacity=".8" />
            <stop offset="58%" stopColor="#ff7181" stopOpacity=".55" />
            <stop offset="100%" stopColor="#e5132b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`current-${variant}-secondary`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7a071b" stopOpacity="0" />
            <stop offset="48%" stopColor="#e5132b" stopOpacity=".7" />
            <stop offset="100%" stopColor="#ff5368" stopOpacity="0" />
          </linearGradient>
          <filter id={`current-${variant}-glow`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g className="living-ribbon living-ribbon--glow" filter={`url(#current-${variant}-glow)`}>
          <path d="M-90 430 C 170 260, 290 590, 535 420 S 930 250, 1130 385 S 1390 505, 1530 300" />
          <path d="M-80 500 C 180 360, 330 650, 575 485 S 920 330, 1110 450 S 1380 550, 1520 390" />
        </g>
        <g className="living-ribbon living-ribbon--main">
          <path d="M-90 430 C 170 260, 290 590, 535 420 S 930 250, 1130 385 S 1390 505, 1530 300" stroke={`url(#current-${variant}-primary)`} />
          <path d="M-80 500 C 180 360, 330 650, 575 485 S 920 330, 1110 450 S 1380 550, 1520 390" stroke={`url(#current-${variant}-secondary)`} />
        </g>
        <path className="living-ribbon__fine" d="M-60 465 C 210 315, 320 560, 565 450 S 940 285, 1145 415 S 1390 500, 1500 340" />
      </svg>
      <div className="living-atmosphere__edge" />
    </motion.div>
  );
}
