const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'aspira_admin_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t) => {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

/** Resolve an uploaded file path (/uploads/x.jpg) to a full URL */
export const fileUrl = (p) => (!p ? '' : /^(https?:|data:|blob:)/.test(p) ? p : p.startsWith('/uploads') ? `${BASE}${p}` : p);

export async function api(path, { method = 'GET', body, auth = false, raw = false, signal } = {}) {
  const headers = {};
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    signal,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (raw) {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res;
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null);
      window.dispatchEvent(new Event('aspira:logout'));
    }
    const fallbackMsg = res.status >= 500 && !data
      ? 'Cannot reach the server. Make sure the backend is running (npm run dev in the Backend folder) and MongoDB is started.'
      : `Request failed (${res.status})`;
    const err = new Error(data?.error || fallbackMsg);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const SITE_URL = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
