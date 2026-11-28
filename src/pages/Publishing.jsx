import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Download, FileText, MapPin, User, Building, Check, ExternalLink, X, Eye } from 'lucide-react';
import { useFetch, useSite } from '../context/SiteContext';
import { api, fileUrl, isApiDown } from '../lib/api';
import { Markdown } from '../lib/markdown';
import { FALLBACK_POSTS, FALLBACK_RESOURCES } from '../lib/fallback';
import Seo, { breadcrumbSchema } from '../components/Seo';
import { PageHero, Reveal, Loader, SectionHead, NABCB_VERIFY_URL } from '../components/ui';
import { imgSize, CtaBand, ServiceAccreditation } from '../components/Sections';
import EnquiryForm from '../components/EnquiryForm';
import NotFound from './NotFound';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
const apiDown = isApiDown;
const readMins = (t = '') => Math.max(1, Math.round(String(t).split(/\s+/).length / 200));
const SITE = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');

/* ---------------- cards ---------------- */
export function PostCard({ p }) {
  return (
    <Reveal as="article" className="post-card">
      <Link to={`/blog/${p.slug}`} className="post-card__img">
        {p.coverImage ? <img src={imgSize(p.coverImage, 700)} alt="" loading="lazy" width="700" height="400" /> : <span className="post-card__ph"><FileText size={28} /></span>}
      </Link>
      <div className="post-card__body">
        <span className="post-card__cat">{p.category}</span>
        <h3><Link to={`/blog/${p.slug}`}>{p.title}</Link></h3>
        <p>{p.excerpt}</p>
        <span className="post-card__meta"><CalendarDays size={13} /> {fmt(p.publishedAt)} · {p.author}</span>
      </div>
    </Reveal>
  );
}

export function CaseCard({ c }) {
  return (
    <Reveal as="article" className="post-card">
      <Link to={`/case-studies/${c.slug}`} className="post-card__img">
        {c.coverImage ? <img src={imgSize(c.coverImage, 700)} alt="" loading="lazy" width="700" height="400" /> : <span className="post-card__ph"><Building size={28} /></span>}
      </Link>
      <div className="post-card__body">
        <span className="post-card__cat">{c.clientType || 'Case study'}</span>
        <h3><Link to={`/case-studies/${c.slug}`}>{c.title}</Link></h3>
        <p>{c.summary}</p>
        <span className="post-card__meta">{c.location && <><MapPin size={13} /> {c.location}</>}{c.completedOn && <> · {fmt(c.completedOn)}</>}</span>
      </div>
    </Reveal>
  );
}

