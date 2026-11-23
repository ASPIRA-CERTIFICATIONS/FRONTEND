import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Phone, FileCheck2, Scale, Lock, Download, ExternalLink, ShieldCheck, Award, Globe2, MessageCircle, GraduationCap, UtensilsCrossed, CalendarCheck, Headset, Play, Search } from 'lucide-react';
import { Icon } from '../lib/icons';
import { fileUrl } from '../lib/api';
import { useSite, useFetch } from '../context/SiteContext';
import { Reveal, SectionHead, BADGE_SRC } from './ui';
import { waLink } from '../lib/whatsapp';

export const imgSize = (url, w) => (/images\.unsplash\.com/.test(url || '') ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : fileUrl(url));

export function ServiceCard({ s, i = 0, feature = false }) {
  return (
    <Reveal delay={Math.min(i, 5) * 0.06} className={`svc-card ${feature ? 'svc-card--feature' : ''} ${s.image ? 'has-img' : ''}`} as="article">
      {s.image && (
        <div className="svc-card__img">
          <img src={imgSize(s.image, feature ? 1100 : 640)} alt="" loading="lazy" width="640" height="360" />
        </div>
      )}
      <div className="svc-card__body">
        <div className="svc-card__top">
          <span className="svc-card__ic"><Icon name={s.icon} size={24} /></span>
          <span className="svc-card__tag">{s.category}</span>
        </div>
        <h3>{s.title}</h3>
        <p>{s.shortDescription}</p>
        <span className="svc-card__more">Explore service <ArrowUpRight size={16} /></span>
      </div>
      <Link to={`/services/${s.slug}`} aria-label={s.title} className="svc-card__link" />
    </Reveal>
  );
}

export function Disciplines() {
  const { services } = useSite();
  const pick = (slug) => services.find((x) => x.slug === slug);
  const items = [
    { slug: 'green-audits', label: 'Sustainability', title: 'Green, energy & water', text: 'Green audits, energy and water audits and green building assessments.' },
    { slug: 'hygiene-rating-audits', label: 'Food safety', title: 'Hygiene rating', text: 'FSSAI Hygiene Rating Scheme audits for food businesses of every size.' },
    { slug: 'safety-audits', label: 'Safety', title: 'Workplace & site safety', text: 'Workplace, construction, fire, electrical and warehouse safety audits.' },
  ].map((d) => ({ ...d, svc: pick(d.slug) })).filter((d) => d.svc);
  if (!items.length) return null;
  return (
    <div className="disciplines">
      {items.map((d, i) => (
        <Reveal key={d.slug} delay={i * 0.08} className="discipline">
          {d.svc.image && <img src={imgSize(d.svc.image, 900)} alt="" loading="lazy" width="900" height="1100" />}
          <div className="discipline__body">
            <span className="discipline__label">0{i + 1} · {d.label}</span>
            <h3>{d.title}</h3>
            <p>{d.text}</p>
            <span className="discipline__more">Explore <ArrowUpRight size={16} /></span>
          </div>
          <Link to={`/services/${d.slug}`} aria-label={d.title} className="svc-card__link" />
        </Reveal>
      ))}
    </div>
  );
}

export function TrustBar() {
  const { accreditations } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  return (
    <section className="trust" aria-label="Why organisations trust Aspira">
      <div className="container">
        <span className="trust__label">Built on trust</span>
        <div className="trust__items">
          {nabcb && <span className="trust__item"><BadgeCheck size={20} /> {nabcb.shortName} Accredited · {nabcb.registrationNo}</span>}
          <span className="trust__item"><Scale size={20} /> Independent & impartial</span>
          <span className="trust__item"><FileCheck2 size={20} /> Clear, accurate reports</span>
          <span className="trust__item"><Lock size={20} /> Strict confidentiality</span>
        </div>
      </div>
    </section>
  );
}

