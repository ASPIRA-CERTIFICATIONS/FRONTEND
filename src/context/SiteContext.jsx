import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { FALLBACK_SETTINGS, FALLBACK_SERVICES, FALLBACK_ACCREDITATIONS } from '../lib/fallback';

/* Card-level fields used in lists/menus */
const toListItem = ({ title, slug, category, parentSlug, icon, shortDescription, image, featured, order }) => ({
  title, slug, category, parentSlug, icon, shortDescription, image, featured, order,
});
const FALLBACK_LIST = FALLBACK_SERVICES.map(toListItem).sort((a, b) => a.order - b.order);

const initial = {
  // Start with the built-in verified content so the site renders instantly and
  // never appears empty – API data replaces it as soon as it arrives.
  settings: FALLBACK_SETTINGS,
  services: FALLBACK_LIST,
  accreditations: FALLBACK_ACCREDITATIONS,
  loading: false,
  offline: false,
};

const SiteContext = createContext(initial);

const hasContent = (obj) => obj && typeof obj === 'object' && Object.keys(obj).length > 0;

export function SiteProvider({ children }) {
  const [state, setState] = useState(initial);

  const load = useCallback(async () => {
    const [settings, services, accreditations] = await Promise.allSettled([api('/settings'), api('/services'), api('/accreditations')]);
    const ok = (r) => r.status === 'fulfilled';
    setState({
      settings: ok(settings) && hasContent(settings.value) ? { ...FALLBACK_SETTINGS, ...settings.value } : FALLBACK_SETTINGS,
      services: ok(services) && services.value?.length ? services.value : FALLBACK_LIST,
      accreditations: ok(accreditations) ? (accreditations.value?.length ? accreditations.value : ok(settings) && hasContent(settings.value) ? [] : FALLBACK_ACCREDITATIONS) : FALLBACK_ACCREDITATIONS,
      loading: false,
      offline: !ok(settings) || !ok(services),
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <SiteContext.Provider value={{ ...state, reload: load }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);

/** Built-in copy of a service (used when the API is unreachable) */
export function localService(slug) {
  const s = FALLBACK_SERVICES.find((x) => x.slug === slug);
  if (!s) return null;
  return {
    ...s,
    children: FALLBACK_LIST.filter((x) => x.parentSlug === s.slug),
    related: FALLBACK_LIST.filter((x) => x.slug !== s.slug && x.category === s.category).slice(0, 4),
  };
}

/** Small data-fetching hook */
export function useFetch(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    if (!path) return;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { signal: ctrl.signal })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => e.name !== 'AbortError' && setState({ data: null, loading: false, error: e }));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);
  return state;
}
