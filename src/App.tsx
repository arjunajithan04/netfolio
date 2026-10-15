import SafeAnimatePresence from "./components/SafeAnimatePresence";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import {LayoutGroup,motion} from "framer-motion";
import { viewerProfiles, type ProfileId, type Project, type SectionId } from './data/portfolio';
import { SmoothScrollProvider, useSmoothScroll } from './hooks/smoothScroll';
import CustomCursor from './components/CustomCursor';
import OpeningSequence from './components/OpeningSequence';
import ProfileSelector from './components/ProfileSelector';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ContinueWatching from './components/ContinueWatching';
import Scene from './components/Scene';
import About from './components/About';
import Seasons from './components/Seasons';
import Originals from './components/Originals';
import TopPicks from './components/TopPicks';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import ResumeSection from './components/ResumeViewer';
import FinalCTA from './components/FinalCTA';
import { EASE } from './components/fx';
import { syncPublishedContent } from './lib/contentAdapter';
const AdminApp = lazy(() => import('./components/AdminApp'));

// Overlays are only needed on demand — split them out of the first load.
const PlayIntro = lazy(() => import('./components/PlayIntro'));
const ProjectModal = lazy(() => import('./components/ProjectModal'));
const ResumeModal = lazy(() => import('./components/ResumeModal'));

type Stage = 'opening' | 'profiles' | 'home';

const STORAGE_KEY = 'arjun-ajithan-series-profile';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"], button, a, [role="button"]'));
}

function readStoredProfile(): ProfileId | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return viewerProfiles.some((p) => p.id === v) ? (v as ProfileId) : null;
  } catch {
    return null;
  }
}

export default function App() {
  if (window.location.pathname.startsWith('/admin')) return <Suspense fallback={<div className="admin-loading-mark"><span className="admin-pulse"/> LOADING CONTROL ROOM</div>}><AdminApp /></Suspense>;
  return (
    <SmoothScrollProvider>
      <Series />
    </SmoothScrollProvider>
  );
}

