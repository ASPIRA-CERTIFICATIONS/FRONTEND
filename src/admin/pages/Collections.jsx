import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, X, Save, ImagePlus } from 'lucide-react';
import { api, fileUrl } from '../../lib/api';
import { useSite } from '../../context/SiteContext';
import { Loader } from '../../components/ui';
import { Text, Area, Select, Toggle, ImageField, FileList, DateField, Callout, StringList, useToast } from '../fields';

const d10 = (v) => (v ? String(v).slice(0, 10) : '—');
const getK = (o, k) => k.split('.').reduce((a, x) => (a == null ? a : a[x]), o);
const setK = (o, k, v) => {
  const [h, ...r] = k.split('.');
  return r.length ? { ...o, [h]: setK(o?.[h] || {}, r.join('.'), v) } : { ...o, [h]: v };
};

/**
 * Generic list + side-panel editor for simple collections.
 * fields: [{ key, label, type, options, full, hint, required }]
 */
function Collection({ endpoint, fields, columns, blank, intro, singular, publishKey = 'published', note, viewPath, refresh = 0, extra = null }) {
  const toast = useToast();
  const { reload } = useSite();
  const [items, setItems] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api(`${endpoint}/admin/all`, { auth: true }).then(setItems).catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, refresh]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const { _id, createdAt, updatedAt, __v, ...body } = edit;
    for (const f of fields) if (f.type === 'number' && body[f.key] !== '' && body[f.key] != null) body[f.key] = Number(body[f.key]);
    for (const f of fields) if (f.type === 'number' && body[f.key] === '') delete body[f.key];
    try {
      await api(_id ? `${endpoint}/${_id}` : endpoint, { method: _id ? 'PUT' : 'POST', body, auth: true });
      toast(`${singular} saved`);
      setEdit(null);
      load();
      reload();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  async function del(item) {
    if (!window.confirm(`Delete this ${singular.toLowerCase()} permanently? This cannot be undone.`)) return;
    try {
      await api(`${endpoint}/${item._id}`, { method: 'DELETE', auth: true });
      toast(`${singular} deleted`);
      load();
      reload();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  if (!items) return <Loader />;
  const set = (k) => (v) => setEdit((x) => setK(x, k, v));

  return (
    <>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <p className="muted" style={{ margin: 0, maxWidth: '70ch' }}>{intro}</p>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {extra}
          <button className="btn btn--green btn--sm" onClick={() => setEdit({ ...blank })}><Plus size={15} /> Add {singular.toLowerCase()}</button>
        </div>
      </div>
      {note && <Callout>{note}</Callout>}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={columns.length + 1} className="muted" style={{ textAlign: 'center', padding: '2.5rem' }}>Nothing here yet.</td></tr>}
            {items.map((it) => (
              <tr key={it._id}>
                {columns.map((c) => <td key={c.label}>{c.render(it)}</td>)}
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {viewPath && (it.status === 'published' || it.published) && <a className="iconbtn" href={viewPath(it)} target="_blank" rel="noopener noreferrer" title="View on website">↗</a>}{' '}
                  <button className="iconbtn" onClick={() => setEdit(it)} title="Edit"><Pencil size={14} /></button>{' '}
                  <button className="iconbtn danger" onClick={() => del(it)} title="Delete"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="panel" role="dialog" aria-label={`Edit ${singular}`}>
          <div className="panel__bg" onClick={() => setEdit(null)} />
          <form className="panel__box" onSubmit={save}>
            <div className="panel__head"><h2>{edit._id ? 'Edit' : 'Add'} {singular.toLowerCase()}</h2><button type="button" className="iconbtn" onClick={() => setEdit(null)} aria-label="Close"><X size={16} /></button></div>
            <div className="panel__body">
              {edit.adminNote && <Callout><b>Internal note:</b> {edit.adminNote}</Callout>}
              <div className="fgrid">
                {fields.map((f) => {
                  const p = { key: f.key, label: f.label, hint: f.hint, value: getK(edit, f.key), onChange: set(f.key), full: f.full };
                  if (f.type === 'area') return <Area {...p} rows={f.rows || 4} />;
                  if (f.type === 'list') return <StringList {...p} placeholder={f.addLabel || 'Add item'} />;
                  if (f.type === 'select') return <Select {...p} options={f.options} />;
                  if (f.type === 'toggle') return <div key={f.key} className="f full"><Toggle label={f.label} value={getK(edit, f.key)} onChange={set(f.key)} />{f.hint && <span className="hint">{f.hint}</span>}</div>;
                  if (f.type === 'image') return <ImageField {...p} full />;
                  if (f.type === 'file') return <ImageField {...p} type="all" full />;
                  if (f.type === 'files') return <FileList {...p} />;
                  if (f.type === 'date') return <DateField {...p} />;
                  return <Text {...p} type={f.type === 'number' ? 'number' : 'text'} required={f.required} />;
                })}
              </div>
            </div>
            <div className="panel__foot">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn--green btn--sm" disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

const pub = (it) => <span className={`badge badge--${it.published ? 'yes' : 'no'}`}>{it.published ? 'Published' : 'Hidden'}</span>;

export const Testimonials = () => (
  <Collection
    endpoint="/testimonials"
    singular="Testimonial"
    intro="Only add genuine testimonials you have permission to publish. Text testimonials and uploaded letters appear on the Testimonials page (the two letters from the old website are always shown)."
    blank={{ name: '', designation: '', organization: '', quote: '', rating: '', photo: '', logo: '', videoUrl: '', serviceSlug: '', order: 100, published: false }}
    fields={[
      { key: 'name', label: 'Name *', required: true },
      { key: 'designation', label: 'Designation' },
      { key: 'organization', label: 'Organisation', full: true },
      { key: 'quote', label: 'Testimonial text', type: 'area', full: true, hint: 'Either type the testimonial, or upload the signed letter below' },
      { key: 'letter', label: 'Testimonial letter (scan / photo)', type: 'image' },
      { key: 'serviceSlug', label: 'Related service slug', hint: 'Optional, e.g. green-audits – shows on that service page' },
      { key: 'order', label: 'Order', type: 'number' },
      { key: 'videoUrl', label: 'Video testimonial (optional)', hint: 'YouTube link, or upload an MP4 in Media and paste its path', full: true },
      { key: 'photo', label: 'Photo (with permission)', type: 'image' },
      { key: 'logo', label: 'Organisation logo (with permission)', type: 'image' },
      { key: 'published', label: 'Published on website', type: 'toggle' },
    ]}
    columns={[
      { label: 'Name', render: (t) => <><b>{t.name}</b><div className="muted">{[t.designation, t.organization].filter(Boolean).join(', ')}</div></> },
      { label: 'Quote', render: (t) => <span className="muted">{t.quote.slice(0, 90)}…</span> },
      { label: 'Status', render: pub },
    ]}
  />
);

export const Clients = () => (
  <Collection
    endpoint="/clients"
    singular="Client logo"
    intro="Add logos only for clients who have agreed to be listed. The client logo strip is hidden until at least one logo is published."
    blank={{ name: '', logo: '', website: '', order: 100, published: true }}
    fields={[
      { key: 'name', label: 'Client name *', required: true },
      { key: 'website', label: 'Website' },
      { key: 'logo', label: 'Logo *', type: 'image' },
      { key: 'order', label: 'Order', type: 'number' },
      { key: 'published', label: 'Published on website', type: 'toggle' },
    ]}
    columns={[
      { label: 'Logo', render: (c) => <img src={fileUrl(c.logo)} alt="" style={{ height: 36, width: 'auto', maxWidth: 120, objectFit: 'contain' }} /> },
      { label: 'Name', render: (c) => <b>{c.name}</b> },
      { label: 'Status', render: pub },
    ]}
  />
);

export const AccreditationsAdmin = () => (
  <Collection
    endpoint="/accreditations"
    singular="Accreditation"
    intro="Publish only accreditations, memberships and approvals backed by a certificate. Scope text must match the certificate exactly."
    blank={{ title: '', body: '', shortName: '', registrationNo: '', standard: '', scope: '', validFrom: null, validUntil: null, description: '', logo: '', certificateFiles: [], verifyUrl: '', order: 100, published: false, adminNote: '' }}
    fields={[
      { key: 'title', label: 'Title *', required: true, full: true },
      { key: 'body', label: 'Accreditation body', full: true },
      { key: 'shortName', label: 'Short name (e.g. NABCB)' },
      { key: 'registrationNo', label: 'Registration no.' },
      { key: 'standard', label: 'Standard (e.g. ISO/IEC 17020)' },
      { key: 'verifyUrl', label: 'Verification URL' },
      { key: 'scope', label: 'Scope', type: 'area', rows: 2, full: true },
      { key: 'validFrom', label: 'Valid from', type: 'date' },
      { key: 'validUntil', label: 'Valid until', type: 'date' },
      { key: 'description', label: 'Description', type: 'area', rows: 3, full: true },
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'certificateFiles', label: 'Certificate pages (images or PDF)', type: 'files' },
      { key: 'order', label: 'Order', type: 'number' },
      { key: 'adminNote', label: 'Internal note', type: 'area', rows: 2, full: true },
      { key: 'published', label: 'Published on website', type: 'toggle' },
    ]}
    columns={[
      { label: 'Accreditation', render: (a) => <><b>{a.title}</b><div className="muted">{a.body}</div></> },
      { label: 'Reg. no.', render: (a) => <span style={{ fontFamily: 'var(--mono)' }}>{a.registrationNo || '—'}</span> },
      { label: 'Valid until', render: (a) => d10(a.validUntil) },
      { label: 'Status', render: pub },
    ]}
  />
);

export const Certificates = () => (
  <Collection
    endpoint="/certificates"
    singular="Certificate"
    publishKey={null}
    intro="Certificates and inspection reports issued by Aspira. Anyone can verify a record on the public Certificate Status page by entering its exact number – the full list is never public."
    blank={{ certificateNo: '', organization: '', location: '', service: '', scope: '', rating: '', issueDate: null, expiryDate: null, status: 'valid', file: '', publicFile: false }}
    fields={[
      { key: 'certificateNo', label: 'Certificate / report no. *', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['valid', 'suspended', 'withdrawn', 'expired'] },
      { key: 'organization', label: 'Organisation *', required: true, full: true },
      { key: 'location', label: 'Location' },
      { key: 'service', label: 'Service' },
      { key: 'scope', label: 'Scope', type: 'area', rows: 2, full: true },
      { key: 'rating', label: 'Rating / outcome', hint: 'e.g. hygiene rating result' },
      { key: 'issueDate', label: 'Issue date', type: 'date' },
      { key: 'expiryDate', label: 'Expiry date', type: 'date' },
      { key: 'file', label: 'Certificate file', type: 'file' },
      { key: 'publicFile', label: 'Allow the file to be viewed on the verification page', type: 'toggle' },
    ]}
    columns={[
      { label: 'Number', render: (c) => <span style={{ fontFamily: 'var(--mono)' }}>{c.certificateNo}</span> },
      { label: 'Organisation', render: (c) => <><b>{c.organization}</b><div className="muted">{c.service}</div></> },
      { label: 'Expiry', render: (c) => d10(c.expiryDate) },
      { label: 'Status', render: (c) => <span className={`badge badge--${c.status}`}>{c.status}</span> },
    ]}
  />
);

const SERVICE_OPTS = [
  { value: '', label: '— none —' },
  { value: 'green-audits', label: 'Green Audits' },
  { value: 'hygiene-rating-audits', label: 'Hygiene Rating Audits' },
  { value: 'safety-audits', label: 'Safety Audits' },
  { value: 'fire-safety-audits', label: 'Fire Safety Audits' },
  { value: 'electrical-safety-audits', label: 'Electrical Safety Audits' },
  { value: 'construction-safety-audits', label: 'Construction Safety Audits' },
  { value: 'workplace-safety-audits', label: 'Workplace Safety Audits' },
  { value: 'warehouse-safety-audits', label: 'Warehouse Safety Audits' },
  { value: 'energy-audits', label: 'Energy Audits' },
  { value: 'water-audits', label: 'Water Audits' },
  { value: 'green-building-assessments', label: 'Green Building Assessments' },
];
const stat = (it) => <span className={`badge badge--${it.status}`}>{it.status}</span>;

export const Posts = () => (
  <Collection
    endpoint="/posts"
    singular="Article"
    viewPath={(p) => `/blog/${p.slug}`}
    intro="Educational articles about green audits, hygiene rating, accreditation and safety. Published articles appear on /blog and in sitemap.xml."
    blank={{ title: '', slug: '', category: 'Green Audits', excerpt: '', content: '', coverImage: '', author: 'Aspira Certifications Team', serviceSlug: '', publishedAt: null, status: 'draft', seo: { title: '', description: '' } }}
    fields={[
      { key: 'title', label: 'Title *', required: true, full: true },
      { key: 'slug', label: 'URL slug', hint: 'Leave empty to create from the title – /blog/your-slug' },
      { key: 'category', label: 'Category', type: 'select', options: ['Green Audits', 'Hygiene Rating', 'Food Safety', 'Accreditation', 'Safety', 'Energy & Water', 'Company News'] },
      { key: 'author', label: 'Author' },
      { key: 'publishedAt', label: 'Publish date', type: 'date' },
      { key: 'serviceSlug', label: 'Related service (adds an enquiry button)', type: 'select', options: SERVICE_OPTS },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
      { key: 'excerpt', label: 'Summary (shown on cards and as meta description fallback)', type: 'area', rows: 2, full: true },
      { key: 'content', label: 'Article content', type: 'area', rows: 16, full: true, hint: 'Formatting: ## Heading, ### Sub-heading, - bullet, 1. numbered, **bold**, *italic*, [link text](https://…). Leave a blank line between paragraphs.' },
      { key: 'coverImage', label: 'Featured image', type: 'image' },
      { key: 'seo.title', label: 'SEO title (optional)', full: true },
      { key: 'seo.description', label: 'Meta description (optional)', type: 'area', rows: 2, full: true },
    ]}
    columns={[
      { label: 'Article', render: (p) => <><b>{p.title}</b><div className="muted">/blog/{p.slug}</div></> },
      { label: 'Category', render: (p) => p.category },
      { label: 'Published', render: (p) => d10(p.publishedAt) },
      { label: 'Status', render: stat },
    ]}
  />
);

export const CaseStudiesAdmin = () => (
  <Collection
    endpoint="/case-studies"
    singular="Case study"
    viewPath={(c) => `/case-studies/${c.slug}`}
    intro="Only real projects completed by Aspira. A case study cannot be published until you confirm the client has given permission."
    note="Do not publish fictional projects, results or client names. Include client details only where the client has approved them."
    blank={{ title: '', slug: '', client: '', clientType: '', location: '', serviceSlug: 'green-audits', summary: '', requirement: '', approach: '', findings: '', outcomes: [], coverImage: '', gallery: [], completedOn: null, permissionConfirmed: false, status: 'draft', order: 100 }}
    fields={[
      { key: 'title', label: 'Title *', required: true, full: true },
      { key: 'client', label: 'Client name (only with permission)' },
      { key: 'clientType', label: 'Client type', hint: 'e.g. Engineering college, Restaurant' },
      { key: 'location', label: 'Location' },
      { key: 'serviceSlug', label: 'Service', type: 'select', options: SERVICE_OPTS },
      { key: 'completedOn', label: 'Completed on', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
      { key: 'summary', label: 'Summary', type: 'area', rows: 2, full: true },
      { key: 'requirement', label: "Client's requirement", type: 'area', rows: 4, full: true },
      { key: 'approach', label: 'Audit process followed', type: 'area', rows: 4, full: true },
      { key: 'findings', label: 'Key findings', type: 'area', rows: 4, full: true },
      { key: 'outcomes', label: 'Outcomes & improvements', type: 'list', addLabel: 'Add outcome' },
      { key: 'coverImage', label: 'Cover image', type: 'image' },
      { key: 'gallery', label: 'Project images', type: 'files' },
      { key: 'permissionConfirmed', label: 'The client has given permission to publish these details', type: 'toggle' },
    ]}
    columns={[
      { label: 'Case study', render: (c) => <><b>{c.title}</b><div className="muted">{[c.clientType, c.location].filter(Boolean).join(' · ')}</div></> },
      { label: 'Permission', render: (c) => <span className={`badge badge--${c.permissionConfirmed ? 'yes' : 'no'}`}>{c.permissionConfirmed ? 'Confirmed' : 'Not confirmed'}</span> },
      { label: 'Status', render: stat },
    ]}
  />
);

export const ResourcesAdmin = () => (
  <Collection
    endpoint="/resources"
    singular="Resource"
    intro="Learning resources shown on Insights & guides (/resources) – technical guides, checklists and guidelines for audits. Visitors give their name and email before downloading; each request appears under Enquiries as a “download” lead."
    note="Use only approved company documents. To replace a document, edit it and choose the new file."
    blank={{ title: '', description: '', category: 'Technical guides', file: '', fileType: 'PDF', fileSize: '', serviceSlug: '', order: 100, published: false }}
    fields={[
      { key: 'title', label: 'Title *', required: true, full: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Technical guides', 'Checklists', 'Guidelines', 'Green Audit', 'Hygiene Rating', 'Safety Audits', 'Energy & Water', 'Brochures', 'Other'] },
      { key: 'serviceSlug', label: 'Related service', type: 'select', options: SERVICE_OPTS },
      { key: 'description', label: 'Description', type: 'area', rows: 3, full: true },
      { key: 'file', label: 'Document file *', type: 'file' },
      { key: 'fileType', label: 'File type label', hint: 'e.g. PDF' },
      { key: 'fileSize', label: 'File size label', hint: 'e.g. 1.2 MB' },
      { key: 'order', label: 'Order', type: 'number' },
      { key: 'published', label: 'Published (visible for download)', type: 'toggle' },
    ]}
    columns={[
      { label: 'Document', render: (r) => <><b>{r.title}</b><div className="muted">{r.category}</div></> },
      { label: 'Downloads', render: (r) => r.downloads || 0 },
      { label: 'Status', render: pub },
    ]}
  />
);

/* ---------------- Careers: job openings ---------------- */
export const JobsAdmin = () => (
  <Collection
    endpoint="/jobs"
    singular="Opening"
    intro="Published openings with status “Open” appear on the Careers page. Visitors can always send a general application even when there are no openings."
    blank={{ title: '', department: '', location: '', employmentType: 'Full-time', experience: '', summary: '', description: '', requirements: [], status: 'open', order: 100, published: false }}
    fields={[
      { key: 'title', label: 'Job title *', required: true, full: true },
      { key: 'department', label: 'Department' },
      { key: 'location', label: 'Location', hint: 'e.g. Chennai / On-site' },
      { key: 'employmentType', label: 'Employment type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
      { key: 'experience', label: 'Experience', hint: 'e.g. 2–4 years' },
      { key: 'summary', label: 'Short summary', type: 'area', rows: 2, full: true, hint: 'One or two lines shown in the list' },
      { key: 'description', label: 'Full description (Markdown)', type: 'area', rows: 8, full: true },
      { key: 'requirements', label: 'Requirements', type: 'list', full: true, addLabel: 'Add requirement' },
      { key: 'status', label: 'Status', type: 'select', options: ['open', 'closed'] },
      { key: 'order', label: 'Order', type: 'number' },
      { key: 'published', label: 'Show on website', type: 'toggle' },
    ]}
    columns={[
      { label: 'Title', render: (it) => <><b>{it.title}</b><div className="muted">{[it.location, it.employmentType].filter(Boolean).join(' · ')}</div></> },
      { label: 'Status', render: (it) => <span className={`badge badge--${it.status === 'open' ? 'yes' : 'no'}`}>{it.status}</span> },
      { label: 'Website', render: pub },
    ]}
    viewPath={() => '/careers'}
  />
);

/* ---------------- Policies ---------------- */
export const PoliciesAdmin = () => (
  <Collection
    endpoint="/policies"
    singular="Policy"
    intro="Published policies are listed on /policies. Paste the approved text (Markdown supported) and/or upload the signed PDF. “Complaints & Appeals” is always listed and links to its own page."
    blank={{ title: '', slug: '', summary: '', content: '', file: '', version: '', effectiveDate: '', order: 100, published: false }}
    fields={[
      { key: 'title', label: 'Title *', required: true },
      { key: 'slug', label: 'URL slug', hint: 'Leave empty to create it from the title' },
      { key: 'summary', label: 'Short summary', type: 'area', rows: 2, full: true },
      { key: 'content', label: 'Policy text (Markdown)', type: 'area', rows: 14, full: true, hint: 'Use ## for headings and - for bullet points' },
      { key: 'file', label: 'PDF version (optional)', type: 'file', full: true },
      { key: 'version', label: 'Version', hint: 'e.g. 1.0 or Issue 02' },
      { key: 'effectiveDate', label: 'Effective date', type: 'date' },
      { key: 'order', label: 'Order', type: 'number' },
      { key: 'published', label: 'Show on website', type: 'toggle' },
    ]}
    columns={[
      { label: 'Policy', render: (it) => <><b>{it.title}</b><div className="muted">/policies/{it.slug}</div></> },
      { label: 'Version', render: (it) => <span className="muted">{[it.version, it.effectiveDate && d10(it.effectiveDate)].filter(Boolean).join(' · ') || '—'}</span> },
      { label: 'Status', render: pub },
    ]}
    viewPath={(it) => `/policies/${it.slug}`}
  />
);

/* ---------------- Gallery ---------------- */
function BulkPhotoUpload({ onDone }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    try {
      let added = 0;
      for (let i = 0; i < files.length; i += 10) {
        const fd = new FormData();
        files.slice(i, i + 10).forEach((f) => fd.append('files', f));
        const media = await api('/media', { method: 'POST', body: fd, auth: true });
        for (const m of media) {
          const title = (m.originalName || '').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
          await api('/gallery', { method: 'POST', body: { image: m.url, title, published: true }, auth: true });
          added++;
        }
      }
      toast(`${added} photo${added === 1 ? '' : 's'} added to the gallery`);
      onDone();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={pick} />
      <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => input.current?.click()}><ImagePlus size={15} /> {busy ? 'Uploading…' : 'Upload photos'}</button>
    </>
  );
}

export function GalleryAdmin() {
  const [n, setN] = useState(0);
  return (
    <Collection
      endpoint="/gallery"
      singular="Photo"
      refresh={n}
      extra={<BulkPhotoUpload onDone={() => setN((x) => x + 1)} />}
      intro="Only use genuine photos you have the right to publish (your own audits, team and events). Use “Upload photos” to add several at once, then edit each one to add a title, caption and category."
      blank={{ title: '', caption: '', image: '', category: '', takenAt: '', order: 100, published: true }}
      fields={[
        { key: 'image', label: 'Photo *', type: 'image', full: true },
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category', hint: 'e.g. Green audits, Hygiene audits, Team, Events' },
        { key: 'caption', label: 'Caption', type: 'area', rows: 2, full: true },
        { key: 'takenAt', label: 'Date taken', type: 'date' },
        { key: 'order', label: 'Order', type: 'number' },
        { key: 'published', label: 'Show on website', type: 'toggle' },
      ]}
      columns={[
        { label: 'Photo', render: (it) => <img src={fileUrl(it.image)} alt="" style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: 6, display: 'block' }} /> },
        { label: 'Title', render: (it) => <><b>{it.title || '—'}</b><div className="muted">{it.category}</div></> },
        { label: 'Status', render: pub },
      ]}
      viewPath={() => '/gallery'}
    />
  );
}
