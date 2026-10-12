import {
  profile, education, experience, projects, achievements, certifications, seasons,
  type Project, type Season, type Episode, type Certification,
} from '../data/portfolio';
import { supabase, supabaseConfigured } from './supabase';

export type CmsContentType = 'profile' | 'project' | 'milestone' | 'credential' | 'site_settings';
export type PublishedCmsRow = {
  item_id: string;
  content_type: CmsContentType;
  slug: string;
  sort_order: number;
  payload: Record<string, unknown>;
  published_at?: string;
};
export type ContentSyncResult = {
  source: 'supabase' | 'fallback';
  loadedAt: string | null;
  publishedCount: number;
  message?: string;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const baseline = {
  profile: clone(profile), education: clone(education), experience: clone(experience),
  projects: clone(projects), achievements: clone(achievements), certifications: clone(certifications), seasons: clone(seasons),
};

const object = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const text = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : fallback;
const stringArray = (value: unknown): string[] => Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const replace = <T,>(target: T[], values: T[]) => target.splice(0, target.length, ...values);

function applyProfile(row: PublishedCmsRow) {
  const payload = row.payload;
  const name = text(payload.name, baseline.profile.displayName);
  profile.displayName = name;
  profile.fullName = text(payload.fullName, name);
  profile.firstName = text(payload.firstName, name.toUpperCase());
  profile.role = text(payload.headline, baseline.profile.role);
  profile.intro = text(payload.anecdote, text(payload.intro, baseline.profile.intro));
  profile.location = text(payload.location, baseline.profile.location);
  profile.email = text(payload.email, baseline.profile.email);
  profile.tagline = stringArray(payload.tagline).length ? stringArray(payload.tagline) : baseline.profile.tagline;
  profile.interests = stringArray(payload.interests).length ? stringArray(payload.interests) : baseline.profile.interests;

  const socialLinks = Array.isArray(payload.socialLinks) ? payload.socialLinks.map(object).filter((v): v is Record<string, unknown> => Boolean(v)) : [];
  const linkFor = (name: string) => text(socialLinks.find((link) => text(link.label, text(link.name)).toLowerCase().includes(name))?.url);
  const github = linkFor('github');
  const linkedin = linkFor('linkedin');
  const instagram = linkFor('instagram');
  profile.links.github = github || baseline.profile.links.github;
  profile.links.linkedin = linkedin || baseline.profile.links.linkedin;
  profile.links.instagram = instagram || baseline.profile.links.instagram;
  profile.links.email = `mailto:${profile.email}`;

  if (Array.isArray(payload.education) && payload.education.length) {
    const next = payload.education.map(object).filter((v): v is Record<string, unknown> => Boolean(v)).map((item, index) => ({
      school: text(item.school, text(item.institution, `Education ${index + 1}`)),
      place: text(item.place, text(item.location, '')),
      degree: text(item.degree, text(item.program, '')),
      period: text(item.period, text(item.date, '')),
      score: text(item.score, text(item.result, '')),
    }));
    replace(education, next);
  }
  if (Array.isArray(payload.experience) && payload.experience.length) {
    const next = payload.experience.map(object).filter((v): v is Record<string, unknown> => Boolean(v)).map((item) => ({
      company: text(item.company, text(item.organization, '')),
      role: text(item.role, text(item.title, '')),
      place: text(item.place, text(item.location, '')),
      period: text(item.period, text(item.date, '')),
      points: stringArray(item.points).length ? stringArray(item.points) : [text(item.description)].filter(Boolean),
    })).filter((item) => item.company || item.role);
    if (next.length) replace(experience, next);
  }
}

function projectFromRow(row: PublishedCmsRow, existing?: Project): Project {
  const p = row.payload;
  const technologies = stringArray(p.technologies).length ? stringArray(p.technologies) : stringArray(p.stack);
  const build = [text(p.problem), text(p.approach)].filter(Boolean);
  const motif = existing?.motif ?? 'flow';
  return {
    id: row.slug,
    title: text(p.title, existing?.title ?? row.slug),
    year: text(p.year, existing?.year ?? new Date(row.published_at ?? Date.now()).getFullYear().toString()),
    genre: text(p.genre, existing?.genre ?? 'Software Project'),
    logline: text(p.summary, text(p.logline, existing?.logline ?? '')),
    stack: technologies.length ? technologies : (existing?.stack ?? []),
    build: build.length ? build : (stringArray(p.build).length ? stringArray(p.build) : existing?.build ?? []),
    features: stringArray(p.features).length ? stringArray(p.features) : existing?.features ?? [],
    metrics: existing?.metrics ?? [],
    github: text(p.githubUrl, text(p.github, existing?.github ?? '')) || undefined,
    image: text(p.image, existing?.image ?? (existing ? '' : '/assets/03_my_projects.png')) || undefined,
    palette: existing?.palette ?? { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' },
    motif,
  };
}

function applyProjects(rows: PublishedCmsRow[]) {
  const remoteBySlug = new Map(rows.map((row) => [row.slug, row]));
  const baselineProjects = baseline.projects as Project[];
  const merged = baselineProjects.map((project) => {
    const row = remoteBySlug.get(project.id) ?? rows.find((candidate) => slugify(text(candidate.payload.title, candidate.slug)) === slugify(project.title));
    return row ? projectFromRow(row, project) : project;
  });
  for (const row of rows) {
    const title = text(row.payload.title, row.slug);
    const already = merged.some((project) => project.id === row.slug || slugify(project.title) === slugify(title));
    if (!already) merged.push(projectFromRow(row));
  }
  replace(projects, merged);
}

function applyMilestones(rows: PublishedCmsRow[]) {
  if (!rows.length) return;
  const next = clone(baseline.seasons) as Season[];
  for (const row of rows) {
    const p = row.payload;
    const chapter = text(p.chapter, 'New chapters');
    let season = next.find((entry) => slugify(entry.title) === slugify(chapter));
    if (!season) {
      season = { number: next.length + 1, title: chapter, period: text(p.chapterPeriod, text(p.dateLabel, 'Ongoing')), synopsis: text(p.chapterSynopsis), episodes: [] };
      next.push(season);
    } else {
      season.period = text(p.chapterPeriod, season.period);
      season.synopsis = text(p.chapterSynopsis, season.synopsis);
    }
    const existing = season.episodes.find((episode) => slugify(episode.title) === slugify(text(p.title, row.slug)));
    const episode: Episode = {
      code: text(p.label, existing?.code ?? `S${String(season.number).padStart(2, '0')} E${String(season.episodes.length + 1).padStart(2, '0')}`),
      title: text(p.title, existing?.title ?? row.slug),
      description: text(p.description, existing?.description ?? ''),
      tags: stringArray(p.tags).length ? stringArray(p.tags) : existing?.tags ?? [],
      runtime: text(p.dateLabel, existing?.runtime ?? 'Ongoing'),
      palette: existing?.palette ?? { from: '#24060b', via: '#6e0d1d', to: '#09070a', accent: '#ff3d5a' },
      image: text(p.image, existing?.image ?? '/assets/06_milestones.png'),
    };
    if (existing) season.episodes = season.episodes.map((item) => item === existing ? episode : item);
    else season.episodes.push(episode);
    if (typeof p.order === 'number') season.episodes.sort((a, b) => {
      const aRow = rows.find((r) => slugify(text(r.payload.title, r.slug)) === slugify(a.title));
      const bRow = rows.find((r) => slugify(text(r.payload.title, r.slug)) === slugify(b.title));
      return (typeof aRow?.payload.order === 'number' ? aRow.payload.order : 9999) - (typeof bRow?.payload.order === 'number' ? bRow.payload.order : 9999);
    });
  }
  replace(seasons, next);
}

function applyCredentials(rows: PublishedCmsRow[]) {
  const next = clone(baseline.certifications) as Certification[];
  for (const row of rows) {
    const p = row.payload;
    const title = text(p.title, row.slug);
    const issuer = text(p.issuer, '');
    const item: Certification = {
      issuer: issuer || 'Credential',
      name: text(p.completedLabel, '') ? `${title} (${text(p.completedLabel)})` : title,
      link: text(p.verificationUrl, ''),
    };
    const index = next.findIndex((entry) => slugify(entry.name) === slugify(title) || slugify(`${entry.issuer}-${entry.name}`) === row.slug);
    if (index >= 0) next[index] = { ...next[index], ...item };
    else next.push(item);
  }
  replace(certifications, next);
}

function applySiteSettings(rows: PublishedCmsRow[]) {
  const row = rows[0];
  if (!row) return;
  const title = text(row.payload.seoTitle);
  const description = text(row.payload.seoDescription);
  if (title) document.title = title;
  if (description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
  }
}

export function applyPublishedCmsContent(rows: PublishedCmsRow[]) {
  // Reset to the local, reviewed baseline before each application so refreshes are idempotent.
  Object.assign(profile, clone(baseline.profile));
  profile.links = { ...baseline.profile.links };
  replace(education, clone(baseline.education));
  replace(experience, clone(baseline.experience));
  replace(projects, clone(baseline.projects));
  replace(achievements, clone(baseline.achievements));
  replace(certifications, clone(baseline.certifications));
  replace(seasons, clone(baseline.seasons));

  const byType = (type: CmsContentType) => rows.filter((row) => row.content_type === type).sort((a, b) => a.sort_order - b.sort_order);
  const profiles = byType('profile');
  if (profiles[0]) applyProfile(profiles[0]);
  applyProjects(byType('project'));
  applyMilestones(byType('milestone'));
  applyCredentials(byType('credential'));
  applySiteSettings(byType('site_settings'));
}

export async function syncPublishedContent(): Promise<ContentSyncResult> {
  if (!supabaseConfigured || !supabase) return { source: 'fallback', loadedAt: null, publishedCount: 0, message: 'Supabase is not configured; using bundled portfolio content.' };
  try {
    const { data, error } = await supabase.from('cms_published_content')
      .select('item_id,content_type,slug,sort_order,payload,published_at')
      .order('sort_order');
    if (error) throw new Error(error.message);
    const rows = (Array.isArray(data) ? data : []) as PublishedCmsRow[];
    if (rows.some((row) => !row || !row.item_id || !row.slug || !object(row.payload))) {
      throw new Error('Published CMS data failed validation; bundled content remains active.');
    }
    applyPublishedCmsContent(rows);
    return { source: 'supabase', loadedAt: new Date().toISOString(), publishedCount: rows.length };
  } catch (error) {
    // Do not let a backend outage or malformed record break the public portfolio.
    applyPublishedCmsContent([]);
    return { source: 'fallback', loadedAt: null, publishedCount: 0, message: error instanceof Error ? error.message : 'Could not load published content.' };
  }
}
