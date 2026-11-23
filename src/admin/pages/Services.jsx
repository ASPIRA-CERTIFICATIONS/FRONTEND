import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ExternalLink, Save, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';
import { Icon, ICON_NAMES } from '../../lib/icons';
import { useSite } from '../../context/SiteContext';
import { Loader } from '../../components/ui';
import { Text, Area, Select, Toggle, StringList, ObjectList, ImageField, FileList, Callout, useToast } from '../fields';

export function ServicesList() {
  const toast = useToast();
  const { reload } = useSite();
  const [items, setItems] = useState(null);
  const load = () => api('/services/admin/all', { auth: true }).then(setItems).catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function del(s) {
    if (!window.confirm(`Delete "${s.title}" permanently? This cannot be undone. (Tip: set it to Draft instead to hide it.)`)) return;
    try {
      await api(`/services/${s._id}`, { method: 'DELETE', auth: true });
      toast('Service deleted');
      load();
      reload();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  if (!items) return <Loader />;
  return (
    <>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <p className="muted" style={{ margin: 0 }}>Published services appear on the website, in the menu and in sitemap.xml. Drafts are hidden.</p>
        <Link to="/admin/services/new" className="btn btn--green btn--sm"><Plus size={15} /> New service</Link>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>#</th><th>Service</th><th>Category</th><th>Parent</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id}>
                <td className="muted">{s.order}</td>
                <td>
                  <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
                    <span className="iconbtn" style={{ pointerEvents: 'none' }}><Icon name={s.icon} size={16} /></span>
                    <div><b>{s.title}</b><div className="muted">/services/{s.slug}</div>{s.adminNote && s.status === 'draft' && <div className="muted" style={{ color: '#8a5d00' }}>{s.adminNote.slice(0, 90)}…</div>}</div>
                  </div>
                </td>
                <td>{s.category}</td>
                <td className="muted">{s.parentSlug || '—'}</td>
                <td><span className={`badge badge--${s.status}`}>{s.status}</span>{s.featured && <span className="badge" style={{ marginLeft: 4 }}>featured</span>}</td>
                <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {s.status === 'published' && <a className="iconbtn" href={`/services/${s.slug}`} target="_blank" rel="noopener noreferrer" title="View"><ExternalLink size={14} /></a>}{' '}
                  <Link className="iconbtn" to={`/admin/services/${s._id}`} title="Edit"><Pencil size={14} /></Link>{' '}
                  <button className="iconbtn danger" onClick={() => del(s)} title="Delete"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const EMPTY = {
  title: '', slug: '', category: 'Safety', parentSlug: '', icon: 'ShieldCheck', shortDescription: '', intro: '', purpose: '',
  benefits: [], scope: [], standards: [], industries: [], process: [], whyChoose: [], faqs: [],
  image: '', gallery: [], brochure: '', seo: { title: '', description: '', keywords: '' }, order: 100, featured: false, status: 'draft', adminNote: '',
};

const TABS = ['Basics', 'Content', 'Standards & process', 'FAQs', 'SEO'];

export function ServiceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { reload } = useSite();
  const [s, setS] = useState(id ? null : EMPTY);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('Basics');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/services/admin/all', { auth: true }).then(setAll).catch(() => {});
    if (id) api(`/services/admin/${id}`, { auth: true }).then((d) => setS({ ...EMPTY, ...d, seo: { ...EMPTY.seo, ...(d.seo || {}) } })).catch((e) => toast(e.message, 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!s) return <Loader />;
  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));
  const setSeo = (k) => (v) => setS((x) => ({ ...x, seo: { ...x.seo, [k]: v } }));

  async function save(e) {
    e?.preventDefault();
    setSaving(true);
    const { _id, createdAt, updatedAt, __v, ...body } = s;
    body.order = Number(body.order) || 100;
    try {
      const saved = await api(id ? `/services/${id}` : '/services', { method: id ? 'PUT' : 'POST', body, auth: true });
      toast('Service saved');
      reload();
      if (!id) navigate(`/admin/services/${saved._id}`, { replace: true });
      else setS((x) => ({ ...x, slug: saved.slug }));
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  const cats = [...new Set(['Sustainability', 'Food Safety', 'Safety', 'Training', ...all.map((x) => x.category).filter(Boolean)])];
  const parents = [{ value: '', label: '— none (top-level service) —' }, ...all.filter((x) => !x.parentSlug && x._id !== id).map((x) => ({ value: x.slug, label: x.title }))];

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <Link to="/admin/services" className="btn btn--ghost btn--sm"><ArrowLeft size={15} /> All services</Link>
        <div className="toolbar">
          <Toggle label="Featured on homepage" value={s.featured} onChange={set('featured')} />
          <select className="sel" style={{ width: 'auto' }} value={s.status} onChange={(e) => set('status')(e.target.value)}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
          </select>
          <button className="btn btn--green btn--sm" disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
      {s.adminNote && <Callout><b>Internal note:</b> {s.adminNote}</Callout>}
      <Callout>Only publish claims, standards, approvals and fees that Aspira can verify. Accreditation scope must match the certificate.</Callout>
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button type="button" role="tab" key={t} aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      <div className="card">
        {tab === 'Basics' && (
          <div className="fgrid">
            <Text label="Title *" value={s.title} onChange={set('title')} required />
            <Text label="URL slug" hint={`Website address: /services/${s.slug || '(from title)'}`} value={s.slug} onChange={set('slug')} />
            <Select label="Category" value={s.category} onChange={set('category')} options={cats} />
            <Select label="Parent service" hint="Sub-services (e.g. Fire Safety under Safety Audits) appear inside their parent" value={s.parentSlug} onChange={set('parentSlug')} options={parents} />
            <div className="f">
              <label>Icon</label>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <span className="iconbtn" style={{ pointerEvents: 'none' }}><Icon name={s.icon} size={16} /></span>
                <select className="sel" value={s.icon} onChange={(e) => set('icon')(e.target.value)}>{ICON_NAMES.map((n) => <option key={n}>{n}</option>)}</select>
              </div>
            </div>
            <Text label="Display order" type="number" value={s.order} onChange={set('order')} hint="Lower numbers show first" />
            <Text full label="Target customers (shown on the page)" hint='e.g. "For schools, colleges, universities and all educational institutions"' value={s.audience} onChange={set('audience')} />
            <Text label="Main enquiry button text" hint='e.g. "Book a Green Audit for Your Institution"' value={s.ctaLabel} onChange={set('ctaLabel')} />
            <Select label="Enquiry form type" value={s.formType || 'default'} onChange={set('formType')} options={[{ value: 'default', label: 'General (organisation)' }, { value: 'institution', label: 'Educational institution' }, { value: 'restaurant', label: 'Restaurant / food outlet' }]} />
            <Area label="WhatsApp pre-filled message on this page" rows={2} value={s.whatsappMessage} onChange={set('whatsappMessage')} />
            <Area label="Short description" hint="Used on service cards, the menu and as a fallback meta description (max 300 characters)" rows={2} value={s.shortDescription} onChange={set('shortDescription')} maxLength={300} />
            <ImageField label="Service image" hint="Optional – landscape photo, at least 1200 px wide" value={s.image} onChange={set('image')} />
            <FileList label="Photo gallery (shown on the service page)" hint="2–4 relevant photos work best" value={s.gallery} onChange={set('gallery')} />
            <ImageField label="Brochure (PDF)" hint="Optional download on the service page" value={s.brochure} onChange={set('brochure')} type="all" />
            <Area label="Internal note (never shown on the website)" rows={2} value={s.adminNote} onChange={set('adminNote')} />
          </div>
        )}
        {tab === 'Content' && (
          <div className="fgrid">
            <Area label="Service introduction" hint="Separate paragraphs with a blank line" rows={6} value={s.intro} onChange={set('intro')} />
            <Area label="Purpose" rows={3} value={s.purpose} onChange={set('purpose')} />
            <StringList label="Benefits" value={s.benefits} onChange={set('benefits')} placeholder="Add benefit" />
            <StringList label="Scope of audit" value={s.scope} onChange={set('scope')} placeholder="Add scope item" />
            <StringList label="Industries covered" value={s.industries} onChange={set('industries')} placeholder="Add industry" />
            <StringList label="Why choose Aspira" value={s.whyChoose} onChange={set('whyChoose')} placeholder="Add point" />
          </div>
        )}
        {tab === 'Standards & process' && (
          <div className="fgrid">
            <ObjectList label="Applicable standards & guidelines" value={s.standards} onChange={set('standards')} addLabel="Add standard" fields={[{ key: 'name', label: 'Standard / guideline' }, { key: 'description', label: 'Description', type: 'area' }]} />
            <ObjectList label="Audit process steps" value={s.process} onChange={set('process')} addLabel="Add step" fields={[{ key: 'title', label: 'Step title' }, { key: 'description', label: 'Description', type: 'area' }]} />
          </div>
        )}
        {tab === 'FAQs' && (
          <div className="fgrid">
            <ObjectList label="Frequently asked questions" hint="Also published as FAQ schema for Google" value={s.faqs} onChange={set('faqs')} addLabel="Add FAQ" fields={[{ key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer', type: 'area' }]} />
          </div>
        )}
        {tab === 'SEO' && (
          <div className="fgrid">
            <Text full label={`Page title (${(s.seo.title || '').length}/60)`} hint="Shown in Google results. Leave empty to use “{Title} | Aspira Certifications”." value={s.seo.title} onChange={setSeo('title')} />
            <Area label={`Meta description (${(s.seo.description || '').length}/160)`} rows={3} value={s.seo.description} onChange={setSeo('description')} />
            <Text full label="Keywords (internal reference)" value={s.seo.keywords} onChange={setSeo('keywords')} />
          </div>
        )}
      </div>
    </form>
  );
}
