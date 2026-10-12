import { profile, education, experience, projects, seasons, certifications } from '../data/portfolio';
import type { CmsContentType } from './contentAdapter';

export type BaselineCmsEntry = {
  content_type: CmsContentType;
  slug: string;
  admin_title: string;
  sort_order: number;
  payload: Record<string, unknown>;
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Converts the current bundled portfolio into CMS draft payloads.
 * Importing does not publish anything; publication remains an explicit admin action.
 */
export function buildBaselineCmsEntries(): BaselineCmsEntry[] {
  const entries: BaselineCmsEntry[] = [
    {
      content_type: 'profile', slug: 'main-profile', admin_title: 'Main profile', sort_order: 0,
      payload: {
        name: profile.displayName,
        fullName: profile.fullName,
        firstName: profile.firstName,
        headline: profile.role,
        anecdote: profile.intro,
        location: profile.location,
        email: profile.email,
        tagline: [...profile.tagline],
        interests: [...profile.interests],
        education: education.map((item) => ({ ...item })),
        experience: experience.map((item) => ({ ...item, points: [...item.points] })),
        socialLinks: [
          { label: 'GitHub', url: profile.links.github },
          { label: 'LinkedIn', url: profile.links.linkedin },
          { label: 'Instagram', url: profile.links.instagram },
        ],
      },
    },
    ...projects.map((project, index) => ({
      content_type: 'project' as const,
      slug: project.id,
      admin_title: project.title,
      sort_order: index,
      payload: {
        title: project.title,
        year: project.year,
        genre: project.genre,
        summary: project.logline,
        problem: project.build[0] ?? '',
        approach: project.build.slice(1).join('\n'),
        features: [...project.features],
        technologies: [...project.stack],
        image: '',
        githubUrl: project.github ?? '',
        demoUrl: '',
        featured: index === 0,
        metrics: project.metrics.map((metric) => ({ ...metric })),
      },
    })),
    ...seasons.flatMap((season) => season.episodes.map((episode, index) => ({
      content_type: 'milestone' as const,
      slug: slugify(episode.title),
      admin_title: `${season.title} — ${episode.title}`,
      sort_order: season.number * 100 + index,
      payload: {
        chapter: season.title,
        label: episode.code,
        title: episode.title,
        dateLabel: episode.runtime,
        description: episode.description,
        image: episode.image,
        tags: [...episode.tags],
        order: season.number * 100 + index,
        chapterPeriod: season.period,
        chapterSynopsis: season.synopsis,
      },
    }))),
    ...certifications.map((credential, index) => ({
      content_type: 'credential' as const,
      slug: slugify(`${credential.issuer}-${credential.name}`),
      admin_title: `${credential.issuer} — ${credential.name}`,
      sort_order: index,
      payload: {
        issuer: credential.issuer,
        title: credential.name,
        completedLabel: '',
        certificateMediaId: '',
        verificationUrl: credential.link,
      },
    })),
    {
      content_type: 'site_settings', slug: 'global-site-settings', admin_title: 'Global site settings', sort_order: 0,
      payload: {
        seoTitle: 'Arjun Ajithan — The Series',
        seoDescription: profile.intro,
        socialImage: '/assets/og-image.jpg',
        sectionVisibility: { about: true, journey: true, originals: true, picks: true, skills: true, moments: true, story: true },
      },
    },
  ];
  return entries;
}
