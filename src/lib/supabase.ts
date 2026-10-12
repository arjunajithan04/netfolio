type AuthUser = { id: string; email?: string; [key: string]: unknown };
type Session = { access_token: string; refresh_token?: string; expires_at?: number; user: AuthUser; [key: string]: unknown };
type AuthListener = (event: string, session: Session | null) => void;
type Result<T = any> = { data: T; error: { message: string; code?: string } | null; count?: number | null };

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '');
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabaseConfigured = Boolean(url && key && !url.includes('YOUR_PROJECT_REF') && !key.includes('YOUR_SUPABASE'));

function errorFrom(value: any) {
  return { message: value?.message || value?.msg || 'Supabase request failed.', code: value?.code };
}

class QueryBuilder implements PromiseLike<Result> {
  private method = 'GET';
  private body: unknown;
  private columns = '*';
  private filters: string[] = [];
  private orders: string[] = [];
  private conflict = '';
  private returning = false;
  private cardinality: 'many' | 'single' | 'maybeSingle' = 'many';
  constructor(private table: string, private client: NetfolioSupabase) {}
  select(columns = '*') { this.columns = columns; if (this.method !== 'GET') this.returning = true; return this; }
  insert(body: unknown) { this.method = 'POST'; this.body = body; return this; }
  update(body: unknown) { this.method = 'PATCH'; this.body = body; return this; }
  upsert(body: unknown, options?: { onConflict?: string }) { this.method = 'POST'; this.body = body; this.conflict = options?.onConflict ?? ''; return this; }
  delete() { this.method = 'DELETE'; return this; }
  eq(column: string, value: unknown) { this.filters.push(`${encodeURIComponent(column)}=eq.${encodeURIComponent(String(value))}`); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orders.push(`${encodeURIComponent(column)}.${options?.ascending === false ? 'desc' : 'asc'}`); return this; }
  single() { this.cardinality = 'single'; return this; }
  maybeSingle() { this.cardinality = 'maybeSingle'; return this; }
  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
  private async execute(): Promise<Result> {
    const params = [...this.filters];
    if (this.method === 'GET' || this.returning) params.unshift(`select=${encodeURIComponent(this.columns)}`);
    if (this.orders.length) params.push(`order=${encodeURIComponent(this.orders.join(','))}`);
    if (this.conflict) params.push(`on_conflict=${encodeURIComponent(this.conflict)}`);
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Prefer: this.returning ? 'return=representation' : 'return=minimal' };
    if (this.conflict) headers.Prefer += ',resolution=merge-duplicates';
    if (this.cardinality !== 'many' && this.method === 'GET') headers.Accept = 'application/vnd.pgrst.object+json';
    const response = await this.client.request(`/rest/v1/${encodeURIComponent(this.table)}${params.length ? `?${params.join('&')}` : ''}`, {
      method: this.method, headers, body: this.body === undefined ? undefined : JSON.stringify(this.body),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (this.cardinality === 'maybeSingle' && response.status === 406) return { data: null, error: null };
      return { data: null, error: errorFrom(payload) };
    }
    if (this.cardinality === 'single' && Array.isArray(payload)) {
      if (payload.length !== 1) return { data: null, error: { message: `Expected one row, received ${payload.length}.` } };
      return { data: payload[0], error: null };
    }
    return { data: payload, error: null };
  }
}

