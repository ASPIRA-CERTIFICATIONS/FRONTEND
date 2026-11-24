/**
 * Careers, Gallery and Policies.
 * Deliberately quiet layout: one idea per section, generous whitespace, no competing visuals.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, MapPin, Briefcase, Clock, ChevronDown, UploadCloud, FileCheck2, X, CheckCircle2,
  AlertCircle, Download, ChevronLeft, ChevronRight, ScrollText, Mail,
} from 'lucide-react';
import Seo, { breadcrumbSchema } from '../components/Seo';
import { Loader } from '../components/ui';
import { Markdown } from '../lib/markdown';
import { api, fileUrl, isApiDown } from '../lib/api';
import { useSite, useFetch } from '../context/SiteContext';
import { isEmail, isMobile } from '../components/EnquiryForm';
import NotFound from './NotFound';
import { FALLBACK_POLICIES } from '../lib/fallback';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/** Calm page header – no photo, no cards. */
export function PageIntro({ eyebrow, title, lead, crumbs = [], wide = false }) {
  return (
    <header className="qi">
      <div className={`q-wrap ${wide ? 'q-wrap--wide' : ''}`}>
        <nav className="qi__crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span aria-hidden="true">/</span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        {eyebrow && <p className="qi__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="qi__lead">{lead}</p>}
      </div>
    </header>
  );
}

/* ============================== CAREERS ============================== */

const EXPERIENCE = ['Fresher', 'Less than 1 year', '1–2 years', '3–5 years', '6–10 years', 'More than 10 years'];
const MAX_MB = 5;
const OK_EXT = /\.(pdf|docx?|DOCX?|PDF)$/;

