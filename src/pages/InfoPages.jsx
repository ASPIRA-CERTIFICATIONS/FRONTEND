import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Target, MapPin, Phone, Mail, Clock, Search, ExternalLink, FileText, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Scale, UtensilsCrossed, Leaf, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api, fileUrl } from '../lib/api';
import Seo, { breadcrumbSchema, orgSchema } from '../components/Seo';
import { PageHero, Reveal, SectionHead, Seal, CheckList, BADGE_SRC, NABCB_VERIFY_URL } from '../components/ui';
import { WhyChoose, IndustriesGrid, CtaBand, ServiceCard, CustomerTable, WhyAspira, QCI_FALLBACK } from '../components/Sections';
import { PageIntro } from './Company';
import EnquiryFormDefault, { INTENTS } from '../components/EnquiryForm';
import { waLink } from '../lib/whatsapp';
import { photo, customImage } from '../lib/companyPhotos';
import { usePageCtx, rich, Paras, plain } from '../lib/cms';
import { CmsSlot } from '../components/Cms';

const ABOUT_PHOTOS = ['03', '07', '06', '10'].map(photo);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const tel = (p) => `tel:${String(p).replace(/[^+\d]/g, '')}`;

/* ============================ ABOUT ============================ */
export function About() {
  const { settings } = useSite();
  const pg = usePageCtx();
  const H = (k) => !pg || !pg.hidden(k);
  const S = (k) => (pg ? pg.s(k) : {});
  const story = S('story');
  const field = S('field');
  const vis = (S('vision').items || []);
  const vals = S('values');
  const pil = S('pillars');
  const visionText = vis[0]?.text ?? settings.vision;
  const missionText = vis[1]?.text ?? settings.mission;
  return (
    <>
      <Seo title="About Us" description={settings.aboutShort} jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />
      <PageHero crumbs={[{ label: 'About' }]} image={customImage(settings.aboutImage) || photo('01').image} eyebrow="About Aspira" title={<>Aspiring to improve the <em className="accent">quality of lives</em></>} intro={settings.aboutShort} />
      {H('story') && (
        <section className="section">
          <div className="container split split--top">
            <Reveal>
              {story.eyebrow && <span className="eyebrow">{story.eyebrow}</span>}
              <h2>{rich(story.heading)}</h2>
            </Reveal>
            <Reveal delay={0.1} className="prose">
              <Paras text={story.body} first="lead" />
            </Reveal>
          </div>
        </section>
      )}
      <CmsSlot pg={pg} after="story" />
      {/* Aspira's own photos */}
      {H('field') && (
        <section className="section section--white ab-ph">
          <div className="container">
            <SectionHead center eyebrow={field.eyebrow} title={rich(field.heading)} intro={field.intro} />
            <div className="ab-ph__grid">
              {ABOUT_PHOTOS.map((ph, i) => (
                <Reveal key={ph._id} delay={i * 0.06} as={Link} to="/gallery" className={`ab-ph__item ab-ph__item--${i + 1}`}>
                  <img src={ph.thumb} srcSet={`${ph.thumb} 720w, ${ph.image} ${ph.width}w`} sizes="(max-width: 700px) 100vw, 50vw" width={ph.width} height={ph.height} alt={ph.title} loading="lazy" decoding="async" />
                </Reveal>
              ))}
            </div>
            {(field.buttons || []).filter((x) => x.label && x.href).slice(0, 1).map((x) => <div key={x.href} style={{ textAlign: 'center', marginTop: '1.75rem' }}><Link to={x.href} className="btn btn--outline">{x.label} <ArrowRight size={16} /></Link></div>)}
          </div>
        </section>
      )}
      <CmsSlot pg={pg} after="field" />
      {(H('vision') || H('values')) && (
        <section className="section">
          <div className="container split split--top">
            {H('vision') && (
              <div className="vm">
                <Reveal className="vm__card"><span className="ic"><Eye size={22} /></span><h3>{vis[0]?.title || 'Our vision'}</h3><Paras text={visionText} /></Reveal>
                <Reveal className="vm__card" delay={0.08}><span className="ic"><Target size={22} /></span><h3>{vis[1]?.title || 'Our mission'}</h3><Paras text={missionText} /></Reveal>
              </div>
            )}
            {H('values') && (
              <div>
                <Reveal>{vals.eyebrow && <span className="eyebrow">{vals.eyebrow}</span>}<h2>{rich(vals.heading)}</h2></Reveal>
                <div className="faq" style={{ marginTop: '1.5rem' }}>
                  {(vals.items || []).filter((v) => v.title).map((v, i) => (
                    <Reveal key={i} delay={i * 0.05} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '1rem', padding: '1.1rem 0', borderBottom: '1px solid var(--line)' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--green-2)', paddingTop: '.25rem' }}>{String(i + 1).padStart(2, '0')}</span>
                      <div><h4 style={{ margin: 0, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: 0 }}>{v.title}</h4><p style={{ margin: 0, color: 'var(--muted)' }}>{v.text}</p></div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <CmsSlot pg={pg} after="vision" />
      <CmsSlot pg={pg} after="values" />
      {H('pillars') && (pil.items || []).length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead center eyebrow={pil.eyebrow} title={rich(pil.heading)} intro={pil.intro} />
            <div className="pillars" style={{ marginTop: 0 }}>
              {(pil.items || []).filter((p) => p.title).map((p, i) => (
                <Reveal className="pillar" key={i} delay={i * 0.08}><small>0{i + 1}</small><h4>{p.title}</h4><p>{p.text}</p></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      <CmsSlot pg={pg} after="pillars" />
      <WhyAspira />
      <CmsSlot pg={pg} after="why" />
      <CtaBand />
      <CmsSlot pg={pg} after="cta" />
    </>
  );
}

/* ============================ ACCREDITATIONS ============================ */
const CERT_LABELS = ['Accreditation certificate', 'Schedule I – Scope of accreditation', 'Schedule II – Office under accreditation'];

export function Accreditations() {
  const { accreditations, settings } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const qci = accreditations.find((a) => a.shortName === 'QCI') || QCI_FALLBACK;
  const certs = (nabcb?.certificateFiles || []).filter(Boolean);
  const [open, setOpen] = useState(-1);
  useEffect(() => {
    if (open < 0) return undefined;
    const k = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % certs.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + certs.length) % certs.length);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, certs.length]);

  return (
    <>
      <Seo title="Accreditations – NABCB (IB 159) & QCI" description="Aspira Certifications is a NABCB-accredited Type ‘A’ Inspection Body (Reg. No. IB 159) for green audits of educational institutions, and a QCI-recognised Hygiene Rating Audit Agency (HRAA)." jsonLd={[orgSchema(settings, accreditations), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Accreditation', path: '/accreditations' }])]} />
      <PageIntro
        eyebrow="Accreditation"
        title={<>Accreditations &amp; <em className="accent">recognitions</em></>}
        lead="Accreditations are a mark of credibility, impartiality, and adherence to international standards. Our accredited audits give you confidence that processes are rigorously evaluated, reliable, and globally recognised."
        crumbs={[{ label: 'Accreditation' }]}
      />

      {/* ---------- NABCB ---------- */}
      {nabcb && (
        <section className="section acc2-sec" id="nabcb">
          <div className="container">
            <Reveal className="acc2 acc2--stack">
              <div className="acc2__info">
                <div className="acc2__title">
                  <span className="acc2__ic acc2__ic--img"><img src={BADGE_SRC} alt="" width="52" height="56" /></span>
                  <div><h2>NABCB Accreditation</h2><span>National Accreditation Board for Certification Bodies</span></div>
                </div>
                <p>The National Accreditation Board for Certification Bodies (NABCB) is India’s national accreditation authority under the Quality Council of India (QCI). Recognised internationally through multilateral arrangements, NABCB ensures that certification, inspection, and verification bodies operate with competence, impartiality, and globally accepted best practices.</p>
                <p>Aspira Certifications Private Limited is a NABCB-accredited Inspection Body listed under registration number <b>{nabcb.registrationNo}</b>.</p>
                <dl className="acc2__facts">
                  <div><dt>Registration no.</dt><dd>{nabcb.registrationNo}</dd></div>
                  <div><dt>Accredited against</dt><dd>{nabcb.standard}</dd></div>
                  <div className="acc2__facts-wide"><dt>Scope of accreditation</dt><dd>{nabcb.scope}</dd></div>
                </dl>
                <div className="acc2__actions">
                  <a href={NABCB_VERIFY_URL} target="_blank" rel="noopener noreferrer" className="btn btn--sm"><ExternalLink size={15} /> Verify on NABCB</a>
                  <Link to="/services/green-audits" className="btn btn--ghost btn--sm">Green audits <ArrowRight size={15} /></Link>
                </div>
              </div>
            </Reveal>
            {certs.length > 0 && (
              <Reveal className="acc2-certs" delay={0.06}>
                <div className="acc2-certs__head">
                  <span className="acc2__docs-label"><FileText size={15} /> Accreditation certificate</span>
                  <p>Certificate No. {nabcb.registrationNo} with its two schedules. Click a page to view it in full.</p>
                </div>
                <div className="acc2-certs__row">
                  {certs.map((f, i) => (
                    <button key={f} type="button" className="acc2-cert" onClick={() => setOpen(i)} aria-label={`View ${CERT_LABELS[i] || `page ${i + 1}`}`}>
                      <span className="acc2-cert__paper"><img src={fileUrl(f)} alt={`NABCB accreditation certificate IB 159 – ${CERT_LABELS[i] || `page ${i + 1}`}`} loading="lazy" width="725" height="1024" /></span>
                      <span className="acc2-cert__cap"><b>{String(i + 1).padStart(2, '0')}</b>{CERT_LABELS[i] || `Page ${i + 1}`}</span>
                    </button>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ---------- QCI ---------- */}
      <section className="section section--white acc2-sec" id="qci">
        <div className="container">
          <Reveal className="acc2 acc2--qci">
            <div className="acc2__info">
              <div className="acc2__title">
                <span className="acc2__ic"><ShieldCheck size={26} /></span>
                <div><h2>QCI Recognition</h2><span>Quality Council of India</span></div>
              </div>
              <p>{qci.description}</p>
              <p>We provide independent and impartial Hygiene Rating Audits for restaurants, hotels, catering services, sweet shops, cafeterias, bakeries, food courts, and cloud kitchens across India.</p>
              <ul className="acc2__list">
                <li><CheckCircle2 size={17} /> Hygiene Rating Audit Agency (HRAA) recognised by QCI</li>
                <li><CheckCircle2 size={17} /> Audits under the FSSAI Hygiene Rating Scheme</li>
                <li><CheckCircle2 size={17} /> Compliance with Schedule 4 of the FSS (Licensing and Registration of Food Businesses) Regulations</li>
                <li><CheckCircle2 size={17} /> Auditors trained and qualified as per FSSAI &amp; QCI guidelines</li>
              </ul>
              <div className="acc2__actions">
                <Link to="/services/hygiene-rating-audits" className="btn btn--sm">Hygiene rating audits <ArrowRight size={15} /></Link>
              </div>
            </div>
            <div className="acc2__panel">
              <span className="acc2__docs-label"><FileText size={15} /> Recognition details</span>
              <dl>
                <div><dt>Recognised by</dt><dd>{qci.body || 'Quality Council of India (QCI)'}</dd></div>
                <div><dt>Recognised as</dt><dd>Hygiene Rating Audit Agency (HRAA)</dd></div>
                <div><dt>Scheme</dt><dd>FSSAI Hygiene Rating Scheme</dd></div>
                <div><dt>Scope</dt><dd>{qci.scope}</dd></div>
                {qci.registrationNo && <div><dt>Recognition no.</dt><dd>{qci.registrationNo}</dd></div>}
              </dl>
              {qci.logo && <img src={fileUrl(qci.logo)} alt="QCI" className="acc2__logo" loading="lazy" />}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- standards ---------- */}
      <section className="section">
        <div className="container">
          <SectionHead center eyebrow="Standards" title={<>The standards behind <em className="accent">our audits</em></>} />
          <div className="acc2-std">
            <Reveal className="acc2-std__card"><span><Scale size={22} /></span><h3>ISO/IEC 17020:2012</h3><p>Conformity assessment requirements for inspection bodies – competence, impartiality and consistency in our inspection processes.</p></Reveal>
            <Reveal className="acc2-std__card" delay={0.06}><span><UtensilsCrossed size={22} /></span><h3>FSSAI Hygiene Rating Scheme</h3><p>Hygiene rating audits of food establishments against Schedule 4 of the FSS (Licensing &amp; Registration of Food Businesses) Regulations.</p></Reveal>
            <Reveal className="acc2-std__card" delay={0.12}><span><Leaf size={22} /></span><h3>NBC 2016 Part 11</h3><p>Green audits of educational institutions against the National Building Code of India 2016, Part 11 – Approach to Sustainability, as per NAAC advisory.</p></Reveal>
          </div>
        </div>
      </section>

      {open >= 0 && (
        <div className="acc2-lb" role="dialog" aria-modal="true" aria-label="Accreditation certificate" onClick={() => setOpen(-1)}>
          <button type="button" className="acc2-lb__x" aria-label="Close" onClick={() => setOpen(-1)}><X size={22} /></button>
          {certs.length > 1 && <button type="button" className="acc2-lb__nav acc2-lb__nav--l" aria-label="Previous page" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i - 1 + certs.length) % certs.length); }}><ChevronLeft size={26} /></button>}
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={fileUrl(certs[open])} alt={CERT_LABELS[open] || ''} />
            <figcaption>{CERT_LABELS[open] || `Page ${open + 1}`} · {open + 1} / {certs.length}</figcaption>
          </figure>
          {certs.length > 1 && <button type="button" className="acc2-lb__nav acc2-lb__nav--r" aria-label="Next page" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i + 1) % certs.length); }}><ChevronRight size={26} /></button>}
        </div>
      )}
      <CtaBand title="Planning an audit or inspection?" text="Speak to our team about scope, timelines and fees. We respond to every enquiry." />
    </>
  );
}

/* ============================ INDUSTRIES ============================ */
export function Industries() {
  const { services } = useSite();
  return (
    <>
      <Seo title="Industries We Serve" description="Aspira audits educational institutions, food businesses, construction sites, industrial plants, warehouses, commercial buildings, government departments and SMEs." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Industries', path: '/industries' }])} />
      <PageHero crumbs={[{ label: 'Industries' }]} pageKey="industries" image="https://images.unsplash.com/photo-1598299803204-b73796f43289?auto=format&fit=crop&w=1600&q=70" eyebrow="Industries" title={<>Sector expertise, <em className="accent">one standard of rigour</em></>} intro="We work with government departments, large corporations and small and medium enterprises across India." />
      <section className="section"><div className="container"><IndustriesGrid withHead={false} /></div></section>
      <section className="section section--white">
        <div className="container">
          <SectionHead center eyebrow="Service guide" title="Which audit does your organisation need?" />
          <CustomerTable />
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <SectionHead split eyebrow="Services" title="Find the right audit for your sector" />
          <div className="sv-grid">{services.filter((s) => !s.parentSlug).map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}</div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

/* ============================ CONTACT ============================ */
const AUDIENCES = [
  { key: 'institution', label: 'Educational institution', service: 'Green Audits', slug: 'green-audits', category: 'Sustainability' },
  { key: 'restaurant', label: 'Restaurant / food outlet', service: 'Hygiene Rating Audits', slug: 'hygiene-rating-audits', category: 'Food Safety' },
  { key: 'default', label: 'Other organisation', service: '', slug: '', category: '' },
];

export function Contact() {
  const { settings } = useSite();
  const c = settings.contact || {};
  const [params, setParams] = useSearchParams();
  // Contact offers two options only: request a quote or talk to our experts
  const CONTACT_INTENTS = ['quote', 'expert'];
  const intent = CONTACT_INTENTS.includes(params.get('intent')) ? params.get('intent') : 'quote';
  const aud = AUDIENCES.find((x) => x.key === ({ green: 'institution', hygiene: 'restaurant' }[params.get('for')] || params.get('for'))) || AUDIENCES[2];
  const set = (k, v) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next, { replace: true });
  };
  return (
    <>
      <Seo title="Contact Us – Request a Quote" description={`Request a quote or talk to Aspira's experts. Call ${c.phones?.[0] || ''} or email ${c.emails?.[0] || ''}.`} jsonLd={[orgSchema(settings, []), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])]} />
      <PageIntro eyebrow="Contact" title={<>Let's talk about your <em className="accent">audit</em></>} lead="Request a quote or speak to our experts — we respond to every enquiry." crumbs={[{ label: 'Contact' }]} />
      <section className="section section--first" id="enquiry">
        <div className="container contact-grid">
          <div className="contact-list">
            <div className="intent-tabs" role="tablist" aria-label="What would you like to do?">
              {CONTACT_INTENTS.map((k) => [k, INTENTS[k]]).map(([k, v]) => (
                <button key={k} role="tab" aria-selected={intent === k} onClick={() => set('intent', k)}>{v.label}</button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="aud">I am enquiring for</label>
              <select id="aud" value={aud.key} onChange={(e) => set('for', e.target.value)}>
                {AUDIENCES.map((a) => <option key={a.key} value={a.key}>{a.label}{a.service ? ` (${a.service})` : ''}</option>)}
              </select>
            </div>
            {c.phones?.length > 0 && <div className="contact-item"><span className="ic"><Phone size={20} /></span><div><small>Call us</small>{c.phones.map((p) => <a key={p} href={tel(p)}>{p}</a>)}</div></div>}
            {c.whatsapp && <div className="contact-item"><span className="ic ic--wa"><Phone size={20} /></span><div><small>WhatsApp</small><a href={waLink(c.whatsapp, aud.service ? `Hello Aspira, I would like to enquire about ${aud.service}.` : undefined)} target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a></div></div>}
            {c.emails?.length > 0 && <div className="contact-item"><span className="ic"><Mail size={20} /></span><div><small>Email</small>{c.emails.map((e) => <a key={e} href={`mailto:${e}`}>{e}</a>)}</div></div>}
            {c.address && <div className="contact-item"><span className="ic"><MapPin size={20} /></span><div><small>Office</small><p>{c.address}</p></div></div>}
            {c.hours && <div className="contact-item"><span className="ic"><Clock size={20} /></span><div><small>Hours</small><p>{c.hours}</p></div></div>}
            {c.mapEmbedUrl && <div className="map"><iframe src={c.mapEmbedUrl} title="Aspira Certifications office location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
          </div>
          <EnquiryFormDefault
            key={`${intent}-${aud.key}`}
            intent={intent}
            variant={aud.key}
            service={aud.service}
            serviceSlug={aud.slug}
            category={aud.category}
            title={INTENTS[intent].label}
            subtitle={aud.key === 'institution' ? 'Green Audit for schools, colleges and universities.' : aud.key === 'restaurant' ? 'Hygiene Rating Audit for restaurants, hotels, cafes and food outlets.' : 'Fields marked * are required.'}
          />
        </div>
      </section>
    </>
  );
}

/* ============================ CERTIFICATE STATUS ============================ */
const CERT_EMPTY = { name: '', email: '', certificateNo: '', issueDate: '', website: '' };
export function CertificateStatus() {
  const [params] = useSearchParams();
  const pg = usePageCtx();
  const hi = pg.s('intro');
  const how = pg.s('howto');
  const fm = pg.s('form');
  const [f, setF] = useState(() => ({ ...CERT_EMPTY, certificateNo: params.get('no') || '' }));
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ s: 'idle' });
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };
  function validate() {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Please enter a valid email address';
    if (f.certificateNo.trim().length < 2) e.certificateNo = 'Please enter the certificate number';
    return e;
  }
  async function onSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setState({ s: 'loading' });
    try {
      const r = await api('/enquiries/certificate-status', { method: 'POST', body: { ...f, name: f.name.trim(), email: f.email.trim(), certificateNo: f.certificateNo.trim() } });
      setState({ s: 'done', ref: r.reference });
      setF(CERT_EMPTY);
    } catch (err) {
      setState({ s: 'error', msg: err.message || 'Could not send your request. Please try again.' });
    }
  }
  const field = (k, label, props = {}, req = true) => (
    <div className="field">
      <label htmlFor={`cs-${k}`}>{label}{req && <span className="req"> *</span>}</label>
      <input id={`cs-${k}`} value={f[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `cs-${k}-err` : undefined} {...props} />
      {errors[k] && <span className="field__err" id={`cs-${k}-err`}>{errors[k]}</span>}
    </div>
  );
  return (
    <>
      <Seo title="Certificate Status" description="Check the status of a certificate issued by Aspira Certifications. Submit the certificate number and our team will confirm its status by email." />
      <PageHero
        crumbs={[{ label: 'Certificate status' }]}
        media={!pg.hidden('howto') && (
          <div className="vfy-steps">
            <span className="vfy-steps__badge"><ShieldCheck size={26} /></span>
            <h2>{rich(how.heading)}</h2>
            <ol>
              {(how.items || []).map((it, i) => <li key={i}><b>{i + 1}</b><span><strong>{it.title}</strong>{it.text}</span></li>)}
            </ol>
          </div>
        )}
        primary={{ href: '#cert-status', label: 'Check certificate status' }} eyebrow={hi.eyebrow} title={rich(hi.heading)} intro={hi.intro} />
      {!pg.hidden('form') && (
        <section className="section" id="cert-status">
          <div className="container cs-wrap">
            <div className="form-card cs-card">
              {fm.heading && <h2 className="cs-card__title">{rich(fm.heading)}</h2>}
              {fm.intro && <p className="form__note" style={{ marginTop: 0 }}>{fm.intro}</p>}
              {state.s === 'done' ? (
                <div className="alert alert--ok cs-done" role="status">
                  <CheckCircle2 size={20} />
                  <div><b>Thank you – your request has been received.</b><p>Reference <code>{state.ref}</code>. Our team will verify the certificate and reply to you by email.</p>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setState({ s: 'idle' })}>Check another certificate</button></div>
                </div>
              ) : (
                <form className="form" onSubmit={onSubmit} noValidate>
                  <div className="form__row">
                    {field('name', 'Your Name', { autoComplete: 'name', maxLength: 120 })}
                    {field('email', 'Email Address', { type: 'email', autoComplete: 'email', maxLength: 160 })}
                  </div>
                  <div className="form__row">
                    {field('certificateNo', 'Certificate Number', { maxLength: 80, placeholder: 'As printed on the certificate', autoComplete: 'off' })}
                    {field('issueDate', 'Date of Issue of Certificate', { type: 'date', max: new Date().toISOString().slice(0, 10) }, false)}
                  </div>
                  <input type="text" name="website" value={f.website} onChange={set('website')} tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
                  {state.s === 'error' && <div className="alert alert--err" role="alert"><AlertCircle size={18} /> {state.msg}</div>}
                  <button className="btn btn--green" disabled={state.s === 'loading'}>{state.s === 'loading' ? 'Sending…' : 'Submit'} <ArrowRight size={16} /></button>
                </form>
              )}
            </div>
            <p className="form__note" style={{ marginTop: '1.25rem', textAlign: 'center' }}>Need help? <Link to="/contact" style={{ textDecoration: 'underline' }}>Contact us</Link>.</p>
          </div>
        </section>
      )}
      <CmsSlot pg={pg} after="form" />
    </>
  );
}

/* ============================ COMPLAINTS & APPEALS ============================ */
export function Complaints() {
  const { settings } = useSite();
  const c = settings.contact || {};
  const pg = usePageCtx();
  const H = (k) => !pg || !pg.hidden(k);
  const S = (k) => (pg ? pg.s(k) : {});
  const pr = S('procedure');
  const ap = S('appeals');
  const fm = S('form');
  return (
    <>
      <Seo title="Complaints & Appeals" description="How to raise a complaint or appeal with Aspira Certifications, including the hygiene rating appeal process via QCI and FSSAI." />
      <PageIntro eyebrow="Impartiality" title={<>Complaints &amp; <em className="accent">appeals</em></>} lead="Every complaint and appeal is acknowledged, recorded and handled impartially under our documented procedure." crumbs={[{ label: 'Complaints & Appeals' }]} />
      <section className="section section--first">
        <div className="container split split--top">
          {H('procedure') && (
            <div>
              <Reveal>{pr.eyebrow && <span className="eyebrow">{pr.eyebrow}</span>}<h2>{rich(pr.heading)}</h2></Reveal>
              <ol className="steps-ol">
                {(pr.items || []).filter((x) => x.title).map((x, k) => (
                  <li key={k}><div><strong>{x.title}</strong>
                    {k === 0 && !pg?.saved?.('procedure')
                      ? <p>Email {c.complaintsEmail ? <a href={`mailto:${c.complaintsEmail}`}>{c.complaintsEmail}</a> : 'us'}{c.complaintsCcEmail && <> with a copy to <a href={`mailto:${c.complaintsCcEmail}`}>{c.complaintsCcEmail}</a></>}. Verbal complaints made in person or by phone are documented within 24 hours.</p>
                      : <Paras text={x.text} />}
                  </div></li>
                ))}
              </ol>
            </div>
          )}
          <div>
            {H('appeals') && (
              <>
                <Reveal>{ap.eyebrow && <span className="eyebrow">{ap.eyebrow}</span>}<h2>{rich(ap.heading)}</h2></Reveal>
                <CheckList one items={(ap.items || []).map((x) => x.title).filter(Boolean)} />
              </>
            )}
            {H('form') && (
              <div style={{ marginTop: H('appeals') ? '2rem' : 0 }}>
                <EnquiryFormDefault type="complaint" title={plain(fm.heading)} subtitle={fm.intro} compact messageLabel="Details of your complaint or appeal" />
              </div>
            )}
          </div>
        </div>
      </section>
      <CmsSlot pg={pg} after="procedure" />
      <CmsSlot pg={pg} after="appeals" />
      <CmsSlot pg={pg} after="form" />
    </>
  );
}

/* ============================ 404 ============================ */
export function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" noindex />
      <section className="section notfound">
        <div>
          <div className="big">404</div>
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>This page didn't pass inspection.</h1>
          <p style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist or has moved.</p>
          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/" className="btn">Back to home</Link>
            <Link to="/services" className="btn btn--ghost">Browse services <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
