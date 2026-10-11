# ARJUN AJITHAN — THE SERIES

A cinematic, streaming-inspired portfolio for **Arjun Ajithan**: BCA student and software developer.
Every section is an episode, every project is an Original, and the whole site plays like a series.

> A personal portfolio with a fictional streaming-platform look. It is not affiliated with Netflix or any other streaming service and uses none of their logos.

## Run it locally

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Production build:

```bash
npm run build
npm run preview
```

The static site is written to `dist/` and can be deployed as-is to Vercel, Netlify, GitHub Pages or any static host.

## Updating the content

**All content lives in one file: [`src/data/portfolio.ts`](src/data/portfolio.ts).** It is the single source of truth for the portfolio content.

| To change… | Edit |
| --- | --- |
| Name, intro, email, LinkedIn, GitHub | `profile` |
| A project, or a new one | `projects` (add an object; it appears in Originals, the overlay, the resume sheet and the counts) |
| Achievements / certifications | `achievements`, `certifications` |
| Skills and their "where it's used" notes | `skillCategories`, `skillEvidence` |
| Seasons and episodes (My Journey) | `seasons` |
| Top 10 row | `topPicks` |
| ▶ Play Intro highlight reel | `introSlides` |
| Profile order (Recruiter / Developer / Creative) | `viewerProfiles` |
| Opening studio card text | `profile.originalLabel` |

**Resume:** add your own PDF to `public/assets/` and set `profile.resumePdf` in `src/data/portfolio.ts`. Until then, the site uses its designed profile sheet.

**Portrait:** your supplied transparent portrait is already integrated into the responsive WebP assets and social share image. To replace it later, update the portrait assets in `public/assets/`.

```bash
npm run images
```

The optional image pipeline can rebuild responsive WebP portraits and the social share image when its source images are supplied.

## What's inside

```
src/
  data/portfolio.ts        ← single source of truth (from the portfolio data)
  App.tsx                  ← stages: opening → profile select → home; overlays
  components/
    OpeningSequence        ← black → studio card → ARJUN AJITHAN → THE SERIES → portrait → ▶ PLAY
    ProfileSelector        ← "Who's watching?" (changes section order only)
    Navbar                 ← hide-on-scroll nav, profile switcher, mobile menu
    Hero                   ← billboard: parallax portrait, particles, light streaks, floating chips
    PlayIntro              ← ▶ Play Intro: zoom into portrait → highlight reel (pause, ← →, tap zones)
    ContinueWatching       ← cards with real "watched" progress bars
    About                  ← The Pilot
    Seasons / EpisodeCard  ← My Journey as seasons and episodes
    Originals / ProjectCard← pinned horizontal sequence on desktop, swipe rail on touch
    ProjectModal           ← full-screen project overlay with a shared-element transition
    TopPicks               ← Top 10-style row
    Skills                 ← skill genres; each card shows where the skill appears
    Achievements           ← project-milestone cards + optional certification rail
    ResumeViewer/ResumeModal ← designed profile sheet, optional PDF viewer and download
    FinalCTA               ← TO BE CONTINUED… + GitHub contact link
    CustomCursor, fx.tsx   ← cursor states, magnetic buttons, 3D tilt, text reveals, particles
  hooks/                   ← Lenis smooth scroll + scroll lock, media queries, watch progress
scripts/build-images.mjs   ← portrait/share-image pipeline (sharp)
```

**Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion 11, Lenis.

## Accessibility and performance

- `prefers-reduced-motion` is respected: smooth scroll, the custom cursor, tilt, particles, grain and the pinned horizontal scroll turn off, and the opening jumps straight to its final frame.
- Hover effects only run on devices with a precise pointer. Touch devices get tap interactions and native swipe rails.
- The custom cursor appears only with a mouse or trackpad.
- Overlays close with Esc, and the highlight reel supports Space and the ← → keys.
- Portraits are responsive WebP files (25–90 KB). Overlays are code-split, and particles pause when they're off screen.

## Keyboard shortcuts

- **Opening:** Enter or Esc skips it.
- **Play Intro:** Space pauses, ← and → change slides, Esc closes.
- **Project and resume overlays:** Esc closes.

## Cinematic Play Intro

The `Play Intro` overlay now presents a seven-scene, approximately 35–45 second cinematic portfolio trailer. It uses the supplied portrait and existing project/episode artwork, keeps the black-and-crimson visual language, and updates the story to reflect MCA studies at Presidency College and the current AI with Python internship at Hope Foundation in Bengaluru developing RepoPulse.

- Click the top timeline segments to jump directly to a scene.
- Use Pause, the arrow keys, or the side tap zones to control playback.
- Sound is **off by default**. The optional sound toggle enables small synthesized transition cues; no audio is played before the visitor opts in.
- The ending includes Replay Intro and Explore Portfolio actions plus GitHub, Instagram, and email links.
- Reduced-motion preferences are respected by shortening/removing the more pronounced transitions.

### Validation note

TypeScript validation (`npx tsc -b`) passed in the provided environment. The production build could not complete here because the environment's installed Rollup package is missing its platform-specific optional native dependency (`@rollup/rollup-linux-x64-gnu`). Run `npm ci` followed by `npm run build` in a normal Node/npm environment to verify the production bundle.

## Football & FC Barcelona personal layer

The seven-scene intro includes a dedicated “Beyond the build” moment for FC Barcelona and football, using restrained blaugrana-inspired lighting and abstract pitch-line overlays while keeping the existing dark/crimson identity and artwork. The About section adds a compact personal note and a keyboard-accessible, tap-friendly football Easter egg. Its reveal animation respects `prefers-reduced-motion`. No live scores, external APIs, autoplay audio, or new dependencies were added.

Validation for this update: `npx tsc -b` passed and all referenced intro image assets were verified present. `npm run build` remains blocked in this environment by the missing optional Rollup native package `@rollup/rollup-linux-x64-gnu`; browser rendering was not verified here.
