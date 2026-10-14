import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { buildBaselineCmsEntries } from '../lib/baselineCms';

type Session = { access_token: string; user: { id: string; email?: string; [key: string]: unknown }; [key: string]: unknown };
type ContentType = 'profile' | 'project' | 'milestone' | 'credential' | 'site_settings';
type CmsItem = {
  id: string;
  content_type: ContentType;
  slug: string;
  admin_title: string;
  sort_order: number;
  updated_at: string;
};
type Draft = { item_id: string; payload: Record<string, unknown>; updated_at: string };
type Published = { item_id: string; payload: Record<string, unknown>; published_at: string };
const TYPES: { value: ContentType; label: string; description: string }[] = [
  { value: 'profile', label: 'Profile', description: 'Introduction, education and experience.' },
  { value: 'project', label: 'Project', description: 'A portfolio project or case study.' },
  { value: 'milestone', label: 'Milestone', description: 'A timeline episode or career highlight.' },
  { value: 'credential', label: 'Credential', description: 'Certificate or achievement.' },
  { value: 'site_settings', label: 'Site settings', description: 'SEO and section-level settings.' },
];

type FieldSpec = { key: string; label: string; kind?: 'text' | 'textarea' | 'url' | 'boolean' | 'list' | 'objectList' | 'visibility'; help?: string; rows?: number; itemFields?: { key: string; label: string; kind?: 'text' | 'textarea' | 'url' }[] };
const FORM_FIELDS: Record<ContentType, FieldSpec[]> = {
  profile: [
    { key: 'name', label: 'Display name' }, { key: 'headline', label: 'Headline', kind: 'textarea' },
    { key: 'anecdote', label: 'Introduction', kind: 'textarea', rows: 4 },
    { key: 'education', label: 'Education', kind: 'objectList', itemFields: [{ key: 'institution', label: 'Institution' }, { key: 'degree', label: 'Degree / course' }, { key: 'period', label: 'Period' }] },
    { key: 'experience', label: 'Experience', kind: 'objectList', itemFields: [{ key: 'role', label: 'Role' }, { key: 'company', label: 'Company' }, { key: 'period', label: 'Period' }, { key: 'description', label: 'Description', kind: 'textarea' }] },
    { key: 'socialLinks', label: 'Social links', kind: 'objectList', itemFields: [{ key: 'label', label: 'Platform' }, { key: 'url', label: 'URL', kind: 'url' }] },
  ],
  project: [
    { key: 'title', label: 'Project name' }, { key: 'summary', label: 'Short description', kind: 'textarea', rows: 3 },
    { key: 'problem', label: 'Problem / purpose', kind: 'textarea' }, { key: 'approach', label: 'Approach / solution', kind: 'textarea' },
    { key: 'technologies', label: 'Technologies', kind: 'list', help: 'Add one technology per line.' },
    { key: 'features', label: 'Key features', kind: 'list', help: 'Add one feature per line.' },
    { key: 'githubUrl', label: 'GitHub URL', kind: 'url' }, { key: 'demoUrl', label: 'Live demo URL', kind: 'url' },
    { key: 'image', label: 'Artwork path or URL', kind: 'url' }, { key: 'featured', label: 'Feature this project', kind: 'boolean' },
  ],
  milestone: [
    { key: 'chapter', label: 'Chapter / season' }, { key: 'label', label: 'Eyebrow label' }, { key: 'title', label: 'Milestone title' },
    { key: 'dateLabel', label: 'Date label' }, { key: 'description', label: 'Description', kind: 'textarea', rows: 4 },
    { key: 'image', label: 'Image path or URL', kind: 'url' }, { key: 'tags', label: 'Tags', kind: 'list', help: 'Add one tag per line.' },
  ],
  credential: [
    { key: 'title', label: 'Credential name' }, { key: 'issuer', label: 'Issuing organisation' },
    { key: 'completedLabel', label: 'Issue date / completion label' }, { key: 'verificationUrl', label: 'Verification URL', kind: 'url' },
    { key: 'certificateMediaId', label: 'Certificate image path or media ID' },
  ],
  site_settings: [
    { key: 'seoTitle', label: 'Browser / search title' }, { key: 'seoDescription', label: 'Search description', kind: 'textarea', rows: 3 },
    { key: 'socialImage', label: 'Social preview image URL', kind: 'url' },
    { key: 'sectionVisibility', label: 'Visible sections', kind: 'visibility', help: 'Choose which supported sections appear on the public site.' },
  ],
};

function normaliseList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((entry) => String(entry ?? '')) : [];
}
function normaliseObjectList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry)) as Record<string, unknown>[] : [];
}

const loginContainerVariants = (reduced: boolean) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 26, scale: reduced ? 1 : 0.975, filter: reduced ? 'blur(0px)' : 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: reduced ? 0 : 0.78, ease: [0.16, 1, 0.3, 1] as const, when: 'beforeChildren', delayChildren: reduced ? 0 : 0.16, staggerChildren: reduced ? 0 : 0.105 },
  },
});
const loginItemVariants = (reduced: boolean) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 14, filter: reduced ? 'blur(0px)' : 'blur(3px)', clipPath: 'inset(0 0 0 0)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)', transition: { duration: reduced ? 0 : 0.48, ease: [0.16, 1, 0.3, 1] as const } },
});
const loginTitleVariants = (reduced: boolean) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 20, clipPath: reduced ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' },
  visible: { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', transition: { duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] as const } },
});

const EMPTY_PAYLOADS: Record<ContentType, Record<string, unknown>> = {
  profile: { name: 'Arjun Ajithan', headline: '', anecdote: '', education: [], experience: [], socialLinks: [] },
  project: { title: '', summary: '', problem: '', approach: '', features: [], technologies: [], image: '', githubUrl: '', demoUrl: '', featured: false },
  milestone: { chapter: '', label: '', title: '', dateLabel: '', description: '', image: '', tags: [], order: 0 },
  credential: { issuer: '', title: '', completedLabel: '', certificateMediaId: '', verificationUrl: '' },
  site_settings: { seoTitle: 'Arjun Ajithan — Portfolio', seoDescription: '', socialImage: '', sectionVisibility: {} },
};

function safeJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AdminApp() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [items, setItems] = useState<CmsItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [published, setPublished] = useState<Record<string, Published>>({});
  const [selectedId, setSelectedId] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | ContentType>('dashboard');
  const [contentType, setContentType] = useState<ContentType>('project');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [payloadText, setPayloadText] = useState(safeJson(EMPTY_PAYLOADS.project));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadPath, setUploadPath] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'draft' | 'published' | 'featured'>('all');
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [draggedArrayRow, setDraggedArrayRow] = useState<{ field: string; index: number } | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);
  const visibleItems = useMemo(() => activeView === 'dashboard' ? items : items.filter((item) => item.content_type === activeView), [items, activeView]);
  const activeType = activeView === 'dashboard' ? null : activeView;
  const filteredItems = useMemo(() => {
    if (activeView !== 'project') return visibleItems;
    const query = projectSearch.trim().toLowerCase();
    return visibleItems.filter((item) => {
      const matchesQuery = !query || `${item.admin_title} ${item.slug} ${item.content_type}`.toLowerCase().includes(query);
      const payload = drafts[item.id]?.payload ?? published[item.id]?.payload ?? {};
      const matchesStatus = projectFilter === 'all' || (projectFilter === 'draft' ? Boolean(drafts[item.id]) : projectFilter === 'published' ? Boolean(published[item.id]) : Boolean(payload.featured));
      return matchesQuery && matchesStatus;
    });
  }, [activeView, visibleItems, projectSearch, projectFilter, drafts, published]);
  const activeTypeLabel = activeType ? TYPES.find((type) => type.value === activeType)?.label ?? 'Content' : 'Content library';
  const healthReport = useMemo(() => {
    type HealthIssue = { id: string; itemId: string; title: string; type: ContentType; severity: 'error' | 'warning' | 'info'; message: string; field?: string };
    const issues: HealthIssue[] = [];
    const sourcePayload = (item: CmsItem) => drafts[item.id]?.payload ?? published[item.id]?.payload ?? {};
    const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
    const validUrl = (value: unknown) => {
      if (!hasText(value)) return false;
      try { const url = new URL(String(value)); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; }
    };
    items.forEach((item) => {
      const payload = sourcePayload(item);
      const add = (severity: HealthIssue['severity'], message: string, field?: string) => issues.push({ id: `${item.id}:${field ?? message}`, itemId: item.id, title: item.admin_title || item.slug, type: item.content_type, severity, message, field });
      if (!hasText(item.admin_title) || !hasText(item.slug)) add('error', 'Missing internal title or URL slug');
      if (!published[item.id]) add('warning', 'Not published yet');
      if (drafts[item.id] && published[item.id] && drafts[item.id].updated_at > published[item.id].published_at) add('info', 'Draft is newer than the published version');
      if (item.content_type === 'project') {
        if (!hasText(payload.title)) add('error', 'Project title is missing', 'title');
        if (!hasText(payload.summary)) add('warning', 'Short description is missing', 'summary');
        if (!Array.isArray(payload.technologies) || payload.technologies.length === 0) add('warning', 'No technologies listed', 'technologies');
        if (hasText(payload.githubUrl) && !validUrl(payload.githubUrl)) add('error', 'GitHub URL is not a valid HTTP(S) URL', 'githubUrl');
        if (hasText(payload.demoUrl) && !validUrl(payload.demoUrl)) add('error', 'Demo URL is not a valid HTTP(S) URL', 'demoUrl');
        if (!hasText(payload.image)) add('warning', 'Project artwork is missing', 'image');
      } else if (item.content_type === 'milestone') {
        if (!hasText(payload.title)) add('error', 'Milestone title is missing', 'title');
        if (!hasText(payload.description)) add('warning', 'Description is missing', 'description');
        if (!hasText(payload.image)) add('warning', 'Milestone artwork is missing', 'image');
      } else if (item.content_type === 'credential') {
        if (!hasText(payload.title)) add('error', 'Credential title is missing', 'title');
        if (!hasText(payload.issuer)) add('warning', 'Issuing organisation is missing', 'issuer');
        if (hasText(payload.verificationUrl) && !validUrl(payload.verificationUrl)) add('error', 'Verification URL is not a valid HTTP(S) URL', 'verificationUrl');
      } else if (item.content_type === 'profile') {
        if (!hasText(payload.name)) add('error', 'Display name is missing', 'name');
        if (!hasText(payload.headline)) add('warning', 'Profile headline is missing', 'headline');
        if (!hasText(payload.anecdote)) add('warning', 'Introduction is missing', 'anecdote');
        const links = Array.isArray(payload.socialLinks) ? payload.socialLinks as Record<string, unknown>[] : [];
        links.forEach((link, index) => { if (hasText(link.url) && !validUrl(link.url)) add('error', `Social link ${index + 1} has an invalid URL`, 'socialLinks'); });
      } else if (item.content_type === 'site_settings') {
        if (!hasText(payload.seoTitle)) add('warning', 'SEO title is missing', 'seoTitle');
        if (!hasText(payload.seoDescription)) add('warning', 'SEO description is missing', 'seoDescription');
        if (hasText(payload.socialImage) && !validUrl(payload.socialImage) && !String(payload.socialImage).startsWith('/')) add('warning', 'Social preview image should be a URL or site-relative path', 'socialImage');
      }
    });
    const counts = { error: issues.filter((i) => i.severity === 'error').length, warning: issues.filter((i) => i.severity === 'warning').length, info: issues.filter((i) => i.severity === 'info').length };
    const priority: Record<HealthIssue['severity'], number> = { error: 0, warning: 1, info: 2 };
    return { issues: issues.sort((a, b) => priority[a.severity] - priority[b.severity]), counts, checked: items.length };
  }, [items, drafts, published]);
  const selectedDraft = selected ? drafts[selected.id] : undefined;
  const selectedPublished = selected ? published[selected.id] : undefined;
  const draftMatchesEditor = useMemo(() => {
    if (!selected || !selectedDraft) return false;
    try {
      const currentPayload = JSON.parse(payloadText);
      return JSON.stringify(currentPayload) === JSON.stringify(selectedDraft.payload)
        && title.trim() === selected.admin_title
        && slug.trim().toLowerCase() === selected.slug
        && contentType === selected.content_type
        && (Number(sortOrder) || 0) === selected.sort_order;
    } catch { return false; }
  }, [selected, selectedDraft, payloadText, title, slug, contentType, sortOrder]);

  const loadContent = useCallback(async () => {
    if (!supabase) return;
    setError('');
    const [itemResult, draftResult, publishedResult] = await Promise.all([
      supabase.from('cms_items').select('id,content_type,slug,admin_title,sort_order,updated_at').order('sort_order').order('admin_title'),
      supabase.from('cms_drafts').select('item_id,payload,updated_at'),
      supabase.from('cms_published_content').select('item_id,payload,published_at'),
    ]);
    if (itemResult.error) { setError(itemResult.error.message); return; }
    if (draftResult.error) { setError(draftResult.error.message); return; }
    if (publishedResult.error) { setError(publishedResult.error.message); return; }
    const nextItems = (itemResult.data ?? []) as CmsItem[];
    setItems(nextItems);
    setDrafts(Object.fromEntries(((draftResult.data ?? []) as Draft[]).map((draft) => [draft.item_id, draft])));
    setPublished(Object.fromEntries(((publishedResult.data ?? []) as Published[]).map((row) => [row.item_id, row])));
    if (selectedId && !nextItems.some((item) => item.id === selectedId)) setSelectedId('');
  }, [selectedId]);

  const reorderEntries = async (sourceId: string, targetId: string) => {
    if (!supabase || reorderBusy || sourceId === targetId) return;
    if (activeView === 'dashboard') return;
    if (activeView === 'project' && (projectSearch.trim() || projectFilter !== 'all')) {
      setError('Clear the project search and filter before reordering, so positions stay predictable.');
      return;
    }
    const originalItems = items;
    const typeItems = items.filter((item) => item.content_type === activeView).sort((a, b) => a.sort_order - b.sort_order || a.admin_title.localeCompare(b.admin_title));
    const from = typeItems.findIndex((item) => item.id === sourceId);
    const to = typeItems.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...typeItems];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const normalized = reordered.map((item, index) => ({ ...item, sort_order: index + 1 }));
    setItems((current) => current.map((item) => normalized.find((next) => next.id === item.id) ?? item));
    setReorderBusy(true); setError(''); setMessage(`Saving ${activeView === 'site_settings' ? 'site settings' : activeView} order…`);
    try {
      const results = await Promise.all(normalized.map(async (item) => {
        const [itemUpdate, publishedUpdate] = await Promise.all([
          supabase!.from('cms_items').update({ sort_order: item.sort_order, updated_at: new Date().toISOString() }).eq('id', item.id),
          supabase!.from('cms_published_content').update({ sort_order: item.sort_order }).eq('item_id', item.id),
        ]);
        return itemUpdate.error ?? publishedUpdate.error;
      }));
      const failed = results.find(Boolean);
      if (failed) throw failed;
      setMessage(`${activeView === 'site_settings' ? 'Site settings' : activeView.charAt(0).toUpperCase() + activeView.slice(1)} order saved. Positions updated automatically.`);
      await loadContent();
    } catch (e) {
      setItems(originalItems);
      setError(e instanceof Error ? `Could not save order: ${e.message}` : 'Could not save order.');
      setMessage('');
      await loadContent();
    } finally { setReorderBusy(false); setDraggedProjectId(null); }
  };

  const reorderPayloadArray = (fieldKey: string, sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;
    try {
      const payload = parsePayload();
      const value = payload[fieldKey];
      if (!Array.isArray(value)) return;
      const next = [...value];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      payload[fieldKey] = next;
      setPayloadText(safeJson(payload));
      setMessage(`${fieldKey} order updated. Save the draft to keep the new order.`);
    } catch {
      setError('Could not reorder this list because the current content is invalid.');
    } finally { setDraggedArrayRow(null); }
  };

  const verifyAdmin = useCallback(async (currentSession: Session | null) => {
    setSession(currentSession);
    setAuthReady(true);
    setIsAdmin(false);
    setEmail(currentSession?.user.email ?? '');
    if (!currentSession || !supabase) return;
    const { data, error: adminError } = await supabase
      .from('cms_admins').select('user_id').eq('user_id', currentSession.user.id).maybeSingle();
    if (adminError) { setAuthError(`Could not verify administrator access: ${adminError.message}`); return; }
    if (!data) {
      setAuthError('This account is signed in but is not registered in cms_admins.');
      return;
    }
    setAuthError('');
    setIsAdmin(true);
  }, []);

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => verifyAdmin(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, nextSession: Session | null) => {
      window.setTimeout(() => { void verifyAdmin(nextSession); }, 0);
    });
    return () => listener.subscription.unsubscribe();
  }, [verifyAdmin]);

  useEffect(() => {
    if (isAdmin) void loadContent();
  }, [isAdmin, loadContent]);

  useEffect(() => {
    if (!selected) return;
    setContentType(selected.content_type);
    setSlug(selected.slug);
    setTitle(selected.admin_title);
    setSortOrder(String(selected.sort_order));
    setPayloadText(safeJson(selectedDraft?.payload ?? selectedPublished?.payload ?? EMPTY_PAYLOADS[selected.content_type]));
    setUploadPath('');
    setMessage('');
  }, [selectedId]); // Deliberately load editor state only when selection changes.

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true); setAuthError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: emailInput.trim(), password });
    setAuthBusy(false);
    if (signInError) setAuthError(signInError.message);
    setPassword('');
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null); setIsAdmin(false); setItems([]); setSelectedId('');
  };

  const parsePayload = () => {
    const value: unknown = JSON.parse(payloadText);
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Payload must be a JSON object.');
    return value as Record<string, unknown>;
  };

  const updatePayloadField = (key: string, value: unknown) => {
    try { const payload = parsePayload(); payload[key] = value; setPayloadText(safeJson(payload)); }
    catch { setError('This draft data could not be read. Start a new entry or reload the saved entry.'); }
  };

  const renderPayloadField = (field: FieldSpec) => {
    let payload: Record<string, unknown> = {};
    try { payload = parsePayload(); } catch { /* Keep the form usable with an empty payload. */ }
    const value = payload[field.key];
    if (field.kind === 'boolean') return <label className="admin-toggle-field" key={field.key}><span><strong>{field.label}</strong><small>Enable or disable this option.</small></span><input type="checkbox" checked={Boolean(value)} onChange={(e) => updatePayloadField(field.key, e.target.checked)}/></label>;
    if (field.kind === 'list') {
      const listRows = normaliseList(value);
      const reorderList = (from: number, to: number) => {
        if (from === to) return;
        const next = [...listRows]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved);
        updatePayloadField(field.key, next);
      };
      return <fieldset className="admin-full-field admin-friendly-field admin-sortable-list" key={field.key}><legend>{field.label}</legend>{listRows.map((entry, index) => <div key={`${field.key}-${index}`} className={`admin-sortable-list-row ${draggedArrayRow?.field === field.key && draggedArrayRow.index === index ? 'is-dragging' : ''}`} draggable={listRows.length > 1} onDragStart={(event) => { setDraggedArrayRow({ field: field.key, index }); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)); }} onDragOver={(event) => { if (draggedArrayRow?.field === field.key && draggedArrayRow.index !== index) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (draggedArrayRow?.field === field.key && Number.isInteger(from)) reorderList(from, index); setDraggedArrayRow(null); }} onDragEnd={() => setDraggedArrayRow(null)}><span className="admin-array-drag-handle" title="Drag to reorder" aria-hidden="true">⠿</span><input aria-label={`${field.label} ${index + 1}`} value={entry} onChange={(event) => updatePayloadField(field.key, listRows.map((item, i) => i === index ? event.target.value : item))}/><button type="button" className="admin-remove-row" onClick={() => updatePayloadField(field.key, listRows.filter((_, i) => i !== index))}>REMOVE</button></div>)}<button type="button" className="admin-secondary-button" onClick={() => updatePayloadField(field.key, [...listRows, ''])}>＋ ADD ITEM</button><small>{field.help ?? 'Drag items to change their order.'}</small></fieldset>;
    }
    if (field.kind === 'objectList') {
      const rows = normaliseObjectList(value);
      const itemFields = field.itemFields ?? [];
      return <fieldset className="admin-object-list admin-full-field" key={field.key}><legend>{field.label}</legend>{rows.map((row, index) => <div className={`admin-object-row ${draggedArrayRow?.field === field.key && draggedArrayRow.index === index ? 'is-dragging' : ''}`} key={`${field.key}-${index}`} draggable={rows.length > 1} onDragStart={(event) => { setDraggedArrayRow({ field: field.key, index }); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(index)); }} onDragOver={(event) => { if (draggedArrayRow?.field === field.key && draggedArrayRow.index !== index) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (draggedArrayRow?.field === field.key && Number.isInteger(from)) reorderPayloadArray(field.key, from, index); }} onDragEnd={() => setDraggedArrayRow(null)}><div className="admin-object-row-title"><strong><span className="admin-array-drag-handle" title="Drag to reorder" aria-hidden="true">⠿</span> {field.label} {index + 1}</strong><button type="button" className="admin-remove-row" onClick={() => updatePayloadField(field.key, rows.filter((_, i) => i !== index))}>REMOVE</button></div><div className="admin-object-fields">{itemFields.map((itemField) => <label key={itemField.key}>{itemField.label}{itemField.kind === 'textarea' ? <textarea rows={2} value={String(row[itemField.key] ?? '')} onChange={(e) => updatePayloadField(field.key, rows.map((item, i) => i === index ? { ...item, [itemField.key]: e.target.value } : item))}/> : <input type={itemField.kind === 'url' ? 'url' : 'text'} value={String(row[itemField.key] ?? '')} onChange={(e) => updatePayloadField(field.key, rows.map((item, i) => i === index ? { ...item, [itemField.key]: e.target.value } : item))}/>}</label>)}</div></div>)}<button type="button" className="admin-secondary-button" onClick={() => updatePayloadField(field.key, [...rows, Object.fromEntries(itemFields.map((item) => [item.key, '']))])}>＋ ADD {field.label.replace(/s$/, '').toUpperCase()}</button></fieldset>;
    }
    if (field.kind === 'visibility') {
      const visibility = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
      const sections = ['about', 'projects', 'experience', 'milestones', 'credentials', 'contact'];
      return <fieldset className="admin-visibility-field admin-full-field" key={field.key}><legend>{field.label}</legend><p>{field.help}</p><div>{sections.map((section) => <label key={section}><input type="checkbox" checked={visibility[section] !== false} onChange={(e) => updatePayloadField(field.key, { ...visibility, [section]: e.target.checked })}/>{section.charAt(0).toUpperCase() + section.slice(1)}</label>)}</div></fieldset>;
    }
    const multiline = field.kind === 'textarea';
    return <label className={`admin-friendly-field ${multiline ? 'admin-full-field' : ''}`} key={field.key}>{field.label}{multiline ? <textarea rows={field.rows ?? 3} value={String(value ?? '')} onChange={(e) => updatePayloadField(field.key, e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}`}/> : <input type={field.kind === 'url' ? 'url' : 'text'} value={String(value ?? '')} onChange={(e) => updatePayloadField(field.key, e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}`}/>}</label>;
  };

  const startNew = () => {
    const nextType = activeView === 'dashboard' ? contentType : activeView;
    setActiveView(nextType);
    setSelectedId('');
    setContentType(nextType); setSlug(''); setTitle(''); setSortOrder('0');
    setPayloadText(safeJson(EMPTY_PAYLOADS[nextType]));
    setMessage('New item — save a draft to create it.');
    setError('');
  };

  const saveDraft = async () => {
    if (!supabase || !isAdmin) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const payload = parsePayload();
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
      if (!cleanSlug) throw new Error('Add a slug using letters, numbers, and hyphens.');
      if (!title.trim()) throw new Error('Add an internal title.');
      let itemId = selected?.id;
      if (!itemId) {
        const { data, error: createError } = await supabase.from('cms_items').insert({
          content_type: contentType, slug: cleanSlug, admin_title: title.trim(),
          sort_order: Number(sortOrder) || 0, created_by: session?.user.id, updated_by: session?.user.id,
        }).select('id').single();
        if (createError) throw createError;
        itemId = data.id;
      } else {
        const { error: updateError } = await supabase.from('cms_items').update({
          content_type: contentType, slug: cleanSlug, admin_title: title.trim(), sort_order: Number(sortOrder) || 0,
          updated_by: session?.user.id,
        }).eq('id', itemId);
        if (updateError) throw updateError;
      }
      if (!itemId) throw new Error('Could not resolve the CMS item ID.');
      const { error: draftError } = await supabase.from('cms_drafts').upsert({
        item_id: itemId, payload, updated_at: new Date().toISOString(), updated_by: session?.user.id,
      }, { onConflict: 'item_id' });
      if (draftError) throw draftError;
      setMessage('Draft saved. Public content has not changed.');
      await loadContent();
      setSelectedId(itemId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save draft.');
    } finally { setBusy(false); }
  };

  const publishDraft = async () => {
    if (!supabase || !selected) return;
    setBusy(true); setError(''); setMessage('');
    try {
      parsePayload();
      const { error: publishError } = await supabase.rpc('publish_cms_item', {
        p_item_id: selected.id, p_revision_note: note.trim() || null,
      });
      if (publishError) throw publishError;
      setMessage('Published successfully. A revision snapshot was recorded.');
      setNote('');
      await loadContent();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish this draft.');
    } finally { setBusy(false); }
  };

  const importBaselineAsDrafts = async () => {
    if (!supabase || !isAdmin) return;
    const confirmed = window.confirm('Import the current bundled portfolio into Netfolio as drafts? Nothing will be published automatically, and existing CMS entries will not be overwritten.');
    if (!confirmed) return;
    setImportBusy(true); setError(''); setMessage('');
    let created = 0;
    let skipped = 0;
    try {
      const [itemsResult, draftsResult, publishedResult] = await Promise.all([
        supabase.from('cms_items').select('id,content_type,slug'),
        supabase.from('cms_drafts').select('item_id'),
        supabase.from('cms_published_content').select('item_id'),
      ]);
      if (itemsResult.error) throw itemsResult.error;
      if (draftsResult.error) throw draftsResult.error;
      if (publishedResult.error) throw publishedResult.error;
      const currentItems = (itemsResult.data ?? []) as { id: string; content_type: ContentType; slug: string }[];
      const draftIds = new Set(((draftsResult.data ?? []) as { item_id: string }[]).map((row) => row.item_id));
      const publishedIds = new Set(((publishedResult.data ?? []) as { item_id: string }[]).map((row) => row.item_id));
      const keys = new Set(currentItems.map((item) => `${item.content_type}:${item.slug}`));

      for (const entry of buildBaselineCmsEntries()) {
        const key = `${entry.content_type}:${entry.slug}`;
        const existing = currentItems.find((item) => `${item.content_type}:${item.slug}` === key);
        if (existing) {
          // Repair a partially imported item only if it has never been published and has no draft.
          if (!draftIds.has(existing.id) && !publishedIds.has(existing.id)) {
            const { error: draftError } = await supabase.from('cms_drafts').upsert({
              item_id: existing.id, payload: entry.payload, updated_at: new Date().toISOString(), updated_by: session?.user.id,
            }, { onConflict: 'item_id' });
            if (draftError) throw draftError;
            created += 1;
          } else skipped += 1;
          continue;
        }
        if (keys.has(key)) { skipped += 1; continue; }
        const { data: newItem, error: itemError } = await supabase.from('cms_items').insert({
          content_type: entry.content_type, slug: entry.slug, admin_title: entry.admin_title,
          sort_order: entry.sort_order, created_by: session?.user.id, updated_by: session?.user.id,
        }).select('id').single();
        if (itemError) throw itemError;
        if (!newItem?.id) throw new Error(`Could not create CMS item: ${entry.admin_title}`);
        const { error: draftError } = await supabase.from('cms_drafts').upsert({
          item_id: newItem.id, payload: entry.payload, updated_at: new Date().toISOString(), updated_by: session?.user.id,
        }, { onConflict: 'item_id' });
        if (draftError) throw draftError;
        created += 1;
      }
      setMessage(`Baseline import complete: ${created} draft${created === 1 ? '' : 's'} added; ${skipped} existing entr${skipped === 1 ? 'y was' : 'ies were'} left untouched. Nothing was published.`);
      await loadContent();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not import the bundled portfolio. Some drafts may have been created; run the import again to repair missing drafts.');
      await loadContent();
    } finally { setImportBusy(false); }
  };

  const uploadMedia = async (file?: File) => {
    if (!supabase || !file || !isAdmin) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'].includes(file.type)) {
      setError('Choose a JPG, PNG, WebP, GIF, AVIF, or SVG image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) { setError('Image must be 8 MB or smaller.'); return; }
    setUploadBusy(true); setError(''); setMessage('');
    try {
      const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
      const path = `${session?.user.id}/${Date.now()}-${cleanName}`;
      const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      setUploadPath(path);
      setMessage('Upload complete. This bucket is private, so use a signed URL when displaying the asset.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally { setUploadBusy(false); }
  };

  if (!supabaseConfigured || !supabase) {
    return <main className="admin-screen"><div className="admin-setup-card"><Brand/><span className="admin-kicker">CMS / SETUP REQUIRED</span><h1>Connect the control room.</h1><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local <code>.env.local</code> and Vercel environment settings. Never add a service-role key to a Vite variable.</p><a className="admin-secondary-button" href="/">Return to portfolio</a></div></main>;
  }

  if (!authReady) return <main className="admin-screen"><div className="admin-loading-mark"><span className="admin-pulse"/> VERIFYING ACCESS</div></main>;

  if (!session || !isAdmin) {
    return <main className="admin-screen admin-login-screen">
      <div className="admin-login-atmosphere" aria-hidden="true">
        <div className="admin-login-poster-wall admin-login-poster-wall-left" aria-hidden="true">
          <span className="login-poster poster-one"><img className="login-poster-image" src="https://m.media-amazon.com/images/M/MV5BNDFkZDI5ZGUtYTdkOC00YTFiLWJjNjMtNTQ3ZjIxMTY2ZjMyXkEyXkFqcGdeQXVyODUxOTU0OTg%40._V1_FMjpg_UX1000_.jpg" alt="" loading="lazy"/><i>01 / SERIES</i></span>
          <span className="login-poster poster-two"><img className="login-poster-image" src="https://static.tvmaze.com/uploads/images/original_untouched/128/321052.jpg" alt="" loading="lazy"/><i>02 / COMEDY</i></span>
          <span className="login-poster poster-three"><img className="login-poster-image" src="https://cdn.cinemagay.it/cinemagay/2016/04/office-the.jpg" alt="" loading="lazy"/><i>03 / COMEDY</i></span>
          <span className="login-poster poster-four"><img className="login-poster-image" src="https://es.web.img3.acsta.net/pictures/16/06/15/13/30/404641.jpg" alt="" loading="lazy"/><i>04 / SCI-FI</i></span>
        </div>
        <div className="admin-login-poster-wall admin-login-poster-wall-right" aria-hidden="true">
          <span className="login-poster poster-five"><img className="login-poster-image" src="https://imagecinepolisgcc.enpointe.io/uploads/images/movies/1782028871177-movie_image1_1782028869987.jpg" alt="" loading="lazy"/><i>05 / FILM</i></span>
          <span className="login-poster poster-six"><img className="login-poster-image" src="https://img-s3.onedio.com/id-6985e12e285f633a9251a708/rev-0/w-900/h-1350/f-jpg/s-9b0bad9b0bd000c327fd9cde2cd026f631422cfa.jpg" alt="" loading="lazy"/><i>06 / COMEDY</i></span>
          <span className="login-poster poster-seven"><img className="login-poster-image" src="https://p3-sdbk2-media.byteimg.com/tos-cn-i-xv4ileqgde/6108d33c9b3b40568ff1080faf87bddd~tplv-resize-w%3A750.image" alt="" loading="lazy"/><i>07 / DRAMA</i></span>
          <span className="login-poster poster-eight"><img className="login-poster-image" src="https://avatars.mds.yandex.net/get-kinopoisk-image/1773646/ae21f434-15cb-47d3-b821-235b60a7a36b/1920x" alt="" loading="lazy"/><i>08 / COMEDY</i></span>
        </div>
        <div className="admin-login-geometry" aria-hidden="true">
          <span className="geometry-orbit geometry-orbit-one" />
          <span className="geometry-orbit geometry-orbit-two" />
          <span className="geometry-orbit geometry-orbit-three" />
          <span className="geometry-axis geometry-axis-one" />
          <span className="geometry-axis geometry-axis-two" />
          <span className="geometry-core"><i /></span>
          <span className="geometry-node geometry-node-one" />
          <span className="geometry-node geometry-node-two" />
          <span className="geometry-node geometry-node-three" />
        </div>
        <div className="admin-login-smoke" />
        <div className="admin-login-reactor"><span/><span/><span/><i/><b/></div>
        <div className="admin-login-sparks">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
        <span className="login-crosshair login-crosshair-one"/><span className="login-crosshair login-crosshair-two"/>
        <span className="login-hud-label login-hud-label-left">NETFOLIO / PRIVATE ACCESS</span>
        <span className="login-hud-label login-hud-label-right">SYSTEM SECURE <b/> ADMIN GATEWAY</span>
        <span className="login-horizon-line"/><span className="login-horizon-line login-horizon-line-bottom"/>
      </div>
      <motion.form
        className="admin-login-card"
        onSubmit={signIn}
        variants={loginContainerVariants(prefersReducedMotion)}
        initial="hidden"
        animate="visible"
        aria-label="Netfolio administrator sign in"
      >
        <motion.img className="admin-login-monogram" src="/logo.svg" alt="Arjun Ajithan" variants={loginItemVariants(prefersReducedMotion)} />
        <motion.h1 className="admin-login-title" variants={loginTitleVariants(prefersReducedMotion)}><span>WELCOME</span><em>BACK.</em></motion.h1>
        <motion.p className="admin-login-subtitle" variants={loginItemVariants(prefersReducedMotion)}>SIGN IN TO YOUR PRIVATE WORKSPACE.</motion.p>
        <motion.label className="admin-login-label" variants={loginItemVariants(prefersReducedMotion)}><span>Email</span><span className="admin-login-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><input type="email" autoComplete="username" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Enter your email"/></span></motion.label>
        <motion.label className="admin-login-label" variants={loginItemVariants(prefersReducedMotion)}><span>Password</span><span className="admin-login-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"/><button className="admin-password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></span></motion.label>
        {authError && <p className="admin-alert admin-alert-error" role="alert">{authError}</p>}
        <motion.button className="admin-primary-button admin-login-submit" type="submit" disabled={authBusy} variants={loginItemVariants(prefersReducedMotion)}>{authBusy ? 'AUTHENTICATING…' : 'SIGN IN TO NETFOLIO'} <span>→</span></motion.button>
        <motion.div className="admin-login-divider" variants={loginItemVariants(prefersReducedMotion)}><span/>OR<span/></motion.div>
        <motion.p className="admin-login-private" variants={loginItemVariants(prefersReducedMotion)}>PRIVATE ACCESS · AUTHORISED  BINGE-WATCHER ONLY</motion.p>
        <motion.a className="admin-back-link" href="/" variants={loginItemVariants(prefersReducedMotion)}>BACK TO PORTFOLIO ↗</motion.a>
      </motion.form>
    </main>;
  }

  return <main className="admin-screen">
    <div className="admin-topbar">
      <Brand/>
      <div className="admin-topbar-meta"><span className="admin-status-dot"/> DATABASE CONNECTED <span className="admin-topbar-divider"/> <span className="admin-user-email">{email}</span><button className="admin-logout-button" onClick={signOut}>SIGN OUT ↗</button></div>
    </div>
    <div className="admin-workspace">
      <aside className="admin-rail">
        <div className="admin-rail-label">WORKSPACE</div>
        <button className={`admin-rail-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveView('dashboard'); setSelectedId(''); setMessage(''); setError(''); }}><span>01</span> Dashboard</button>
        <div className="admin-rail-label admin-rail-label-spaced">CONTENT TYPE</div>
        {TYPES.map((type) => <button key={type.value} className={`admin-type-link ${activeView === type.value ? 'active' : ''}`} onClick={() => { setActiveView(type.value); setContentType(type.value); setSelectedId(''); setTitle(''); setSlug(''); setSortOrder('0'); setPayloadText(safeJson(EMPTY_PAYLOADS[type.value])); setUploadPath(''); setMessage(''); setError(''); }}><span className="admin-type-dot"/>{type.label}<small>{items.filter((item) => item.content_type === type.value).length.toString().padStart(2,'0')}</small></button>)}
        <div className="admin-rail-bottom"><span className="admin-rail-label">SESSION</span><p>Signed in as<br/><strong>{email}</strong></p><span className="admin-version">NETFOLIO / CMS 1.0</span></div>
      </aside>
      <section className="admin-main-panel">
        {activeView === 'dashboard' ? <>
          <div className="admin-page-heading"><div><span className="admin-kicker">NETFOLIO CMS / OVERVIEW</span><h1>Welcome <em>back.</em></h1><p>Manage your portfolio content, review drafts, and publish updates when you are ready.</p></div><div className="admin-heading-actions"><button className="admin-text-button" onClick={() => void importBaselineAsDrafts()} disabled={importBusy}>{importBusy ? 'IMPORTING…' : 'IMPORT SITE CONTENT'}</button><button className="admin-primary-button admin-new-button" onClick={() => { setContentType('project'); setActiveView('project'); setSelectedId(''); setTitle(''); setSlug(''); setSortOrder('0'); setPayloadText(safeJson(EMPTY_PAYLOADS.project)); }}>＋ NEW CONTENT</button></div></div>
          <div className="admin-dashboard-stats">
            <article><span className="admin-kicker">TOTAL CONTENT</span><strong>{items.length.toString().padStart(2,'0')}</strong><small>Across all content types</small></article>
            <article><span className="admin-kicker">DRAFTS</span><strong>{Object.keys(drafts).length.toString().padStart(2,'0')}</strong><small>Saved privately</small></article>
            <article><span className="admin-kicker">PUBLISHED</span><strong>{Object.keys(published).length.toString().padStart(2,'0')}</strong><small>Visible on your site</small></article>
            <article><span className="admin-kicker">CONTENT TYPES</span><strong>{TYPES.length.toString().padStart(2,'0')}</strong><small>Manageable collections</small></article>
          </div>
          <section className="admin-dashboard-section"><div className="admin-card-heading"><div><span className="admin-kicker">WORKSPACE</span><h2>Manage content</h2></div></div><div className="admin-dashboard-types">{TYPES.map((type, index) => <button key={type.value} className="admin-dashboard-type" onClick={() => { setActiveView(type.value); setContentType(type.value); setSelectedId(''); setTitle(''); setSlug(''); setSortOrder('0'); setPayloadText(safeJson(EMPTY_PAYLOADS[type.value])); setUploadPath(''); setMessage(''); setError(''); }}><span className="admin-dashboard-type-index">0{index + 1}</span><span><strong>{type.label}</strong><small>{type.description}</small></span><b>{items.filter((item) => item.content_type === type.value).length.toString().padStart(2,'0')}</b><i>↗</i></button>)}</div></section>
          <section className="admin-dashboard-section admin-dashboard-recent"><div className="admin-card-heading"><div><span className="admin-kicker">RECENTLY UPDATED</span><h2>Latest content</h2></div><span className="admin-count">{items.length} ITEMS</span></div>
            {items.length === 0 ? <div className="admin-empty-state"><h3>Your workspace is ready.</h3><p>Import the current site content as drafts or create your first entry to get started.</p></div> : <div className="admin-item-list">{[...items].sort((a,b) => b.updated_at.localeCompare(a.updated_at)).slice(0,5).map((item) => <button key={item.id} className="admin-item-row" onClick={() => { setActiveView(item.content_type); setSelectedId(item.id); setContentType(item.content_type); setError(''); setMessage(''); }}><span className="admin-item-type">{TYPES.find((type) => type.value === item.content_type)?.label.slice(0,1) ?? 'C'}</span><span className="admin-item-copy"><strong>{item.admin_title}</strong><small>{item.content_type} / {item.slug}</small><span className="admin-item-status"><i className={published[item.id] ? 'published' : ''}/>{published[item.id] ? 'PUBLISHED' : 'UNPUBLISHED'}{drafts[item.id] ? ' · DRAFT SAVED' : ''}{item.content_type === 'project' && Boolean((drafts[item.id]?.payload ?? published[item.id]?.payload ?? {}).featured) ? ' · FEATURED' : ''}</span></span><span className="admin-item-arrow">↗</span></button>)}</div>}
          </section>
          <section className="admin-dashboard-section admin-health-section">
            <div className="admin-card-heading"><div><span className="admin-kicker">SYSTEM AUDIT / CONTENT QUALITY</span><h2>Portfolio health</h2><p className="admin-health-summary">Checked {healthReport.checked} CMS entries using their saved content. URL syntax and required fields are checked locally; remote links are not pinged.</p></div><span className={`admin-health-score ${healthReport.counts.error ? 'has-errors' : healthReport.counts.warning ? 'has-warnings' : 'is-healthy'}`}>{healthReport.counts.error ? 'ACTION NEEDED' : healthReport.counts.warning ? 'NEEDS REVIEW' : 'LOOKING GOOD'}</span></div>
            <div className="admin-health-metrics"><article><span className="admin-health-dot error"/><strong>{healthReport.counts.error}</strong><small>Errors</small></article><article><span className="admin-health-dot warning"/><strong>{healthReport.counts.warning}</strong><small>Warnings</small></article><article><span className="admin-health-dot info"/><strong>{healthReport.counts.info}</strong><small>Draft notes</small></article><article><span className="admin-health-dot neutral"/><strong>{Math.max(0, healthReport.checked - new Set(healthReport.issues.map((issue) => issue.itemId)).size)}</strong><small>Entries with no findings</small></article></div>
            {healthReport.issues.length === 0 ? <div className="admin-health-empty"><span>✓</span><div><strong>No content issues detected</strong><p>Required fields and supported URL formats look good across the current CMS entries.</p></div></div> : <div className="admin-health-list">{healthReport.issues.slice(0, 12).map((issue) => <button key={issue.id} className="admin-health-issue" onClick={() => { const item = items.find((candidate) => candidate.id === issue.itemId); if (!item) return; setActiveView(item.content_type); setContentType(item.content_type); setSelectedId(item.id); setError(''); setMessage(''); }}><span className={`admin-health-severity ${issue.severity}`}>{issue.severity === 'error' ? 'ERROR' : issue.severity === 'warning' ? 'REVIEW' : 'DRAFT'}</span><span className="admin-health-issue-copy"><strong>{issue.title}</strong><small>{issue.type.replace('_', ' ')}{issue.field ? ` · ${issue.field}` : ''}</small><span>{issue.message}</span></span><span className="admin-health-open">FIX ↗</span></button>)}{healthReport.issues.length > 12 && <p className="admin-health-more">Showing 12 of {healthReport.issues.length} findings. Resolve higher-priority errors first.</p>}</div>}
            <div className="admin-health-footnote">This is a content-quality audit, not an uptime monitor. It does not verify remote URL availability, image fetchability, deployment status, or search-engine indexing.</div>
          </section>
        </> : <>
          <div className="admin-page-heading"><div><span className="admin-kicker">NETFOLIO CMS / {activeTypeLabel.toUpperCase()}</span><h1>{activeTypeLabel} <em>management.</em></h1><p>{(TYPES.find((type) => type.value === activeType)?.description ?? 'Manage this content type.') + ' Save privately. Publish only when ready.'}</p></div><div className="admin-heading-actions"><button className="admin-primary-button admin-new-button" onClick={startNew}>＋ NEW {activeTypeLabel.toUpperCase()}</button></div></div>
          <div className="admin-editor-grid admin-content-workspace">
            <section className="admin-library-card"><div className="admin-card-heading"><div><span className="admin-kicker">{activeTypeLabel.toUpperCase()}</span><h2>{activeTypeLabel} entries</h2></div><span className="admin-count">{(activeView === 'project' ? filteredItems : visibleItems).length} ITEMS</span></div>
              <p className="admin-project-reorder-hint">⠿ Drag entries to reorder this section. Display positions save automatically. Reordering project entries requires clearing search and filters first.</p>
              {activeView === 'project' && <div className="admin-project-toolbar"><label className="admin-project-search"><span aria-hidden="true">⌕</span><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects by name or slug" aria-label="Search projects"/></label><label className="admin-project-filter"><span className="sr-only">Filter projects</span><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value as typeof projectFilter)}><option value="all">All projects</option><option value="draft">Has draft</option><option value="published">Published</option><option value="featured">Featured</option></select></label></div>}
              {(activeView === 'project' ? filteredItems : visibleItems).length === 0 ? <div className="admin-empty-state"><span className="admin-empty-glyph">✳</span><h3>{activeView === 'project' && projectSearch ? 'No matching projects.' : 'Nothing here yet.'}</h3><p>{activeView === 'project' && (projectSearch || projectFilter !== 'all') ? 'Try a different search or filter.' : `Create your first ${activeTypeLabel.toLowerCase()} entry. It will stay private until you publish it.`}</p>{!(activeView === 'project' && (projectSearch || projectFilter !== 'all')) && <button className="admin-secondary-button" onClick={startNew}>Create {activeTypeLabel.toLowerCase()} ↗</button>}</div> : <div className="admin-item-list admin-project-sort-list">{(activeView === 'project' ? [...filteredItems].sort((a, b) => a.sort_order - b.sort_order || a.admin_title.localeCompare(b.admin_title)) : visibleItems).map((item) => <button key={item.id} type="button" draggable={!(activeView === 'project' && (projectSearch.trim() || projectFilter !== 'all')) && !reorderBusy} onDragStart={(event) => { if ((activeView === 'project' && (projectSearch.trim() || projectFilter !== 'all')) || reorderBusy) { event.preventDefault(); return; } setDraggedProjectId(item.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', item.id); }} onDragOver={(event) => { if (draggedProjectId && draggedProjectId !== item.id) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }} onDrop={(event) => { event.preventDefault(); const sourceId = event.dataTransfer.getData('text/plain') || draggedProjectId; if (sourceId) void reorderEntries(sourceId, item.id); }} onDragEnd={() => setDraggedProjectId(null)} className={`admin-item-row ${selectedId === item.id ? 'selected' : ''} ${draggedProjectId === item.id ? 'is-dragging' : ''}`} onClick={() => { setSelectedId(item.id); setContentType(item.content_type); setError(''); setMessage(''); }}><span className="admin-item-type">{TYPES.find((type) => type.value === item.content_type)?.label.slice(0,1) ?? 'C'}</span><span className="admin-item-copy"><strong>{item.admin_title}</strong><small>{item.content_type} / {item.slug}</small><span className="admin-item-status"><i className={published[item.id] ? 'published' : ''}/>{published[item.id] ? 'PUBLISHED' : 'UNPUBLISHED'}{drafts[item.id] ? ' · DRAFT SAVED' : ''}{activeView === 'project' && Boolean((drafts[item.id]?.payload ?? published[item.id]?.payload ?? {}).featured) ? ' · FEATURED' : ''}</span></span><span className="admin-project-position" aria-label={`Display position ${item.sort_order}`} title="Drag to reorder"><span aria-hidden="true">⠿</span><b>{String(item.sort_order).padStart(2, '0')}</b></span><span className="admin-item-arrow">↗</span></button>)}</div>}
              <div className="admin-library-footer"><span>RLS PROTECTED</span><span>↗ SUPABASE</span></div>
            </section>
          <section className="admin-editor-card">
            <div className="admin-card-heading"><div><span className="admin-kicker">{selected ? `EDIT / ${selected.content_type.toUpperCase()}` : 'NEW ' + activeTypeLabel.toUpperCase()}</span><h2>{selected ? 'Edit entry' : 'Create an entry'}</h2></div>{selected && <span className={`admin-state-pill ${selectedPublished ? 'published' : ''}`}>{selectedPublished ? 'LIVE' : 'DRAFT MODE'}</span>}</div>
            <div className="admin-form-grid">
              <label>Content type<select value={contentType} onChange={(e) => { const next = e.target.value as ContentType; setContentType(next); if (!selected) setPayloadText(safeJson(EMPTY_PAYLOADS[next])); }} disabled={Boolean(selected)}>{TYPES.filter((type) => type.value === activeView).map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
              <label>Display order<input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}/></label>
              <label className="admin-full-field">Internal title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={activeType === 'project' ? 'e.g. RepoPulse — repository intelligence' : `Enter ${activeTypeLabel.toLowerCase()} title`}/></label>
              <label className="admin-full-field">URL slug<input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. repopulse"/><small>Lowercase letters, numbers and hyphens.</small></label>
            </div>
            <div className="admin-payload-heading"><div><span className="admin-kicker">CONTENT DETAILS</span><h3>Edit {activeTypeLabel.toLowerCase()}</h3></div></div>
            <div className="admin-friendly-form">{(FORM_FIELDS[contentType] ?? []).map(renderPayloadField)}</div>
            <p className="admin-editor-hint">Changes are saved privately as a draft. The public portfolio changes only when you publish.</p>
            <div className="admin-upload-strip"><div><span className="admin-kicker">MEDIA VAULT</span><strong>Private image upload</strong><small>JPG, PNG, WebP, GIF, AVIF or SVG · 8 MB max</small>{uploadPath && <code>{uploadPath}</code>}</div><label className="admin-upload-button">{uploadBusy ? 'UPLOADING…' : '＋ UPLOAD'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml" disabled={uploadBusy} onChange={(e) => { void uploadMedia(e.target.files?.[0]); e.currentTarget.value = ''; }}/></label></div>
            {message && <p className="admin-alert admin-alert-success" role="status">{message}</p>}
            {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}
            <div className="admin-editor-actions"><button className="admin-secondary-button" onClick={() => setPreviewOpen(true)}>PREVIEW JSON ↗</button><button className="admin-primary-button" onClick={() => void saveDraft()} disabled={busy}>{busy ? 'SAVING…' : 'SAVE DRAFT'} <span>↗</span></button></div>
            {selected && <div className="admin-publish-panel"><div><span className="admin-kicker">FINAL STEP</span><h3>Ready to go public?</h3><p>Publishing copies the saved draft to the public content table and records an immutable revision.</p></div><label>Revision note<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. First portfolio release"/></label><button className="admin-publish-button" onClick={() => void publishDraft()} disabled={busy || !selectedDraft || !draftMatchesEditor}>{busy ? 'PROCESSING…' : !selectedDraft || !draftMatchesEditor ? 'SAVE CHANGES BEFORE PUBLISHING' : 'PUBLISH SAVED DRAFT ↗'}</button></div>}
          </section>
          </div>
        </>}
        <footer className="admin-footer"><span>NETFOLIO CMS / BUILT FOR INTENTIONAL EDITING</span><span>PUBLIC SITE IS NOT AUTO-PUBLISHED</span></footer>
      </section>
    </div>
    {previewOpen && <div className="admin-preview-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}><section className="admin-preview-modal" role="dialog" aria-modal="true" aria-labelledby="admin-preview-title"><div className="admin-card-heading"><div><span className="admin-kicker">PRIVATE PREVIEW</span><h2 id="admin-preview-title">{title || 'Untitled entry'}</h2></div><button className="admin-close-button" onClick={() => setPreviewOpen(false)} aria-label="Close preview">×</button></div><p>This is a private content summary. It does not publish or change the public portfolio.</p><div className="admin-friendly-preview">{(FORM_FIELDS[contentType] ?? []).map((field) => { let data: Record<string, unknown> = {}; try { data = parsePayload(); } catch { /* Show an empty value if the payload is invalid. */ } const value = data[field.key]; const display = Array.isArray(value) ? value.map((entry) => typeof entry === 'object' ? Object.values(entry as Record<string, unknown>).filter(Boolean).join(' · ') : String(entry)).join(', ') : value && typeof value === 'object' ? Object.entries(value as Record<string, unknown>).filter(([, v]) => v === true).map(([k]) => k).join(', ') : String(value ?? ''); return <div key={field.key}><strong>{field.label}</strong><span>{display || '—'}</span></div>; })}</div><div className="admin-editor-actions"><button className="admin-secondary-button" onClick={() => setPreviewOpen(false)}>CLOSE PREVIEW</button><button className="admin-primary-button" onClick={() => { setPreviewOpen(false); void saveDraft(); }}>SAVE DRAFT ↗</button></div></section></div>}
  </main>;
}

function Brand() {
  return <a href="/" className="admin-brand" aria-label="Return to Arjun Ajithan portfolio"><img className="admin-brand-mark" src="/logo.svg" alt="" /><span><strong>ARJUN AJITHAN</strong><small>NETFOLIO / PRIVATE CMS</small></span></a>;
}