/* ---------------- Blog list ---------------- */
export function Blog() {
  const { data, loading, error } = useFetch('/posts');
  const posts = data || (apiDown(error) ? FALLBACK_POSTS : []);
  const [cat, setCat] = useState('All');
  // "Safety audits" tab is always offered (client doc); it collects every safety-related article
  const cats = useMemo(() => {
    const c = [...new Set(posts.map((p) => p.category).filter(Boolean))];
    if (!c.some((x) => /safety/i.test(x))) c.push('Safety audits');
    return ['All', ...c];
  }, [posts]);
  const list = posts.filter((p) => cat === 'All' || p.category === cat || (cat === 'Safety audits' && /safety/i.test(`${p.category} ${p.title}`)));
  return (
    <>
      <Seo title="Blog – Green Audits, Hygiene Rating & Safety Guides" description="Practical guides on green audits for educational institutions, FSSAI hygiene rating for restaurants, accreditation and workplace safety." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])} />
      <PageHero crumbs={[{ label: 'Blog' }]} pageKey="blog" primary={{ to: '/contact?intent=expert#enquiry', label: 'Talk to an auditor' }} image="https://images.unsplash.com/photo-1583373834259-46cc92173cb7?auto=format&fit=crop&w=1600&q=70" eyebrow="Insights" title={<>Guides for institutions & <em className="accent">food businesses</em></>} intro="Practical articles on green audits, hygiene rating, accreditation and safety — written by the Aspira team." />
      <section className="section">
        <div className="container">
          {cats.length > 2 && (
            <div className="filter-tabs" role="group" aria-label="Filter by category">
              {cats.map((c) => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          )}
          {loading && !posts.length ? <Loader /> : list.length ? (
            <div className="post-grid">{list.map((p) => <PostCard key={p.slug} p={p} />)}</div>
          ) : (
            <div className="empty">{cat === 'All' ? 'No articles published yet.' : 'No articles in this category yet.'}</div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}

/* ---------------- Blog article ---------------- */
export function BlogPost() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(`/posts/${slug}`, [slug]);
  const { services } = useSite();
  const p = data || (apiDown(error) ? FALLBACK_POSTS.find((x) => x.slug === slug) : null);
  if (loading && !p) return <Loader />;
  if (!p) return <NotFound />;
  const svc = services.find((s) => s.slug === p.serviceSlug);
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.seo?.description || p.excerpt,
      image: p.coverImage ? [fileUrl(p.coverImage)] : undefined,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt || p.publishedAt,
      author: { '@type': 'Organization', name: p.author || 'Aspira Certifications' },
      publisher: { '@id': `${SITE}/#organization` },
      mainEntityOfPage: `${SITE}/blog/${p.slug}`,
    },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: p.title, path: `/blog/${p.slug}` }]),
  ];
  return (
    <>
      <Seo title={p.seo?.title || p.title} description={p.seo?.description || p.excerpt} image={p.coverImage} type="article" jsonLd={ld} />
      <PageHero crumbs={[{ label: 'Blog', to: '/blog' }, { label: p.category }]} eyebrow={p.category} title={p.title} intro={p.excerpt} image={p.coverImage} />
      <section className="section">
        <div className="container detail">
          <article className="article">
            <div className="article__meta">
              <span><User size={14} /> {p.author}</span>
              <span><CalendarDays size={14} /> {fmt(p.publishedAt)}</span>
              <span>{readMins(p.content)} min read</span>
            </div>
            <Markdown text={p.content} />
            {svc && (
              <div className="article__cta">
                <div><b>{svc.ctaLabel || `Enquire about ${svc.title}`}</b><span>{svc.audience || svc.shortDescription}</span></div>
                <Link to={`/services/${svc.slug}#enquire`} className="btn btn--green btn--sm">{svc.ctaLabel || 'Enquire now'} <ArrowRight size={15} /></Link>
              </div>
            )}
          </article>
          <aside className="detail__aside">
            {svc && <ServiceAccreditation slug={svc.slug} />}
            <EnquiryForm compact title="Talk to our experts" intent="expert" service={svc?.title || ''} serviceSlug={svc?.slug || ''} variant={svc?.formType || 'default'} submitLabel="Request a call back" />
            {p.related?.length > 0 && (
              <div className="detail__toc">
                <h6>Related articles</h6>
                {p.related.map((r) => <Link key={r.slug} to={`/blog/${r.slug}`}>{r.title}</Link>)}
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

/* ---------------- Case studies ---------------- */
export function CaseStudies() {
  const { data, loading, error } = useFetch('/case-studies');
  const items = data || [];
  if (!loading && !items.length) return <Navigate to="/" replace />; // hidden until a case study is published
  return (
    <>
      <Seo title="Case Studies" description="Verified audit projects completed by Aspira Certifications for educational institutions, restaurants and businesses." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Case studies', path: '/case-studies' }])} />
      <PageHero crumbs={[{ label: 'Case studies' }]} pageKey="caseStudies" image="https://images.unsplash.com/photo-1774599730788-a74cd9253b56?auto=format&fit=crop&w=1600&q=70" eyebrow="Case studies" title={<>Real audits, <em className="accent">real improvements</em></>} intro="Projects published here are genuine Aspira engagements, shared with our clients’ permission." />
      <section className="section">
        <div className="container">
          {loading ? <Loader /> : items.length ? (
            <div className="post-grid">{items.map((c) => <CaseCard key={c._id} c={c} />)}</div>
          ) : (
            <div className="empty empty--lg">
              <Building size={30} />
              <h3>Case studies coming soon</h3>
              <p>We publish case studies only with our clients’ permission. {apiDown(error) ? '' : 'Check back soon, or talk to us about our experience in your sector.'}</p>
              <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/services/green-audits" className="btn btn--sm">Green Audits for institutions</Link>
                <Link to="/services/hygiene-rating-audits" className="btn btn--ghost btn--sm">Hygiene Rating for restaurants</Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}

export function CaseStudy() {
  const { slug } = useParams();
  const { data: c, loading } = useFetch(`/case-studies/${slug}`, [slug]);
  const { services } = useSite();
  if (loading) return <Loader />;
  if (!c) return <NotFound />;
  const svc = services.find((s) => s.slug === c.serviceSlug);
  const block = (id, title, text) =>
    text ? (
      <section className="block" id={id}>
        <h2>{title}</h2>
        <Markdown text={text} />
      </section>
    ) : null;
  return (
    <>
      <Seo title={c.title} description={c.summary} image={c.coverImage} type="article" jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Case studies', path: '/case-studies' }, { name: c.title, path: `/case-studies/${c.slug}` }])} />
      <PageHero crumbs={[{ label: 'Case studies', to: '/case-studies' }, { label: c.title }]} eyebrow={c.clientType || 'Case study'} title={c.title} intro={c.summary} image={c.coverImage} />
      <section className="section">
        <div className="container detail">
          <article className="article">
            <div className="case-facts">
              {c.client && <div><small>Client</small><b>{c.client}</b></div>}
              {c.clientType && <div><small>Sector</small><b>{c.clientType}</b></div>}
              {c.location && <div><small>Location</small><b>{c.location}</b></div>}
              {svc && <div><small>Service</small><b><Link to={`/services/${svc.slug}`}>{svc.title}</Link></b></div>}
              {c.completedOn && <div><small>Completed</small><b>{fmt(c.completedOn)}</b></div>}
            </div>
            {block('requirement', 'The requirement', c.requirement)}
            {block('approach', 'Our audit approach', c.approach)}
            {block('findings', 'Key findings', c.findings)}
            {c.outcomes?.length > 0 && (
              <section className="block">
                <h2>Outcomes & improvements</h2>
                <ul className="check-list check-list--one">{c.outcomes.map((o) => <li key={o}><Check size={17} strokeWidth={2.4} /> <span>{o}</span></li>)}</ul>
              </section>
            )}
            {c.gallery?.length > 0 && (
              <section className="block">
                <h2>Project images</h2>
                <div className="gallery">{c.gallery.map((g) => <a key={g} href={fileUrl(g)} target="_blank" rel="noopener noreferrer"><img src={imgSize(g, 600)} alt="" loading="lazy" /></a>)}</div>
              </section>
            )}
          </article>
          <aside className="detail__aside">
            <EnquiryForm compact title={svc?.ctaLabel || 'Enquire about a similar audit'} intent="booking" service={svc?.title || ''} serviceSlug={svc?.slug || ''} variant={svc?.formType || 'default'} lockService={!!svc} />
          </aside>
        </div>
      </section>
    </>
  );
}

/* ---------------- Insights & guides (gated learning resources) ---------------- */
const API_BASE = import.meta.env.VITE_API_URL || '';

/** Asks for name + email, records the request, then starts the download */
const CONTACT_KEY = 'aspira_resource_contact';
const savedContact = () => {
  try { return JSON.parse(localStorage.getItem(CONTACT_KEY) || 'null') || {}; } catch { return {}; }
};
/** checklist = downloadable; guide = view online only (matches the server's rule when the admin hasn't chosen) */
export const resourceKind = (r) => r.kind || r.docType || (/checklist/i.test(`${r.title || ''} ${r.category || ''}`) ? 'checklist' : 'guide');

/** Name + email before a checklist download or opening a guide; remembered for next time */
function DownloadGate({ r, onClose }) {
  const navigate = useNavigate();
  const guide = resourceKind(r) === 'guide';
  const [v, setV] = useState(() => ({ name: '', email: '', organization: '', ...savedContact(), website: '' }));
  const [st, setSt] = useState({ s: 'idle' });
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (v.name.trim().length < 2) return setSt({ s: 'err', msg: 'Please enter your name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) return setSt({ s: 'err', msg: 'Please enter a valid email address.' });
    setSt({ s: 'sending' });
    try {
      const res = await api(`/resources/${r._id}/request`, { method: 'POST', body: v });
      try { localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: v.name.trim(), email: v.email.trim(), organization: v.organization.trim() })); } catch { /* ignore */ }
      if (res.view) {
        onClose();
        navigate(res.view);
        return;
      }
      window.location.assign(`${API_BASE}${res.url}`);
      setSt({ s: 'done' });
    } catch (err) {
      setSt({ s: 'err', msg: err.message || (guide ? 'Could not open the guide. Please try again.' : 'Could not start the download. Please try again.') });
    }
  }
  return (
    <div className="dg" role="dialog" aria-modal="true" aria-labelledby="dg-title" onClick={onClose}>
      <form className="dg__card" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <button type="button" className="dg__x" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <span className="dg__ic">{guide ? <Eye size={22} /> : <FileText size={22} />}</span>
        <h2 id="dg-title">{guide ? 'View' : 'Download'} “{r.title}”</h2>
        <p>{guide ? 'Please share your name and email to read this guide online.' : 'Please share your name and email to download this checklist.'}</p>
        {st.s === 'done' ? (
          <div className="alert alert--ok" role="status"><Check size={17} /> Thank you – your download has started.</div>
        ) : (
          <>
            <label><b>Your name <i aria-hidden="true">*</i></b><input value={v.name} onChange={set('name')} autoComplete="name" maxLength={120} required /></label>
            <label><b>Email <i aria-hidden="true">*</i></b><input type="email" value={v.email} onChange={set('email')} autoComplete="email" maxLength={160} required /></label>
            <label><b>Organisation <small>(optional)</small></b><input value={v.organization} onChange={set('organization')} autoComplete="organization" maxLength={160} /></label>
            <input className="hp" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} aria-hidden="true" />
            {st.s === 'err' && <div className="alert alert--err" role="alert">{st.msg}</div>}
            <button className="btn btn--green" disabled={st.s === 'sending'}>
              {guide ? <Eye size={16} /> : <Download size={16} />} {st.s === 'sending' ? (guide ? 'Opening…' : 'Preparing…') : (guide ? 'View guide' : 'Download checklist')}
            </button>
            <small className="dg__note">We use these details only to share relevant updates from Aspira. See our <Link to="/policies" onClick={onClose}>policies</Link>.</small>
          </>
        )}
      </form>
    </div>
  );
}

export function Resources() {
  const { data, loading, error } = useFetch('/resources');
  const items = data || (apiDown(error) ? FALLBACK_RESOURCES : []);
  const [cat, setCat] = useState('All');
  const [gate, setGate] = useState(null);
  const cats = useMemo(() => ['All', ...new Set(items.map((r) => r.category).filter(Boolean))], [items]);
  const list = items.filter((r) => cat === 'All' || r.category === cat);
  const canGate = (r) => r._id && !String(r._id).startsWith('local-');
  return (
    <>
      <Seo title="Insights & Guides" description="Learning resources and technical guides on green audits, hygiene rating and safety audits from Aspira Certifications." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Insights & guides', path: '/resources' }])} />
      <PageHero crumbs={[{ label: 'Insights & guides' }]} pageKey="resources" primary={{ href: '#downloads', label: 'Explore resources' }} eyebrow="Insights & guides" title={<>Learning resources <em className="accent">for audits</em></>} intro="Technical guides, checklists and reference material to help you prepare for green, hygiene and safety audits." />
      <section className="section">
        <div className="container">
          {cats.length > 2 && (
            <div className="filter-tabs" role="group" aria-label="Filter by category">
              {cats.map((c) => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          )}
          {loading && !items.length ? <Loader /> : list.length ? (
            <div className="res-list" id="downloads">
              {list.map((r) => (
                <Reveal key={r._id || r.title} className="res">
                  <span className="res__ic"><FileText size={22} /></span>
                  <div className="res__body">
                    {r.category && <span className="post-card__cat">{r.category}</span>}
                    <h3>{r.title}</h3>
                    {r.description && <p>{r.description}</p>}
                    <small>{resourceKind(r) === 'guide' ? <span className="res__kind"><Eye size={13} /> Guide · view online</span> : <span className="res__kind res__kind--dl"><Download size={13} /> Checklist · {[r.fileType || 'PDF', r.fileSize].filter(Boolean).join(' · ')}</span>}</small>
                  </div>
                  {resourceKind(r) === 'guide'
                    ? (canGate(r)
                      ? <button type="button" className="btn btn--outline btn--sm" onClick={() => setGate(r)}><Eye size={15} /> View online</button>
                      : <span className="res__soon">Available online soon</span>)
                    : canGate(r)
                      ? <button type="button" className="btn btn--green btn--sm" onClick={() => setGate(r)}><Download size={15} /> Download</button>
                      : <a className="btn btn--green btn--sm" href={fileUrl(r.file)} target="_blank" rel="noopener noreferrer" download><Download size={15} /> Download</a>}
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="empty empty--lg" id="downloads">
              <FileText size={30} />
              <h3>Resources coming soon</h3>
              <p>We are preparing technical guides and checklists for green, hygiene and safety audits. Meanwhile, read our <Link to="/blog" style={{ textDecoration: 'underline' }}>blog</Link> or <Link to="/contact?intent=expert#enquiry" style={{ textDecoration: 'underline' }}>ask our team</Link>.</p>
            </div>
          )}
        </div>
      </section>
      {gate && <DownloadGate r={gate} onClose={() => setGate(null)} />}
      <CtaBand />
    </>
  );
}
