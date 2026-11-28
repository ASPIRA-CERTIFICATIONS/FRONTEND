/**
 * Admin → Pages: page-wise, section-wise content editor.
 *  - Built-in sections: edit text / images / buttons, hide or show, reset to the website default.
 *  - Custom sections: add, edit, reorder, hide or delete; choose a layout and where it appears.
 *  - Save draft → Preview (opens the live site with the draft) → Publish. Discard throws the draft away.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Trash2, Save, Send, RotateCcw, ExternalLink, ChevronRight, FileText, Layers, AlertTriangle, Undo2, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import { useSite } from '../../context/SiteContext';
import { CMS_PAGES, CUSTOM_LAYOUTS } from '../../lib/cmsRegistry';
import { pageDef, sectionDefaults } from '../../lib/cms';
import { Text, Area, Select, ImageField, Callout, useToast } from '../fields';

const FIELD_LABELS = { eyebrow: 'Small heading (eyebrow)', heading: 'Heading', intro: 'Intro / sub-text', body: 'Paragraphs', image: 'Image', imageAlt: 'Image description (alt text)', buttons: 'Buttons', items: 'Items' };
const LINK_OK = /^(\/|#|https?:\/\/|tel:|mailto:)/i;
const EDITABLE = ['eyebrow', 'heading', 'intro', 'body', 'image', 'imageAlt', 'buttons', 'items'];
const CUSTOM_FIELDS = {
  text: ['eyebrow', 'heading', 'intro', 'body', 'image', 'imageAlt', 'buttons'],
  'text-image': ['eyebrow', 'heading', 'intro', 'body', 'image', 'imageAlt', 'items', 'buttons'],
  'image-text': ['eyebrow', 'heading', 'intro', 'body', 'image', 'imageAlt', 'items', 'buttons'],
  cards: ['eyebrow', 'heading', 'intro', 'items', 'body', 'buttons'],
  list: ['eyebrow', 'heading', 'intro', 'items', 'buttons'],
  faq: ['eyebrow', 'heading', 'intro', 'items'],
  gallery: ['eyebrow', 'heading', 'intro', 'items'],
  cta: ['eyebrow', 'heading', 'intro', 'buttons'],
  quote: ['body', 'items'],
};
const CUSTOM_ITEM_FIELDS = {
  'text-image': ['title', 'text'], 'image-text': ['title', 'text'], cards: ['title', 'text', 'image', 'href'],
  list: ['title', 'text'], faq: ['title', 'text'], gallery: ['image', 'title'], quote: ['title', 'text'],
};
const ITEM_LABEL = { cards: 'Card', list: 'Point', faq: 'Question', gallery: 'Photo', quote: 'Name', 'text-image': 'Point', 'image-text': 'Point' };
const ITEM_FIELD_LABEL = { title: 'Title', text: 'Text', image: 'Image', href: 'Link (optional)' };
const ITEM_FIELD_LABEL_BY_LAYOUT = { faq: { title: 'Question', text: 'Answer' }, gallery: { title: 'Caption' }, quote: { title: 'Name', text: 'Role / organisation' } };

const clone = (x) => JSON.parse(JSON.stringify(x ?? null));
const same = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');
const blankItem = () => ({ title: '', text: '', image: '', href: '' });
const newKey = (list) => {
  let n = list.length + 1;
  while (list.some((x) => x.key === `custom-${n}`)) n += 1;
  return `custom-${n}`;
};

/* ======================= LIST OF PAGES ======================= */
export function PagesList() {
  const { services } = useSite();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState({});
  useEffect(() => {
    api('/pages', { auth: true })
      .then((list) => setStatus(Object.fromEntries(list.map((p) => [p.slug, p]))))
      .catch((e) => toast(e.message, 'err'));
  }, [toast]);
  const rows = [
    ...CMS_PAGES.filter((p) => !p.template).map((p) => ({ slug: p.slug, label: p.label, path: p.path })),
    ...services.map((s) => ({ slug: `service-${s.slug}`, label: `Service – ${s.title}`, path: `/services/${s.slug}` })),
  ];
  const badge = (st) => {
    if (!st) return <span className="badge badge--draft">Default content</span>;
    if (st.unpublished) return <span className="badge badge--contacted">Unpublished changes</span>;
    return <span className="badge badge--published">Published</span>;
  };
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Callout>
        Edit the text, images and buttons of any website page, section by section. Changes are saved as a <b>draft</b> first – use <b>Preview</b> to check them on the website, then <b>Publish</b> to make them live. Service details (scope, fees, FAQs…) are edited in <Link to="/admin/services">Services</Link>.
      </Callout>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Page</th><th>Address</th><th>Status</th><th>Last published</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => {
              const st = status[r.slug];
              return (
                <tr key={r.slug} className="click" onClick={() => navigate(`/admin/pages/${r.slug}`)}>
                  <td><Link to={`/admin/pages/${r.slug}`} style={{ fontWeight: 700 }}>{r.label}</Link></td>
                  <td className="muted">{r.path}</td>
                  <td>{badge(st)}</td>
                  <td className="muted">{st?.publishedAt ? new Date(st.publishedAt).toLocaleString('en-IN') : '—'}</td>
                  <td style={{ textAlign: 'right' }}><Link to={`/admin/pages/${r.slug}`} className="btn btn--ghost btn--sm"><Pencil size={14} /> Edit</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================= PAGE EDITOR ======================= */
export function PageEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { settings, services } = useSite();
  const def = pageDef(slug);
  const ctx = useMemo(() => ({ settings, services }), [settings, services]);
  const service = slug.startsWith('service-') ? services.find((s) => `service-${s.slug}` === slug) : null;
  const path = service ? `/services/${service.slug}` : def?.path || '/';
  const title = service ? `Service – ${service.title}` : def?.label || slug;

  const [loaded, setLoaded] = useState(null); // { draft, published }
  const [secs, setSecs] = useState([]); // working sections (builtin first, then custom)
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState('');
  const [errs, setErrs] = useState({});
  const [savedSnap, setSavedSnap] = useState('[]');

  // Build the working list: every built-in section (defaults + saved changes) and the custom ones
  function build(saved) {
    const byKey = Object.fromEntries((saved || []).map((x) => [x.key, x]));
    const builtins = (def?.sections || []).map((d) => {
      const dflt = sectionDefaults(slug, d.key, ctx);
      const sv = byKey[d.key] || {};
      const out = { key: d.key, kind: 'builtin', hidden: !!sv.hidden };
      (d.fields || []).forEach((f) => { out[f] = clone(sv[f] !== undefined ? sv[f] : dflt[f] ?? (f === 'buttons' || f === 'items' ? [] : '')); });
      return out;
    });
    const customs = (saved || []).filter((x) => x.kind === 'custom').map(clone);
    return [...builtins, ...customs];
  }
  // Only the changes are stored for built-in sections, so they keep following Settings / Services otherwise
  function serialise(list) {
    return list.map((x) => {
      if (x.kind === 'custom') {
        const out = { key: x.key, kind: 'custom', layout: x.layout || 'text', after: x.after || 'end', hidden: !!x.hidden, label: x.label || '' };
        (CUSTOM_FIELDS[x.layout || 'text'] || []).concat(['eyebrow', 'heading']).forEach((f) => { if (x[f] !== undefined) out[f] = cleanField(f, x[f]); });
        return out;
      }
      const d = def.sections.find((z) => z.key === x.key) || {};
      const dflt = sectionDefaults(slug, x.key, ctx);
      const out = { key: x.key, kind: 'builtin' };
      if (x.hidden) out.hidden = true;
      (d.fields || []).forEach((f) => {
        const v = cleanField(f, x[f]);
        const dv = cleanField(f, dflt[f] ?? (f === 'buttons' || f === 'items' ? [] : ''));
        if (!same(v, dv)) out[f] = v;
      });
      return out;
    }).filter((x) => x.kind === 'custom' || Object.keys(x).length > 2);
  }
  function cleanField(f, v) {
    if (f === 'buttons') return (v || []).map((b) => ({ label: (b.label || '').trim(), href: (b.href || '').trim() })).filter((b) => b.label || b.href);
    if (f === 'items') return (v || []).map((it) => Object.fromEntries(Object.entries(it).map(([k, val]) => [k, String(val ?? '').trim()]))).filter((it) => Object.values(it).some(Boolean));
    return typeof v === 'string' ? v.replace(/\s+$/g, '') : v ?? '';
  }

  useEffect(() => {
    if (!def) return;
    api(`/pages/${slug}/edit`, { auth: true })
      .then((p) => {
        setLoaded(p);
        const list = build(p.draft || []);
        setSecs(list);
        setSavedSnap(JSON.stringify(serialise(list)));
        setSel((s) => s || list[0]?.key || null);
      })
      .catch((e) => toast(e.message, 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, settings, services.length]);

  if (!def) return <p>Unknown page. <Link to="/admin/pages">Back to pages</Link></p>;

  const current = serialise(secs);
  const dirty = JSON.stringify(current) !== savedSnap;
  const unpublished = loaded && !same(loaded.draft || [], loaded.published || []);
  const selected = secs.find((x) => x.key === sel);
  const builtinKeys = def.sections.map((d) => d.key);
  const update = (key, patch) => setSecs((list) => list.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  function validate(list) {
    const e = {};
    list.forEach((x) => {
      const add = (m) => { e[x.key] = [...(e[x.key] || []), m]; };
      (x.buttons || []).forEach((b, i) => {
        if ((b.label || b.href) && !(b.label && b.href)) add(`Button ${i + 1}: enter both the text and the link`);
        if (b.href && !LINK_OK.test(b.href.trim())) add(`Button ${i + 1}: links must start with /, #, https://, tel: or mailto:`);
      });
      (x.items || []).forEach((it, i) => { if (it.href && !LINK_OK.test(it.href.trim())) add(`Item ${i + 1}: invalid link`); });
      if (x.image && !/^(\/|https?:\/\/)/i.test(x.image.trim())) add('Image must be an uploaded file or https:// link');
      if (x.kind === 'custom' && !x.hidden && !(x.heading || x.body || x.items?.length)) add('Add a heading, text or items – or delete this empty section');
      if ((x.heading || '').length > 240) add('Heading is too long (max 240 characters)');
      if ((x.intro || '').length > 1200) add('Intro is too long (max 1200 characters)');
      if ((x.body || '').length > 8000) add('Paragraphs are too long (max 8000 characters)');
    });
    return e;
  }

  async function saveDraft({ quiet } = {}) {
    const e = validate(secs);
    setErrs(e);
    if (Object.keys(e).length) {
      setSel(Object.keys(e)[0]);
      toast('Please fix the highlighted section', 'err');
      return false;
    }
    setBusy('save');
    try {
      const body = serialise(secs);
      const p = await api(`/pages/${slug}/draft`, { method: 'PUT', auth: true, body: { sections: body } });
      setLoaded(p);
      setSavedSnap(JSON.stringify(body));
      if (!quiet) toast('Draft saved – not live yet. Preview or publish it.');
      return true;
    } catch (err) {
      const d = (err.details || [])[0];
      const m = d?.field?.match(/^sections\.(\d+)/);
      if (m) {
        const k = serialise(secs)[Number(m[1])]?.key;
        if (k) { setErrs({ [k]: [d.message] }); setSel(k); }
      }
      toast(err.message, 'err');
      return false;
    } finally {
      setBusy('');
    }
  }
  async function preview() {
    if (dirty && !(await saveDraft({ quiet: true }))) return;
    window.open(`${path}${path.includes('?') ? '&' : '?'}preview=1`, '_blank', 'noopener');
  }
  async function publish() {
    if (dirty && !(await saveDraft({ quiet: true }))) return;
    setBusy('publish');
    try {
      const p = await api(`/pages/${slug}/publish`, { method: 'POST', auth: true });
      setLoaded(p);
      try { localStorage.removeItem(`aspira_cms_${slug}`); } catch { /* ignore */ }
      toast('Published – the changes are live on the website');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setBusy('');
    }
  }
  async function discard() {
    if (!window.confirm('Throw away all unpublished changes on this page and go back to the live version?')) return;
    setBusy('discard');
    try {
      const p = await api(`/pages/${slug}/discard`, { method: 'POST', auth: true });
      setLoaded(p);
      const list = build(p.draft || []);
      setSecs(list);
      setSavedSnap(JSON.stringify(serialise(list)));
      setErrs({});
      toast('Unpublished changes discarded');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setBusy('');
    }
  }
  function addSection() {
    const key = newKey(secs);
    const after = selected ? (selected.kind === 'custom' ? selected.after || 'end' : selected.key) : 'end';
    const s = { key, kind: 'custom', layout: 'text', after, hidden: false, label: '', eyebrow: '', heading: 'New section', intro: '', body: '', image: '', imageAlt: '', buttons: [], items: [] };
    // place right after the selected custom section (keeps order within the same position)
    setSecs((list) => {
      const i = selected?.kind === 'custom' ? list.findIndex((x) => x.key === selected.key) + 1 : list.length;
      return [...list.slice(0, i), s, ...list.slice(i)];
    });
    setSel(key);
  }
  function moveCustom(key, dir) {
    setSecs((list) => {
      const i = list.findIndex((x) => x.key === key);
      const me = list[i];
      let j = i + dir;
      while (j >= 0 && j < list.length && !(list[j].kind === 'custom' && (list[j].after || 'end') === (me.after || 'end'))) j += dir;
      if (j < 0 || j >= list.length) return list;
      const a = [...list];
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  }
  function removeCustom(key) {
    if (!window.confirm('Delete this section? (It stays on the live site until you publish.)')) return;
    setSecs((list) => list.filter((x) => x.key !== key));
    setSel(builtinKeys[0]);
  }
  function resetBuiltin(key) {
    const d = def.sections.find((z) => z.key === key);
    const dflt = sectionDefaults(slug, key, ctx);
    const patch = { hidden: false };
    (d.fields || []).forEach((f) => { patch[f] = clone(dflt[f] ?? (f === 'buttons' || f === 'items' ? [] : '')); });
    update(key, patch);
  }

  // order shown in the sidebar: each built-in followed by the custom sections placed after it
  const customs = secs.filter((x) => x.kind === 'custom');
  const ordered = [
    ...customs.filter((c) => c.after === 'top'),
    ...def.sections.flatMap((d) => [secs.find((x) => x.key === d.key), ...customs.filter((c) => c.after === d.key)]),
    ...customs.filter((c) => !c.after || c.after === 'end' || (c.after !== 'top' && !builtinKeys.includes(c.after))),
  ].filter(Boolean);
  const nameOf = (x) => (x.kind === 'custom' ? x.label || x.heading?.replace(/\*/g, '') || 'Custom section' : def.sections.find((d) => d.key === x.key)?.label || x.key);

  return (
    <div className="pce">
      <div className="pce__bar">
        <div className="pce__title">
          <Link to="/admin/pages" className="muted">Pages</Link> <ChevronRight size={14} /> <b>{title}</b>
          {dirty ? <span className="badge badge--new">Unsaved changes</span> : unpublished ? <span className="badge badge--contacted">Draft – not published</span> : loaded?.publishedAt ? <span className="badge badge--published">Published</span> : <span className="badge badge--draft">Default content</span>}
        </div>
        <div className="toolbar">
          {unpublished && !dirty && <button type="button" className="btn btn--ghost btn--sm" onClick={discard} disabled={!!busy}><Undo2 size={15} /> Discard draft</button>}
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => saveDraft()} disabled={!!busy || !dirty}><Save size={15} /> {busy === 'save' ? 'Saving…' : 'Save draft'}</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={preview} disabled={!!busy}><Eye size={15} /> Preview</button>
          <button type="button" className="btn btn--green btn--sm" onClick={publish} disabled={!!busy || (!dirty && !unpublished)}><Send size={15} /> {busy === 'publish' ? 'Publishing…' : 'Publish'}</button>
          <a href={path} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" title="Open the live page"><ExternalLink size={15} /></a>
        </div>
      </div>

      <div className="pce__grid">
        <aside className="pce__side card">
          <h3><Layers size={16} /> Sections</h3>
          <ol className="pce__list">
            {ordered.map((x) => (
              <li key={x.key} className={`${sel === x.key ? 'on' : ''} ${x.hidden ? 'off' : ''} ${x.kind === 'custom' ? 'is-custom' : ''} ${errs[x.key] ? 'has-err' : ''}`}>
                <button type="button" className="pce__pick" onClick={() => setSel(x.key)}>
                  {x.kind === 'custom' ? <Plus size={13} /> : <FileText size={13} />}
                  <span>{nameOf(x)}</span>
                  {errs[x.key] && <AlertTriangle size={13} className="pce__warn" />}
                </button>
                {(x.kind === 'custom' || def.sections.find((d) => d.key === x.key)?.hideable !== false) && (
                  <button type="button" className="iconbtn" title={x.hidden ? 'Show on website' : 'Hide from website'} onClick={() => update(x.key, { hidden: !x.hidden })}>{x.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                )}
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addSection} style={{ width: '100%' }}><Plus size={14} /> Add new section</button>
          <p className="hint" style={{ marginTop: '.6rem' }}>New sections are added after the selected section.</p>
        </aside>

        <section className="pce__main card">
          {!loaded && <p className="muted">Loading…</p>}
          {loaded && selected && (
            <SectionForm
              key={selected.key}
              s={selected}
              def={def.sections.find((d) => d.key === selected.key)}
              builtins={def.sections}
              errors={errs[selected.key]}
              onChange={(patch) => { update(selected.key, patch); setErrs((e) => ({ ...e, [selected.key]: undefined })); }}
              onReset={() => resetBuiltin(selected.key)}
              onMove={(d) => moveCustom(selected.key, d)}
              onDelete={() => removeCustom(selected.key)}
            />
          )}
        </section>
      </div>
      {dirty && <p className="hint" style={{ textAlign: 'right' }}>You have unsaved changes. <button type="button" className="linkbtn" onClick={() => navigate(0)}>Reload to cancel</button></p>}
    </div>
  );
}

/* ---------- one section ---------- */
function SectionForm({ s, def, builtins, errors, onChange, onReset, onMove, onDelete }) {
  const custom = s.kind === 'custom';
  const layout = s.layout || 'text';
  const fields = custom ? CUSTOM_FIELDS[layout] : (def?.fields || []);
  const itemFields = custom ? CUSTOM_ITEM_FIELDS[layout] || ['title', 'text'] : def?.itemFields || ['title', 'text'];
  const itemLabel = custom ? ITEM_LABEL[layout] || 'Item' : def?.itemLabel || 'Item';
  const lbl = (f) => (custom ? ITEM_FIELD_LABEL_BY_LAYOUT[layout]?.[f] : null) || ITEM_FIELD_LABEL[f];
  const set = (k) => (v) => onChange({ [k]: v });

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div className="pce__head">
        <div>
          <span className="muted" style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>{custom ? 'Custom section' : 'Built-in section'}</span>
          <h2 style={{ margin: 0 }}>{custom ? s.label || s.heading?.replace(/\*/g, '') || 'Custom section' : def?.label}</h2>
        </div>
        <div className="toolbar">
          {custom ? (
            <>
              <button type="button" className="iconbtn" title="Move up" onClick={() => onMove(-1)}><ArrowUp size={15} /></button>
              <button type="button" className="iconbtn" title="Move down" onClick={() => onMove(1)}><ArrowDown size={15} /></button>
              <button type="button" className="btn btn--ghost btn--sm danger" onClick={onDelete}><Trash2 size={14} /> Delete</button>
            </>
          ) : (
            fields.length > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}><RotateCcw size={14} /> Reset to website default</button>
          )}
        </div>
      </div>

      {errors?.length > 0 && <div className="pce__errs" role="alert">{errors.map((m, i) => <div key={i}><AlertTriangle size={14} /> {m}</div>)}</div>}
      {s.hidden && <div className="pce__hiddenmsg"><EyeOff size={14} /> This section is hidden on the website.</div>}
      {def?.note && <Callout>{def.note}</Callout>}

      {custom && (
        <div className="fgrid">
          <Select label="Layout" value={layout} onChange={set('layout')} options={CUSTOM_LAYOUTS.map(([value, label]) => ({ value, label }))} hint={CUSTOM_LAYOUTS.find(([v]) => v === layout)?.[2]} />
          <Select label="Show this section" value={s.after || 'end'} onChange={set('after')} options={[{ value: 'top', label: 'At the top of the page' }, ...builtins.map((b) => ({ value: b.key, label: `After: ${b.label}` })), { value: 'end', label: 'At the end of the page' }]} />
          <Text label="Name in this list (optional)" value={s.label} onChange={set('label')} maxLength={120} />
        </div>
      )}

      {!custom && fields.length === 0 && <p className="muted">This section has no editable text here. You can hide it, or add new sections after it.</p>}

      <div className="fgrid">
        {fields.includes('eyebrow') && <Text label={FIELD_LABELS.eyebrow} value={s.eyebrow} onChange={set('eyebrow')} maxLength={120} />}
        {fields.includes('heading') && <Text full label={FIELD_LABELS.heading} hint="Optional: wrap words in *stars* to mark them as highlighted, e.g. Our *story*. On the Home hero they show in green; elsewhere headings keep the site's normal style." value={s.heading} onChange={set('heading')} maxLength={240} />}
        {fields.includes('intro') && <Area label={FIELD_LABELS.intro} rows={3} value={s.intro} onChange={set('intro')} maxLength={1200} />}
        {fields.includes('body') && <Area label={layout === 'quote' && custom ? 'Quote' : FIELD_LABELS.body} hint='Leave a blank line between paragraphs. Start lines with "- " to make a bullet list.' rows={8} value={s.body} onChange={set('body')} maxLength={8000} />}
        {fields.includes('image') && <ImageField label={FIELD_LABELS.image} hint="Landscape photos work best (at least 1200 px wide). They are shown without cropping important parts." value={s.image} onChange={set('image')} />}
        {fields.includes('image') && <Text full label={FIELD_LABELS.imageAlt} value={s.imageAlt} onChange={set('imageAlt')} maxLength={240} />}
      </div>

      {fields.includes('items') && (
        <ItemsEditor label={`${itemLabel}s`} itemLabel={itemLabel} fields={itemFields} labelOf={lbl} value={s.items || []} onChange={set('items')} />
      )}
      {fields.includes('buttons') && <ButtonsEditor value={s.buttons || []} onChange={set('buttons')} />}
    </div>
  );
}

function move(arr, i, d) {
  const a = [...arr];
  const j = i + d;
  if (j < 0 || j >= a.length) return a;
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

function ItemsEditor({ label, itemLabel, fields, labelOf, value, onChange }) {
  const setItem = (i, k, v) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="f full">
      <label>{label}</label>
      <div className="listed">
        {value.map((it, i) => (
          <div className="listed__obj" key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge">{itemLabel} {i + 1}</span>
              <div className="listed__tools">
                <button type="button" className="iconbtn" title="Move up" onClick={() => onChange(move(value, i, -1))}><ArrowUp size={14} /></button>
                <button type="button" className="iconbtn" title="Move down" onClick={() => onChange(move(value, i, 1))}><ArrowDown size={14} /></button>
                <button type="button" className="iconbtn danger" title="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash2 size={14} /></button>
              </div>
            </div>
            {fields.map((f) => (f === 'image'
              ? <ImageField key={f} label={labelOf(f)} value={it.image} onChange={(v) => setItem(i, 'image', v)} />
              : f === 'text'
                ? <Area key={f} label={labelOf(f)} rows={3} value={it.text} onChange={(v) => setItem(i, 'text', v)} maxLength={1500} />
                : <Text key={f} label={labelOf(f)} value={it[f]} onChange={(v) => setItem(i, f, v)} maxLength={f === 'href' ? 500 : 200} placeholder={f === 'href' ? '/services/green-audits or https://…' : ''} />))}
          </div>
        ))}
        {value.length < 40 && <button type="button" className="btn btn--ghost btn--sm" style={{ justifySelf: 'start' }} onClick={() => onChange([...value, blankItem()])}><Plus size={14} /> Add {itemLabel.toLowerCase()}</button>}
      </div>
    </div>
  );
}

function ButtonsEditor({ value, onChange }) {
  const set = (i, k, v) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="f full">
      <label>Buttons</label>
      <span className="hint">The first button is shown as the main (green) button. Links: a site page like /contact, or https://…, tel:… or mailto:…</span>
      <div className="listed">
        {value.map((b, i) => (
          <div className="listed__row pce__btnrow" key={i}>
            <input className="inp" placeholder="Button text" value={b.label || ''} maxLength={60} onChange={(e) => set(i, 'label', e.target.value)} />
            <input className="inp" placeholder="/contact?intent=quote#enquiry" value={b.href || ''} maxLength={500} onChange={(e) => set(i, 'href', e.target.value)} aria-invalid={!!b.href && !LINK_OK.test(b.href)} />
            <div className="listed__tools">
              <button type="button" className="iconbtn" title="Move up" onClick={() => onChange(move(value, i, -1))}><ArrowUp size={14} /></button>
              <button type="button" className="iconbtn danger" title="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {value.length < 4 && <button type="button" className="btn btn--ghost btn--sm" style={{ justifySelf: 'start' }} onClick={() => onChange([...value, { label: '', href: '' }])}><Plus size={14} /> Add button</button>}
      </div>
    </div>
  );
}

export { EDITABLE };