class NetfolioSupabase {
  private session: Session | null = null;
  private listeners = new Set<AuthListener>();
  private storageKey: string;
  auth: any;
  storage: any;
  constructor(private baseUrl: string, private apiKey: string) {
    const projectRef = baseUrl.match(/^https?:\/\/([^.]+)/)?.[1] ?? 'netfolio';
    this.storageKey = `sb-${projectRef}-auth-token`;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.session = parsed?.currentSession ?? parsed?.session ?? parsed;
      }
    } catch { /* Browser storage may be unavailable. */ }
    this.auth = {
      getSession: async () => ({ data: { session: this.getValidSession() }, error: null }),
      onAuthStateChange: (callback: AuthListener) => {
        this.listeners.add(callback);
        return { data: { subscription: { unsubscribe: () => this.listeners.delete(callback) } } };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        try {
          const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST', headers: { apikey: this.apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const payload = await response.json();
          if (!response.ok) return { data: { user: null, session: null }, error: errorFrom(payload) };
          this.session = { ...payload, expires_at: payload.expires_at ?? (payload.expires_in ? Math.floor(Date.now()/1000)+payload.expires_in : undefined) };
          this.persistSession();
          this.emit('SIGNED_IN');
          return { data: { user: this.session?.user ?? null, session: this.session }, error: null };
        } catch (e) { return { data: { user: null, session: null }, error: errorFrom(e) }; }
      },
      signOut: async () => {
        const token = this.session?.access_token;
        if (token) await fetch(`${this.baseUrl}/auth/v1/logout`, { method: 'POST', headers: { apikey: this.apiKey, Authorization: `Bearer ${token}` } }).catch(() => undefined);
        this.session = null;
        try { localStorage.removeItem(this.storageKey); } catch { /* ignore */ }
        this.emit('SIGNED_OUT');
        return { error: null };
      },
    };
    this.storage = {
      from: (bucket: string) => ({
        upload: async (path: string, file: File, options?: { upsert?: boolean; contentType?: string }) => {
          const token = this.getValidSession()?.access_token;
          const response = await fetch(`${this.baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`, {
            method: options?.upsert ? 'PUT' : 'POST',
            headers: { apikey: this.apiKey, Authorization: `Bearer ${token ?? this.apiKey}`, 'Content-Type': options?.contentType ?? file.type, 'x-upsert': options?.upsert ? 'true' : 'false' },
            body: file,
          });
          const payload = await response.json().catch(() => null);
          return response.ok ? { data: payload, error: null } : { data: null, error: errorFrom(payload) };
        },
      }),
    };
  }
  from(table: string) { return new QueryBuilder(table, this); }
  async rpc(name: string, args: Record<string, unknown>) {
    const response = await this.request(`/rest/v1/rpc/${encodeURIComponent(name)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const payload = await response.json().catch(() => null);
    return response.ok ? { data: payload, error: null } : { data: null, error: errorFrom(payload) };
  }
  async request(path: string, init: RequestInit = {}) {
    const token = this.getValidSession()?.access_token;
    const headers = new Headers(init.headers);
    headers.set('apikey', this.apiKey);
    headers.set('Authorization', `Bearer ${token ?? this.apiKey}`);
    return fetch(`${this.baseUrl}${path}`, { ...init, headers });
  }
  private getValidSession() {
    if (this.session?.expires_at && this.session.expires_at < Math.floor(Date.now()/1000) + 30) {
      // Refresh is attempted lazily to avoid storing or exposing any privileged credential.
      void this.refreshSession();
    }
    return this.session;
  }
  private async refreshSession() {
    if (!this.session?.refresh_token || !url) return;
    try {
      const response = await fetch(`${this.baseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST', headers: { apikey: this.apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.session.refresh_token }),
      });
      const payload = await response.json();
      if (!response.ok) { this.session = null; this.persistSession(); this.emit('SIGNED_OUT'); return; }
      this.session = { ...payload, expires_at: payload.expires_at ?? Math.floor(Date.now()/1000)+(payload.expires_in ?? 3600) };
      this.persistSession(); this.emit('TOKEN_REFRESHED');
    } catch { /* Next authenticated request can retry after the user signs in. */ }
  }
  private persistSession() {
    try { if (this.session) localStorage.setItem(this.storageKey, JSON.stringify(this.session)); else localStorage.removeItem(this.storageKey); } catch { /* ignore */ }
  }
  private emit(event: string) { for (const listener of this.listeners) listener(event, this.session); }
}

export const supabase = supabaseConfigured && url && key ? new NetfolioSupabase(url, key) : null;