function Series() {
  const stored = readStoredProfile();
  const [stage, setStage] = useState<Stage>(stored ? 'home' : 'opening');
  const [profileId, setProfileId] = useState<ProfileId>(stored ?? 'arjun');
  const [playing, setPlaying] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [commandFeedback, setCommandFeedback] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [, setContentRevision] = useState(0);
  const { scrollTo, lock, unlock } = useSmoothScroll();

  useEffect(() => {
    const handleCommandShortcut = (event: KeyboardEvent) => {
      if (event.key !== '`' || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      if (isEditableTarget(event.target) || commandOpen) return;
      event.preventDefault();
      setCommand('');
      setCommandFeedback('');
      setCommandOpen(true);
    };
    window.addEventListener('keydown', handleCommandShortcut);
    return () => window.removeEventListener('keydown', handleCommandShortcut);
  }, [commandOpen]);

  useEffect(() => {
    if (!commandOpen) return;
    const frame = window.requestAnimationFrame(() => commandInputRef.current?.focus());
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setCommandOpen(false);
        setCommandFeedback('');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [commandOpen]);

  const submitHiddenCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = command.trim().toLowerCase().replace(/\s+/g, ' ');
    setCommandFeedback('');

    // Deliberately keep this registry out of the UI: the console reveals no hints.
    // These are navigation shortcuts only; /admin still uses the existing auth flow.
    const sectionCommands: Record<string, string> = {
      home: 'top', intro: 'top', opening: 'top',
      about: 'about', profile: 'about',
      journey: 'journey', experience: 'journey', timeline: 'journey',
      originals: 'originals', projects: 'originals', work: 'originals', portfolio: 'originals',
      picks: 'picks', featured: 'picks', recommendations: 'picks',
      skills: 'skills', stack: 'skills', technologies: 'skills',
      moments: 'moments', credentials: 'moments', certificates: 'moments', achievements: 'moments',
      story: 'story', resume: 'story', cv: 'story',
      contact: 'contact', connect: 'contact',
    };

    if (normalized === 'admin') {
      setCommandOpen(false);
      window.location.assign('/admin');
      return;
    }
    if (normalized === 'replay' || normalized === 'replay intro') {
      setCommandOpen(false);
      setStage('opening');
      return;
    }
    if (normalized === 'resume' || normalized === 'cv') {
      setCommandOpen(false);
      setResumeOpen(true);
      return;
    }

    const destination = sectionCommands[normalized];
    if (destination) {
      setCommandOpen(false);
      if (stage !== 'home') setStage('home');
      // Wait for the home scene to mount when the command is entered during intro/profile selection.
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        const target = document.getElementById(destination);
        if (target) scrollTo(target, { offset: -72 });
      }));
      return;
    }

    setCommandFeedback('Command not recognized.');
    setCommand('');
    commandInputRef.current?.focus();
  };

  useEffect(() => {
    let active = true;
    const refreshPublishedContent = async () => {
      await syncPublishedContent();
      if (active) setContentRevision((revision) => revision + 1);
    };
    void refreshPublishedContent();
    // When an admin publishes in another tab, the public page can pick it up on focus.
    window.addEventListener('focus', refreshPublishedContent);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshPublishedContent);
    };
  }, []);

  const order = viewerProfiles.find((p) => p.id === profileId)!.order;

  useEffect(() => {
    if (stage === 'home') return;
    lock();
    return unlock;
  }, [stage, lock, unlock]);

  const pickProfile = useCallback(
    (id: ProfileId) => {
      setProfileId(id);
      try {
        sessionStorage.setItem(STORAGE_KEY, id);
      } catch {
        /* storage unavailable — profile simply won't persist */
      }
      if (stage !== 'home') {
        window.scrollTo(0, 0);
        setStage('home');
      } else {
        const p = viewerProfiles.find((v) => v.id === id)!;
        setToast(`Now watching as ${p.name} — ${p.blurb.toLowerCase()}`);
        scrollTo(0, { offset: 0 });
      }
    },
    [stage, scrollTo],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const closeIntro = useCallback(() => setPlaying(false), []);
  const closeProject = useCallback(() => setProject(null), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  const sections: Record<SectionId, ReactNode> = {
    about: <About />,
    journey: <Seasons />,
    originals: <Originals onOpen={setProject} />,
    picks: <TopPicks />,
    skills: <Skills />,
    moments: <Achievements />,
    story: <ResumeSection onView={() => setResumeOpen(true)} />,
  };

  return (
    <LayoutGroup>
      <div className="grain" aria-hidden />
      <CustomCursor />

      <SafeAnimatePresence>
        {commandOpen && (
          <motion.div
            className="netfolio-command-backdrop"
            role="presentation"
            onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.section
              className="netfolio-command-dialog"
              role="dialog" aria-modal="true" aria-labelledby="netfolio-command-title"
              initial={{ opacity: 0, y: 18, scale: .97, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, scale: .985, filter: 'blur(5px)' }}
              transition={{ duration: .24, ease: EASE }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="netfolio-command-topline"><span className="netfolio-command-mark">AB</span><span>NETFOLIO <i>·</i> CONSOLE</span><button type="button" aria-label="Close command console" onClick={() => setCommandOpen(false)}>×</button></div>
              <p className="netfolio-command-kicker">PRIVATE CONSOLE</p>
              <h2 id="netfolio-command-title">Command<span className="netfolio-command-title-dot">.</span></h2>
              <form onSubmit={submitHiddenCommand}>
                <div className="netfolio-command-input-wrap"><span aria-hidden="true">›</span><input ref={commandInputRef} id="netfolio-command-input" aria-label="Enter command" autoComplete="off" spellCheck={false} value={command} onChange={(event) => { setCommand(event.target.value); setCommandFeedback(''); }} placeholder="_" /></div>
                <div className="netfolio-command-feedback" role="status" aria-live="polite">{commandFeedback}</div>
              </form>
            </motion.section>
          </motion.div>
        )}
      </SafeAnimatePresence>

      <SafeAnimatePresence>
        {stage === 'opening' && <OpeningSequence key="opening" onDone={() => setStage('profiles')} />}
        {stage === 'profiles' && <ProfileSelector key="profiles" onPick={pickProfile} />}
      </SafeAnimatePresence>

      {stage === 'home' && (
        <motion.div initial={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 1, ease: EASE }}>
          <Navbar order={order} profileId={profileId} onSwitch={pickProfile} />
          <main>
            <Hero key={`hero-${profileId}`} onPlay={() => setPlaying(true)} onResume={() => setResumeOpen(true)} profileId={profileId} />
            <ContinueWatching order={order} />
            {order.map((id) => (
              <Scene key={id} id={id} className={id === 'originals' ? '!py-0 sm:!py-0' : ''}>
                {sections[id]}
              </Scene>
            ))}
            <FinalCTA onReplay={() => setStage('opening')} />
          </main>
        </motion.div>
      )}

      <Suspense fallback={null}>
        <SafeAnimatePresence>{playing && <PlayIntro key="intro" onClose={closeIntro} />}</SafeAnimatePresence>
        <SafeAnimatePresence>{project && <ProjectModal key="project" project={project} onClose={closeProject} onSwitch={setProject} />}</SafeAnimatePresence>
        <SafeAnimatePresence>{resumeOpen && <ResumeModal key="resume" onClose={closeResume} />}</SafeAnimatePresence>
      </Suspense>

      <SafeAnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="glass fixed bottom-6 left-1/2 z-[150] w-[min(92vw,420px)] -translate-x-1/2 rounded-xl px-5 py-3 text-center text-sm text-bone"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {toast}
          </motion.div>
        )}
      </SafeAnimatePresence>
    </LayoutGroup>
  );
}