export function WhyChoose() {
  const { settings } = useSite();
  const items = settings.differentiators || [];
  const values = settings.values || [];
  if (!items.length) return null;
  return (
    <section className="section section--ink">
      <div className="container why">
        <div className="why__sticky">
          <Reveal>
            <span className="eyebrow">§ Why Aspira</span>
            <h2>Audits you can <em className="accent">rely on</em> — and act on.</h2>
            <p style={{ color: '#aebad3', fontSize: 'var(--fs-lg)', maxWidth: '44ch' }}>{settings.mission}</p>
            {values.length > 0 && (
              <div className="values">
                {values.map((v) => <span key={v.title} title={v.description}><Check size={15} /> {v.title}</span>)}
              </div>
            )}
          </Reveal>
        </div>
        <div className="why__list">
          {items.map((d, i) => (
            <Reveal key={d.title} className="why__item" delay={i * 0.06}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <div><h3>{d.title}</h3><p>{d.description}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustriesGrid({ withHead = true }) {
  const { settings } = useSite();
  const list = settings.industries || [];
  if (!list.length) return null;
  return (
    <>
      {withHead && (
        <SectionHead split eyebrow="§ Industries we serve" title={<>From campuses to <em className="accent">construction sites</em></>} intro="We work with government departments, large corporations and SMEs across sectors where compliance, safety and sustainability matter." />
      )}
      <div className="industries">
        {list.map((ind, i) => (
          <Reveal key={ind.name} className="industry" delay={(i % 4) * 0.06}>
            <span className="ic"><Icon name={ind.icon} size={30} strokeWidth={1.3} /></span>
            <h3>{ind.name}</h3>
            <p>{ind.description}</p>
          </Reveal>
        ))}
      </div>
    </>
  );
}

export function ProcessSteps({ steps, white }) {
  const { settings } = useSite();
  const list = steps || settings.process || [];
  if (!list.length) return null;
  return (
    <div className={`process ${list.length === 5 ? 'process--5' : ''}`} style={{ gridTemplateColumns: list.length < 5 ? `repeat(${list.length}, 1fr)` : undefined }}>
      {list.map((s, i) => (
        <Reveal key={i} className="step" delay={i * 0.08}>
          <span className="step__n" style={white ? { background: '#fff' } : undefined}>{String(i + 1).padStart(2, '0')}</span>
          <h4>{s.title}</h4>
          <p>{s.description}</p>
        </Reveal>
      ))}
    </div>
  );
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/** Main accreditation USP section (homepage + accreditation page) */
export function AccreditationSection({ showWhy = true, compactHead = false }) {
  const { accreditations } = useSite();
  const a = accreditations.find((x) => x.shortName === 'NABCB') || accreditations[0];
  if (!a) return null;
  const files = a.certificateFiles || [];
  return (
    <div className="accr2">
      <Reveal className="accr2__card">
        <div className="accr2__badge"><img src={a.logo ? fileUrl(a.logo) : BADGE_SRC} alt={`${a.shortName} Accredited Inspection Body – Reg. No. ${a.registrationNo}`} width="180" height="196" loading="lazy" /></div>
        <div className="accr2__main">
          {!compactHead && <span className="eyebrow">Accreditation · our USP</span>}
          <h3>{a.title}</h3>
          <p className="accr2__desc">{a.description}</p>
          <dl className="accr2__dl">
            <div><dt>Registration no.</dt><dd className="mono">{a.registrationNo}</dd></div>
            {a.standard && <div><dt>Accredited against</dt><dd>{a.standard}</dd></div>}
            {a.scope && <div className="wide"><dt>Scope of accreditation</dt><dd>{a.scope}</dd></div>}
            {(a.validFrom || a.validUntil) && <div><dt>Validity</dt><dd>{fmtDate(a.validFrom)} – {fmtDate(a.validUntil)}</dd></div>}
            {a.body && <div><dt>Accreditation body</dt><dd>{a.body}</dd></div>}
          </dl>
          <div className="accr2__actions">
            <Link to="/resources" className="btn btn--sm"><Download size={15} /> Download certificate</Link>
            {a.verifyUrl && <a href={a.verifyUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm"><ExternalLink size={15} /> Verify on NABCB</a>}
            <Link to="/accreditations" className="btn btn--ghost btn--sm">Accreditation details</Link>
          </div>
        </div>
        {files.length > 0 && (
          <div className="accr2__certs">
            {files.slice(0, 3).map((f, i) => (
              <a key={f} href={fileUrl(f)} target="_blank" rel="noopener noreferrer" aria-label={`Open certificate page ${i + 1}`}>
                <img src={fileUrl(f)} alt={`NABCB accreditation certificate page ${i + 1}`} loading="lazy" width="120" height="170" />
              </a>
            ))}
          </div>
        )}
      </Reveal>
      {showWhy && (
        <div className="why-accr">
          {[
            [ShieldCheck, 'Independently assessed competence', 'NABCB, under the Quality Council of India, has assessed our people, methods and reporting against ISO/IEC 17020.'],
            [Scale, 'Impartial, third-party findings', 'As a Type ‘A’ Inspection Body we are independent of the sites we inspect — our findings have no conflict of interest.'],
            [Award, 'Reports that carry weight', 'Accredited audit reports give institutions credible evidence for NAAC and other external assessments.'],
            [Globe2, 'Verifiable credentials', 'Our accreditation, scope and validity can be checked directly with NABCB at any time.'],
          ].map(([I, t, d], i) => (
            <Reveal key={t} className="why-accr__item" delay={i * 0.05}>
              <span className="ic"><I size={20} /></span>
              <h4>{t}</h4>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
export const AccreditationBand = () => <AccreditationSection showWhy={false} />;

/** Accreditation panel on service pages – honest about scope */
export function ServiceAccreditation({ slug }) {
  const { accreditations } = useSite();
  const a = accreditations.find((x) => x.shortName === 'NABCB');
  if (!a) return null;
  const inScope = slug === 'green-audits';
  return (
    <div className={`svc-accr ${inScope ? 'svc-accr--in' : ''}`}>
      <img src={BADGE_SRC} alt={`${a.shortName} Accredited Inspection Body – Reg. No. ${a.registrationNo}`} width="64" height="70" loading="lazy" />
      <div>
        <b>{inScope ? 'This service is within our NABCB scope of accreditation' : `Delivered by a ${a.shortName}-accredited Inspection Body`}</b>
        <p>
          {inScope
            ? `Aspira is accredited by ${a.shortName} as a Type ‘A’ Inspection Body (Reg. No. ${a.registrationNo}) for green audits of educational institutions${a.validUntil ? `, valid until ${fmtDate(a.validUntil)}` : ''}.`
            : `Aspira is a ${a.shortName}-accredited Type ‘A’ Inspection Body (Reg. No. ${a.registrationNo}); the accreditation scope covers green audits of educational institutions. This service is delivered as an independent third-party assessment with the same impartial approach.`}
        </p>
        <Link to="/accreditations" className="link-arrow">View certificate <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}

/** Service → target customers table (built from each service's audience text, editable in admin) */
export function CustomerTable({ limit }) {
  const { services } = useSite();
  const order = ['green-audits', 'hygiene-rating-audits', 'construction-safety-audits', 'electrical-safety-audits', 'fire-safety-audits', 'energy-audits', 'water-audits', 'workplace-safety-audits', 'warehouse-safety-audits', 'green-building-assessments'];
  const rows = order.map((slug) => services.find((s) => s.slug === slug)).filter((s) => s && s.audience);
  const list = limit ? rows.slice(0, limit) : rows;
  if (!list.length) return null;
  return (
    <Reveal className="ctable-wrap">
      <table className="ctable">
        <thead><tr><th>Service</th><th>Target customers</th><th aria-label="Enquire" /></tr></thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.slug}>
              <td><Link to={`/services/${s.slug}`} className="ctable__svc"><span className="svc-sub__ic"><Icon name={s.icon} size={17} /></span>{s.title}</Link></td>
              <td>{s.audience.replace(/^For /, '').replace(/^./, (c) => c.toUpperCase())}</td>
              <td><Link to={`/services/${s.slug}#enquire`} className="link-arrow">Enquire <ArrowRight size={13} /></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}

/** Who we serve – keeps the two priority audiences clearly separate */
export function AudienceSplit() {
  const { services } = useSite();
  const g = services.find((s) => s.slug === 'green-audits');
  const h = services.find((s) => s.slug === 'hygiene-rating-audits');
  const items = [
    g && {
      s: g, I: GraduationCap, tag: 'For educational institutions', title: 'Green Audit for schools, colleges & universities',
      points: ['NABCB-accredited – within our scope of accreditation', 'Water, electricity, waste, solar energy, tree plantation & environmental practices', 'Audit report that supports NAAC requirements (metric 7.1.6)'],
      cta: g.ctaLabel || 'Book a Green Audit for Your Institution',
    },
    h && {
      s: h, I: UtensilsCrossed, tag: 'For restaurants & food businesses', title: 'Hygiene Rating Audit for restaurants, hotels & canteens',
      points: ['Kitchen cleanliness, food storage & food handling practices', 'Pest control, sanitation & drinking-water hygiene', 'FSSAI Hygiene Rating Scheme – rated 1 to 5 smileys'],
      cta: h.ctaLabel || 'Get Your Restaurant Audited',
    },
  ].filter(Boolean);
  return (
    <div className="audience">
      {items.map((it, i) => (
        <Reveal key={it.s.slug} className={`audience__card audience__card--${i ? 'food' : 'edu'}`} delay={i * 0.08}>
          {it.s.image && <img className="audience__img" src={imgSize(it.s.image, 900)} alt="" loading="lazy" width="900" height="500" />}
          <div className="audience__body">
            <span className="audience__tag"><it.I size={15} /> {it.tag}</span>
            <h3>{it.title}</h3>
            <ul>{it.points.map((p) => <li key={p}><Check size={15} strokeWidth={2.6} /> {p}</li>)}</ul>
            <div className="audience__actions">
              <Link to={`/services/${it.s.slug}#enquire`} className="btn btn--green btn--sm">{it.cta} <ArrowRight size={15} /></Link>
              <Link to={`/services/${it.s.slug}`} className="btn btn--ghost btn--sm">Learn more</Link>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

const ytId = (url) => (String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [])[1];
function VideoTestimonial({ url, title }) {
  const id = ytId(url);
  if (id)
    return (
      <div className="quote__video">
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={title} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    );
  if (/\.(mp4|webm)$/i.test(url)) return <div className="quote__video"><video src={fileUrl(url)} controls preload="none" /></div>;
  return <a className="link-arrow" href={url} target="_blank" rel="noopener noreferrer"><Play size={14} /> Watch video testimonial</a>;
}

export function Testimonials({ serviceSlug }) {
  const { data } = useFetch('/testimonials');
  let items = data || [];
  if (serviceSlug) {
    const specific = items.filter((t) => t.serviceSlug === serviceSlug);
    items = specific.length ? specific : items;
  }
  if (!items.length) return null; // hidden until real testimonials are added in the admin
  return (
    <section className="section">
      <div className="container">
        <SectionHead center eyebrow="§ Client voices" title={<>What our clients <em className="accent">say</em></>} />
        <div className="quotes">
          {items.slice(0, 6).map((t, i) => (
            <Reveal as="figure" key={t._id} className="quote" delay={i * 0.06} style={{ margin: 0 }}>
              {t.videoUrl ? <VideoTestimonial url={t.videoUrl} title={`Testimonial from ${t.name}`} /> : <span className="quote__mark" aria-hidden="true">“</span>}
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                {t.photo ? <img src={fileUrl(t.photo)} alt="" width="46" height="46" loading="lazy" /> : <span className="quote__avatar">{t.name?.[0]}</span>}
                <span><strong>{t.name}</strong><span>{[t.designation, t.organization].filter(Boolean).join(', ')}</span></span>
                {t.logo && <img className="quote__logo" src={fileUrl(t.logo)} alt={t.organization || ''} loading="lazy" />}
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClientLogos() {
  const { data } = useFetch('/clients');
  const items = data || [];
  if (!items.length) return null; // hidden until real client logos are added in the admin
  const marquee = items.length >= 6;
  const list = marquee ? [...items, ...items] : items;
  return (
    <section className="section section--tight section--white">
      <div className="container">
        <p className="eyebrow" style={{ display: 'flex', justifyContent: 'center' }}>Trusted by organisations across India</p>
        <div className={`logos ${marquee ? '' : 'logos--static'}`}>
          <div className="logos__track">
            {list.map((c, i) => (
              <img key={`${c._id}-${i}`} src={fileUrl(c.logo)} alt={c.name} title={c.name} loading="lazy" height="56" aria-hidden={i >= items.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ title = 'Ready to get audit-ready?', text = 'Speak to our team about scope, timelines and fees. We respond to every enquiry.', service }) {
  const { settings } = useSite();
  const phone = settings.contact?.phones?.[0];
  const wa = settings.contact?.whatsapp;
  return (
    <section className="section section--tight">
      <div className="container">
        <Reveal className="cta">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="cta__actions">
            <Link to="/contact?intent=booking#enquiry" className="btn btn--light"><CalendarCheck size={16} /> Book an audit</Link>
            <Link to="/contact?intent=quote#enquiry" className="btn btn--outline-light">Request a quote</Link>
            <Link to="/contact?intent=consultation#enquiry" className="btn btn--outline-light"><Headset size={16} /> Get a consultation</Link>
            {wa && <a href={waLink(wa, service ? `Hello Aspira, I would like to enquire about ${service}.` : undefined)} className="btn btn--outline-light" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp us</a>}
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="btn btn--outline-light"><Phone size={16} /> {phone}</a>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}


/** Prominent "verify a certificate" strip with an inline lookup box */
export function VerifyStrip({ compact = false }) {
  const nav = useNavigate();
  const [no, setNo] = useState('');
  const go = (e) => {
    e.preventDefault();
    const v = no.trim();
    nav(v ? `/certificate-status?no=${encodeURIComponent(v)}` : '/certificate-status');
  };
  return (
    <div className={`vstrip ${compact ? 'vstrip--compact' : ''}`}>
      <div className="vstrip__ic" aria-hidden="true"><ShieldCheck size={26} /></div>
      <div className="vstrip__text">
        <h3>Verify an Aspira certificate</h3>
        <p>Received a certificate or inspection report from us? Check that it is genuine and currently valid.</p>
      </div>
      <form className="vstrip__form" onSubmit={go} role="search">
        <label htmlFor={compact ? 'vs-no-2' : 'vs-no'} className="sr-only">Certificate or report number</label>
        <input id={compact ? 'vs-no-2' : 'vs-no'} value={no} onChange={(e) => setNo(e.target.value)} placeholder="Certificate / report no." maxLength={80} autoComplete="off" />
        <button className="btn btn--green"><Search size={16} /> Verify</button>
      </form>
    </div>
  );
}