function JobRow({ job, onApply }) {
  const [open, setOpen] = useState(false);
  const meta = [job.department, job.location, job.employmentType, job.experience].filter(Boolean);
  return (
    <li className={`q-job ${open ? 'is-open' : ''}`}>
      <div className="q-job__row">
        <div className="q-job__main">
          <h3>{job.title}</h3>
          {meta.length > 0 && (
            <p className="q-job__meta">
              {job.location && <span><MapPin size={14} /> {job.location}</span>}
              {job.employmentType && <span><Clock size={14} /> {job.employmentType}</span>}
              {job.experience && <span><Briefcase size={14} /> {job.experience}</span>}
              {job.department && <span>{job.department}</span>}
            </p>
          )}
          {job.summary && <p className="q-job__sum">{job.summary}</p>}
        </div>
        <div className="q-job__actions">
          {(job.description || job.requirements?.length > 0) && (
            <button type="button" className="q-link" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {open ? 'Hide details' : 'View details'} <ChevronDown size={16} />
            </button>
          )}
          <button type="button" className="btn btn--sm" onClick={() => onApply(job)}>Apply <ArrowRight size={15} /></button>
        </div>
      </div>
      {open && (
        <div className="q-job__details">
          {job.description && <div className="prose"><Markdown text={job.description} /></div>}
          {job.requirements?.length > 0 && (
            <>
              <h4>What we're looking for</h4>
              <ul>{job.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}

function ResumeDrop({ file, onFile, error }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (f) => f && onFile(f);
  return (
    <div
      className={`q-drop ${over ? 'is-over' : ''} ${file ? 'has-file' : ''} ${error ? 'is-err' : ''}`}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => (e.preventDefault(), setOver(false), pick(e.dataTransfer.files?.[0]))}
    >
      <input ref={input} id="cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => pick(e.target.files?.[0])} className="sr-only" aria-describedby="cv-hint" />
      {file ? (
        <div className="q-drop__file">
          <FileCheck2 size={22} />
          <span><b>{file.name}</b><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></span>
          <button type="button" onClick={() => (onFile(null), input.current && (input.current.value = ''))} aria-label="Remove file"><X size={16} /></button>
        </div>
      ) : (
        <label htmlFor="cv" className="q-drop__empty">
          <UploadCloud size={26} />
          <span><b>Upload your resume</b> or drag it here</span>
          <small id="cv-hint">PDF, DOC or DOCX · up to {MAX_MB} MB</small>
        </label>
      )}
    </div>
  );
}

function ApplicationForm({ jobs, selected, setSelected, email }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', experience: '', location: '', qualification: '', linkedin: '', message: '', consent: false, website: '' });
  const [file, setFile] = useState(null);
  const [errs, setErrs] = useState({});
  const [state, setState] = useState({ s: 'idle' });
  const busy = useRef(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function setResume(fl) {
    setErrs((x) => ({ ...x, resume: undefined }));
    if (!fl) return setFile(null);
    if (!OK_EXT.test(fl.name)) return setErrs((x) => ({ ...x, resume: 'Please choose a PDF, DOC or DOCX file.' }));
    if (fl.size > MAX_MB * 1024 * 1024) return setErrs((x) => ({ ...x, resume: `The file is larger than ${MAX_MB} MB.` }));
    setFile(fl);
  }

  async function submit(e) {
    e.preventDefault();
    if (busy.current) return;
    const v = {};
    if (f.name.trim().length < 2) v.name = 'Please enter your full name.';
    if (!isEmail(f.email)) v.email = 'Please enter a valid email address.';
    if (!isMobile(f.phone)) v.phone = 'Please enter a valid 10-digit mobile number.';
    if (!file) v.resume = 'Please attach your resume.';
    if (!f.consent) v.consent = 'Please confirm you agree.';
    setErrs(v);
    if (Object.keys(v).length) return;
    busy.current = true;
    setState({ s: 'sending' });
    const fd = new FormData();
    Object.entries(f).forEach(([k, val]) => fd.append(k, typeof val === 'boolean' ? String(val) : val));
    if (selected?._id) fd.append('job', selected._id);
    fd.append('resume', file);
    try {
      const d = await api('/careers/apply', { method: 'POST', body: fd });
      setState({ s: 'done', ref: d.reference });
    } catch (err) {
      setState({ s: 'error', msg: isApiDown(err) ? null : err.message });
    } finally {
      busy.current = false;
    }
  }

  if (state.s === 'done') {
    return (
      <div className="q-done" role="status">
        <CheckCircle2 size={34} />
        <h3>Thank you – your application has been received.</h3>
        <p>Your reference is <b>{state.ref}</b>. Our team will review your resume and contact you if your profile matches a role.</p>
      </div>
    );
  }

  const field = (k, label, { full, ...props } = {}) => (
    <div className={`q-f ${errs[k] ? 'is-err' : ''} ${full ? 'full' : ''}`}>
      <label htmlFor={`ap-${k}`}>{label}</label>
      <input id={`ap-${k}`} value={f[k]} onChange={set(k)} aria-invalid={!!errs[k]} {...props} />
      {errs[k] && <span className="q-err">{errs[k]}</span>}
    </div>
  );

  return (
    <form className="q-form" onSubmit={submit} noValidate>
      <div className="q-grid">
        {field('name', 'Full name *', { autoComplete: 'name', maxLength: 120 })}
        {field('email', 'Email *', { type: 'email', autoComplete: 'email', maxLength: 160 })}
        {field('phone', 'Mobile number *', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 16 })}
        <div className="q-f">
          <label htmlFor="ap-job">Position</label>
          <select id="ap-job" value={selected?._id || ''} onChange={(e) => setSelected(jobs.find((j) => j._id === e.target.value) || null)}>
            <option value="">General application</option>
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
        </div>
        <div className="q-f">
          <label htmlFor="ap-experience">Experience</label>
          <select id="ap-experience" value={f.experience} onChange={set('experience')}>
            <option value="">Select</option>
            {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        {field('location', 'Current location', { maxLength: 120, autoComplete: 'address-level2' })}
        {field('qualification', 'Highest qualification', { maxLength: 160 })}
        {field('linkedin', 'LinkedIn profile (optional)', { type: 'url', maxLength: 300, placeholder: 'https://' })}
        <div className="q-f full">
          <label htmlFor="ap-message">Cover note (optional)</label>
          <textarea id="ap-message" rows={4} value={f.message} onChange={set('message')} maxLength={3000} placeholder="A few lines about you and the kind of role you are looking for." />
        </div>
        <div className="q-f full">
          <span className="q-label">Resume *</span>
          <ResumeDrop file={file} onFile={setResume} error={errs.resume} />
          {errs.resume && <span className="q-err">{errs.resume}</span>}
        </div>
      </div>
      <input className="hp" tabIndex={-1} autoComplete="off" name="website" value={f.website} onChange={set('website')} aria-hidden="true" />
      <label className={`q-check ${errs.consent ? 'is-err' : ''}`}>
        <input type="checkbox" checked={f.consent} onChange={set('consent')} />
        <span>I agree that Aspira Certifications may store my details and resume to consider me for current and future roles. See our <Link to="/policies">policies</Link>.</span>
      </label>
      {state.s === 'error' && (
        <div className="q-alert" role="alert">
          <AlertCircle size={18} />
          <span>{state.msg || <>We couldn't submit your application right now. Please email your resume to {email ? <a href={`mailto:${email}?subject=Job application`}>{email}</a> : 'us'}.</>}</span>
        </div>
      )}
      <div className="q-form__foot">
        <button className="btn" disabled={state.s === 'sending'}>{state.s === 'sending' ? 'Submitting…' : <>Submit application <ArrowRight size={16} /></>}</button>
        <small>We'll only use your details for recruitment.</small>
      </div>
    </form>
  );
}

export function Careers() {
  const { settings } = useSite();
  const res = useFetch('/jobs');
  const jobs = res.data || [];
  const [selected, setSelected] = useState(null);
  const formRef = useRef(null);
  const email = settings.contact?.emails?.[0];

  const apply = (job) => {
    setSelected(job);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Seo
        title="Careers"
        description="Careers at Aspira Certifications – see current openings at our NABCB-accredited inspection body in Chennai and submit your resume."
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Careers', path: '/careers' }])}
      />
      <PageIntro
        eyebrow="Careers"
        title="Work with Aspira Certifications"
        lead="We are an independent, NABCB-accredited inspection body based in Chennai. If you'd like to be part of our team, see our current openings or send us your resume."
        crumbs={[{ label: 'Careers' }]}
      />

      <section className="q-sec">
        <div className="q-wrap">
          <div className="q-head">
            <h2>Current openings</h2>
            {jobs.length > 0 && <span className="q-count">{jobs.length} open {jobs.length === 1 ? 'role' : 'roles'}</span>}
          </div>
          {res.loading ? (
            <Loader />
          ) : jobs.length === 0 ? (
            <div className="q-empty">
              <p>There are no open positions right now.</p>
              <p className="muted">You're welcome to send your resume below – we'll keep it on file and contact you when a suitable role opens.</p>
            </div>
          ) : (
            <ul className="q-jobs">{jobs.map((j) => <JobRow key={j._id} job={j} onApply={apply} />)}</ul>
          )}
        </div>
      </section>

      <section className="q-sec q-sec--alt" ref={formRef} id="apply">
        <div className="q-wrap q-split">
          <div className="q-split__aside">
            <h2>{selected ? `Apply for ${selected.title}` : 'Send your resume'}</h2>
            <ol className="q-steps">
              <li><b>Submit</b> your details and resume using this form.</li>
              <li><b>We review</b> every application we receive.</li>
              <li><b>We contact you</b> if your profile matches a current or upcoming role.</li>
            </ol>
            {email && <p className="q-note"><Mail size={15} /> <span>Prefer email? Send your resume to<br /><a href={`mailto:${email}?subject=Job application`}>{email}</a></span></p>}
          </div>
          <ApplicationForm jobs={jobs} selected={selected} setSelected={setSelected} email={email} />
        </div>
      </section>
    </>
  );
}

/* ============================== GALLERY ============================== */

function Lightbox({ items, index, onClose, onMove }) {
  const it = items[index];
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  }, [onClose, onMove]);
  if (!it) return null;
  return (
    <div className="q-lb" role="dialog" aria-modal="true" aria-label={it.title || 'Photo'} onClick={onClose}>
      <button type="button" className="q-lb__close" onClick={onClose} aria-label="Close"><X size={22} /></button>
      {items.length > 1 && <button type="button" className="q-lb__nav q-lb__nav--prev" onClick={(e) => (e.stopPropagation(), onMove(-1))} aria-label="Previous photo"><ChevronLeft size={26} /></button>}
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={fileUrl(it.image)} alt={it.title || it.caption || 'Gallery photo'} />
        {(it.title || it.caption) && <figcaption>{it.title && <b>{it.title}</b>}{it.caption && <span>{it.caption}</span>}<small>{index + 1} / {items.length}</small></figcaption>}
      </figure>
      {items.length > 1 && <button type="button" className="q-lb__nav q-lb__nav--next" onClick={(e) => (e.stopPropagation(), onMove(1))} aria-label="Next photo"><ChevronRight size={26} /></button>}
    </div>
  );
}

export function Gallery() {
  const res = useFetch('/gallery');
  const all = res.data || [];
  const cats = useMemo(() => [...new Set(all.map((x) => x.category).filter(Boolean))], [all]);
  const [cat, setCat] = useState('All');
  const items = cat === 'All' ? all : all.filter((x) => x.category === cat);
  const [open, setOpen] = useState(-1);
  const move = (d) => setOpen((i) => (i + d + items.length) % items.length);

  return (
    <>
      <Seo title="Gallery" description="Photos from Aspira Certifications' audits, inspections and events." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }])} />
      <PageIntro wide eyebrow="Gallery" title="Our work in pictures" lead="A look at our audits, inspections and the people behind them." crumbs={[{ label: 'Gallery' }]} />
      <section className="q-sec">
        <div className="q-wrap q-wrap--wide">
          {cats.length > 1 && (
            <div className="q-chips" role="tablist" aria-label="Filter photos">
              {['All', ...cats].map((c) => (
                <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          )}
          {res.loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <div className="q-empty q-empty--center"><p>Photos will be added here soon.</p></div>
          ) : (
            <div className="q-gallery">
              {items.map((it, i) => (
                <button type="button" key={it._id} className="q-gallery__item" onClick={() => setOpen(i)} aria-label={`Open photo${it.title ? `: ${it.title}` : ''}`}>
                  <img src={fileUrl(it.image)} alt={it.title || it.caption || ''} loading="lazy" />
                  {(it.title || it.category) && <span className="q-gallery__cap">{it.title || it.category}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {open >= 0 && <Lightbox items={items} index={open} onClose={() => setOpen(-1)} onMove={move} />}
    </>
  );
}

/* ============================== POLICIES ============================== */

const FIXED_POLICIES = [
  { slug: 'complaints-and-appeals', to: '/complaints-and-appeals', title: 'Complaints & Appeals', summary: 'How to raise a complaint or appeal a decision, and how we handle it.' },
];

export function Policies() {
  const res = useFetch('/policies');
  const docs = res.data || (isApiDown(res.error) ? FALLBACK_POLICIES : []);
  const list = [...docs.map((p) => ({ ...p, to: `/policies/${p.slug}` })), ...FIXED_POLICIES];
  return (
    <>
      <Seo title="Policies" description="Aspira Certifications' policies – impartiality, confidentiality, privacy, complaints and appeals." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Policies', path: '/policies' }])} />
      <PageIntro eyebrow="Policies" title="Our policies" lead="How we work as an independent inspection body – and how we treat the information you share with us." crumbs={[{ label: 'Policies' }]} />
      <section className="q-sec">
        <div className="q-wrap">
          {res.loading ? (
            <Loader />
          ) : (
            <ul className="q-docs">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link to={p.to} className="q-doc">
                    <span className="q-doc__ic"><ScrollText size={20} /></span>
                    <span className="q-doc__txt">
                      <b>{p.title}</b>
                      {p.summary && <span>{p.summary}</span>}
                      {(p.effectiveDate || p.version) && <small>{[p.version && `Version ${p.version}`, p.effectiveDate && `Effective ${fmtDate(p.effectiveDate)}`].filter(Boolean).join(' · ')}</small>}
                    </span>
                    <ArrowRight size={18} className="q-doc__go" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

export function PolicyDetail() {
  const { slug } = useParams();
  const { settings } = useSite();
  const res = useFetch(`/policies/${slug}`);
  if (res.loading) return <Loader />;
  const p = res.data || (isApiDown(res.error) ? FALLBACK_POLICIES.find((x) => x.slug === slug) : null);
  if (!p) return <NotFound />;
  const email = settings.contact?.emails?.[0];
  return (
    <>
      <Seo title={p.title} description={p.summary} path={`/policies/${p.slug}`} jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Policies', path: '/policies' }, { name: p.title, path: `/policies/${p.slug}` }])} />
      <PageIntro eyebrow="Policy" title={p.title} lead={p.summary} crumbs={[{ label: 'Policies', to: '/policies' }, { label: p.title }]} />
      <section className="q-sec">
        <div className="q-wrap"><div className="q-text">
          {(p.effectiveDate || p.version || p.file) && (
            <div className="q-docmeta">
              <span>{[p.version && `Version ${p.version}`, p.effectiveDate && `Effective ${fmtDate(p.effectiveDate)}`].filter(Boolean).join(' · ')}</span>
              {p.file && <a className="btn btn--sm btn--outline" href={fileUrl(p.file)} target="_blank" rel="noopener noreferrer"><Download size={15} /> Download PDF</a>}
            </div>
          )}
          {p.content ? <article className="prose"><Markdown text={p.content} /></article> : p.file ? <p>Please download the PDF above to read this policy.</p> : null}
          <p className="q-back">
            <Link to="/policies"><ArrowLeft size={16} /> All policies</Link>
            {email && <span>Questions? <a href={`mailto:${email}`}>{email}</a></span>}
          </p>
        </div></div>
      </section>
    </>
  );
}
