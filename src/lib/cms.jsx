/**
 * Page content (CMS) – shared helpers used by website pages and the admin editor.
 *
 *  - Content lives in the database (Page collection); defaults in cmsRegistry.js are the
 *    starting values the admin edits from, so nothing is lost when one section changes.
 *  - Headings accept *word* to show that word in the brand accent colour.
 *  - Paragraph fields: a blank line starts a new paragraph; lines starting with "- " become a list.
 */
import { Fragment, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken } from './api';
import { CMS_PAGES } from './cmsRegistry';
import { DOC_CONTENT } from './docContent';

/* ---------- rich text ---------- */
export function rich(text) {
  if (text == null) return null;
  const parts = String(text).split(/(\*[^*\n]+\*)/g);
  return parts.map((p, i) => (/^\*[^*\n]+\*$/.test(p) ? <em key={i} className="accent">{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>));
}
export const plain = (text) => String(text || '').replace(/\*([^*\n]+)\*/g, '$1');

export function Paras({ text, className = '', first, qHeads = false }) {
  if (!text) return null;
  const blocks = String(text).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const out = [];
  blocks.forEach((b, i) => {
    const lines = b.split('\n');
    if (qHeads && lines.length === 1 && /\?$/.test(b) && b.length < 100) { out.push(<h3 key={`h${i}`} className="cms-qh">{rich(b)}</h3>); return; }
    const isB = (l) => /^[-•*]\s+/.test(l);
    // a block may start with a sentence and continue with "- " list lines
    let k = 0;
    const lead = [];
    while (k < lines.length && !isB(lines[k])) lead.push(lines[k++]);
    if (lead.length) out.push(<p key={`p${i}`} className={`${className} ${i === 0 && first ? first : ''}`.trim()}>{lead.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{rich(l)}</Fragment>)}</p>);
    const items = lines.slice(k).filter(isB);
    if (items.length) out.push(<ul key={`u${i}`} className={`cms-ul ${className}`}>{items.map((l, j) => <li key={j}>{rich(l.replace(/^[-•*]\s+/, ''))}</li>)}</ul>);
  });
  return out;
}

/* ---------- preview mode (admins viewing unpublished drafts) ---------- */
const PREVIEW_KEY = 'aspira_cms_preview';
export function isPreview() {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get('preview') === '1') sessionStorage.setItem(PREVIEW_KEY, '1');
    if (q.get('preview') === '0') sessionStorage.removeItem(PREVIEW_KEY);
    return sessionStorage.getItem(PREVIEW_KEY) === '1' && !!getToken();
  } catch {
    return false;
  }
}
export function exitPreview() {
  try { sessionStorage.removeItem(PREVIEW_KEY); } catch { /* ignore */ }
  const u = new URL(window.location.href);
  u.searchParams.delete('preview');
  window.location.assign(u.toString());
}

/* ---------- loading page content ---------- */
const cacheKey = (slug) => `aspira_cms_${slug}`;
const readCache = (slug) => {
  try { return JSON.parse(localStorage.getItem(cacheKey(slug)) || 'null'); } catch { return null; }
};

export function pageDef(slug) {
  return CMS_PAGES.find((p) => p.slug === slug) || (slug.startsWith('service-') ? { ...CMS_PAGES.find((p) => p.slug === 'service'), slug } : null);
}

/** Defaults for one built-in section (evaluated with live settings) */
export function sectionDefaults(slug, key, ctx = {}) {
  const def = pageDef(slug)?.sections.find((s) => s.key === key);
  if (!def) return {};
  const base = typeof def.defaults === 'function' ? def.defaults(ctx) || {} : def.defaults || {};
  return { ...base, ...(DOC_CONTENT[slug]?.[key] || {}) };
}

/** Applies saved overrides on top of defaults; a saved field (even empty) wins */
export function mergeSection(defaults, saved) {
  if (!saved) return { ...defaults };
  const out = { ...defaults };
  for (const [k, v] of Object.entries(saved)) {
    if (v !== undefined && v !== null && !['key', 'kind', 'label'].includes(k)) out[k] = v;
  }
  return out;
}

/**
 * usePage('home', ctx) → {
 *   s(key)        merged content for a built-in section
 *   hidden(key)   true when the admin hid it
 *   custom(after) admin-added sections placed after a built-in section
 * }
 */
export function usePage(slug, ctx = {}) {
  const preview = isPreview();
  const [state, setState] = useState(() => ({ slug, sections: (preview ? null : readCache(slug)) || [] }));
  const sections = state.slug === slug ? state.sections : (preview ? null : readCache(slug)) || [];
  useEffect(() => {
    let live = true;
    api(`/pages/${slug}${preview ? '?draft=1' : ''}`, { auth: preview })
      .then((d) => {
        if (!live) return;
        setState({ slug, sections: d.sections || [] });
        if (!preview) try { localStorage.setItem(cacheKey(slug), JSON.stringify(d.sections || [])); } catch { /* ignore */ }
      })
      .catch(() => { /* API down – keep defaults/cached */ });
    return () => { live = false; };
  }, [slug, preview]);

  return useMemo(() => {
    const byKey = Object.fromEntries((sections || []).map((x) => [x.key, x]));
    return {
      slug,
      preview,
      s: (key) => mergeSection(sectionDefaults(slug, key, ctx), byKey[key]),
      hidden: (key) => !!byKey[key]?.hidden,
      // admin changes on top of the Google Doc copy (used by components that keep their own defaults)
      saved: (key) => (DOC_CONTENT[slug]?.[key] || byKey[key] ? { ...(DOC_CONTENT[slug]?.[key] || {}), ...(byKey[key] || {}) } : null),
      custom: (after) => (sections || []).filter((x) => x.kind === 'custom' && !x.hidden && (x.after || 'end') === after),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, slug, preview, ctx.settings, ctx.services]);
}

/* Lets nested components (CtaBand, WhyAspira…) read the current page */
export const PageCtx = createContext(null);
export const usePageCtx = () => useContext(PageCtx);
