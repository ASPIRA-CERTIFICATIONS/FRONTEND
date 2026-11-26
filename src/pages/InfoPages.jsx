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

const ABOUT_PHOTOS = ['03', '07', '06', '10'].map(photo);

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const tel = (p) => `tel:${String(p).replace(/[^+\d]/g, '')}`;

/* ============================ ABOUT ============================ */
export function About() {
  const { settings } = useSite();
  return (
    <>
      <Seo title="About Us" description={settings.aboutShort} jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />
      <PageHero crumbs={[{ label: 'About' }]} image={customImage(settings.aboutImage) || photo('01').image} eyebrow="About Aspira" title={<>Aspiring to improve the <em className="accent">quality of lives</em></>} intro={settings.aboutShort} />
      <section className="section">
        <div className="container split split--top">
          <Reveal>
            <span className="eyebrow">Our story</span>
            <h2>Impartial. Transparent. <em className="accent">Technically sound.</em></h2>
          </Reveal>
          <Reveal delay={0.1} className="prose">
            {String(settings.aboutLong || '').split(/\n{2,}/).map((p, i) => <p key={i} className={i === 0 ? 'lead' : ''}>{p}</p>)}
          </Reveal>
        </div>
      </section>
      {/* Aspira's own photos */}
      <section className="section section--white ab-ph">
        <div className="container">
          <SectionHead center eyebrow="In the field" title={<>Our on-site <em className="accent">inspection audits</em></>} />
          <div className="ab-ph__grid">
            {ABOUT_PHOTOS.map((ph, i) => (
              <Reveal key={ph._id} delay={i * 0.06} as={Link} to="/gallery" className={`ab-ph__item ab-ph__item--${i + 1}`}>
                <img src={ph.thumb} srcSet={`${ph.thumb} 720w, ${ph.image} ${ph.width}w`} sizes="(max-width: 700px) 100vw, 50vw" width={ph.width} height={ph.height} alt={ph.title} loading="lazy" decoding="async" />
                
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}><Link to="/gallery" className="btn btn--outline">View our gallery <ArrowRight size={16} /></Link></div>
        </div>
      </section>
      <section className="section">
        <div className="container split split--top">
          <div className="vm">
            <Reveal className="vm__card"><span className="ic"><Eye size={22} /></span><h3>Our vision</h3><p>{settings.vision}</p></Reveal>
            <Reveal className="vm__card" delay={0.08}><span className="ic"><Target size={22} /></span><h3>Our mission</h3><p>{settings.mission}</p></Reveal>
          </div>
          <div>
            <Reveal><span className="eyebrow">Our values</span><h2>What guides every audit</h2></Reveal>
            <div className="faq" style={{ marginTop: '1.5rem' }}>
              {(settings.values || []).map((v, i) => (
                <Reveal key={v.title} delay={i * 0.05} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '1rem', padding: '1.1rem 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', color: 'var(--green-2)', paddingTop: '.25rem' }}>{String(i + 1).padStart(2, '0')}</span>
                  <div><h4 style={{ margin: 0, fontFamily: 'var(--sans)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: 0 }}>{v.title}</h4><p style={{ margin: 0, color: 'var(--muted)' }}>{v.description}</p></div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
      {settings.pillars?.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead center eyebrow="Our focus" title={<>People. Processes. <em className="accent">Planet.</em></>} />
            <div className="pillars" style={{ marginTop: 0 }}>
              {settings.pillars.map((p, i) => (
                <Reveal className="pillar" key={p.title} delay={i * 0.08}><small>0{i + 1}</small><h4>{p.title}</h4><p>{p.description}</p></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      <WhyAspira />
      <CtaBand />
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
export function CertificateStatus() {
  const [params] = useSearchParams();
  const [no, setNo] = useState(params.get('no') || '');
  const [state, setState] = useState({ s: 'idle' });
  useEffect(() => {
    const q = params.get('no');
    if (q) {
      setNo(q);
      check(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  async function onSubmit(e) {
    e.preventDefault();
    check(no);
  }
  async function check(raw) {
    const v = String(raw || '').trim();
    if (v.length < 2) return setState({ s: 'error', msg: 'Please enter a certificate / report number' });
    setState({ s: 'loading' });
    try {
      const data = await api(`/certificates/verify/${encodeURIComponent(v)}`);
      setState({ s: 'found', data });
    } catch (err) {
      setState({ s: 'error', msg: err.message });
    }
  }
  const d = state.data;
  return (
    <>
      <Seo title="Verify a Certificate" description="Check whether a certificate or inspection report was genuinely issued by Aspira Certifications, and see its current status." />
      <PageHero
        crumbs={[{ label: 'Verify a certificate' }]}
        media={
          <div className="vfy-steps">
            <span className="vfy-steps__badge"><ShieldCheck size={26} /></span>
            <h2>How to verify</h2>
            <ol>
              <li><b>1</b><span><strong>Find the number</strong>Look for the certificate or report number printed on the Aspira document.</span></li>
              <li><b>2</b><span><strong>Enter it below</strong>Type the number exactly as printed, including any slashes.</span></li>
              <li><b>3</b><span><strong>See the result</strong>We confirm whether Aspira issued it, who it was issued to and its current status.</span></li>
            </ol>
          </div>
        }
        primary={{ href: '#cert-no', label: 'Verify a certificate' }} eyebrow="Verify a certificate" title={<>Was this certificate issued <em className="accent">by Aspira?</em></>} intro="If an organisation has shown you an Aspira certificate or inspection report, enter its number exactly as printed to confirm that it was genuinely issued by Aspira Certifications and check its current status." />
      <section className="section">
        <div className="container verify">
          <form className="verify__form" onSubmit={onSubmit} role="search">
            <label htmlFor="cert-no" className="sr-only">Certificate number</label>
            <input id="cert-no" value={no} onChange={(e) => setNo(e.target.value)} placeholder="e.g. ASP/GA/2025/001" autoComplete="off" maxLength={80} />
            <button className="btn btn--green" disabled={state.s === 'loading'}><Search size={17} /> {state.s === 'loading' ? 'Checking…' : 'Verify'}</button>
          </form>
          {state.s === 'error' && <div className="alert alert--err cert-result" role="alert"><AlertCircle size={18} /> {state.msg}</div>}
          {state.s === 'found' && d && (
            <div className="form-card cert-result" role="status">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div><span className="eyebrow" style={{ margin: 0 }}>Certificate no.</span><h3 style={{ fontFamily: 'var(--mono)', fontSize: '1.2rem', margin: 0 }}>{d.certificateNo}</h3></div>
                <span className={`status-pill status-pill--${d.status}`}>{d.status === 'valid' && <CheckCircle2 size={14} />} {d.status}</span>
              </div>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.6rem 1.5rem', marginTop: '1.5rem' }}>
                <dt className="accr-dt">Organisation</dt><dd style={{ margin: 0 }}>{d.organization}</dd>
                {d.location && <><dt className="accr-dt">Location</dt><dd style={{ margin: 0 }}>{d.location}</dd></>}
                {d.service && <><dt className="accr-dt">Service</dt><dd style={{ margin: 0 }}>{d.service}</dd></>}
                {d.scope && <><dt className="accr-dt">Scope</dt><dd style={{ margin: 0 }}>{d.scope}</dd></>}
                {d.rating && <><dt className="accr-dt">Rating / outcome</dt><dd style={{ margin: 0 }}>{d.rating}</dd></>}
                <dt className="accr-dt">Issued</dt><dd style={{ margin: 0 }}>{fmtDate(d.issueDate)}</dd>
                <dt className="accr-dt">Valid until</dt><dd style={{ margin: 0 }}>{fmtDate(d.expiryDate)}</dd>
              </dl>
              {d.file && <p style={{ marginTop: '1rem' }}><a className="link-arrow" href={fileUrl(d.file)} target="_blank" rel="noopener noreferrer">View certificate <FileText size={14} /></a></p>}
            </div>
          )}
          <p className="form__note" style={{ marginTop: '1.5rem', textAlign: 'center' }}>Can't find a certificate? <Link to="/contact" style={{ textDecoration: 'underline' }}>Contact us</Link> and we'll confirm it for you.</p>
        </div>
      </section>
    </>
  );
}

/* ============================ COMPLAINTS & APPEALS ============================ */
export function Complaints() {
  const { settings } = useSite();
  const c = settings.contact || {};
  return (
    <>
      <Seo title="Complaints & Appeals" description="How to raise a complaint or appeal with Aspira Certifications, including the hygiene rating appeal process via QCI and FSSAI." />
      <PageIntro eyebrow="Impartiality" title={<>Complaints &amp; <em className="accent">appeals</em></>} lead="Every complaint and appeal is acknowledged, recorded and handled impartially under our documented procedure." crumbs={[{ label: 'Complaints & Appeals' }]} />
      <section className="section section--first">
        <div className="container split split--top">
          <div>
            <Reveal><span className="eyebrow">Complaints procedure</span><h2>How we handle your complaint</h2></Reveal>
            <ol className="steps-ol">
              <li><div><strong>Submit</strong><p>Email {c.complaintsEmail ? <a href={`mailto:${c.complaintsEmail}`}>{c.complaintsEmail}</a> : 'us'}{c.complaintsCcEmail && <> with a copy to <a href={`mailto:${c.complaintsCcEmail}`}>{c.complaintsCcEmail}</a></>}. Verbal complaints made in person or by phone are documented within 24 hours.</p></div></li>
              <li><div><strong>Acknowledge & record</strong><p>Each submission is acknowledged and logged under our documented procedure.</p></div></li>
              <li><div><strong>Review</strong><p>The Quality Manager checks relevance, gathers information and handles the matter impartially. Anyone involved in the original inspection or decision is excluded. Complaints about auditor conduct are reviewed independently.</p></div></li>
              <li><div><strong>Resolve</strong><p>We aim to resolve cases within 15 working days of receipt. If more time is needed, you will be kept informed. The final decision is communicated formally.</p></div></li>
              <li><div><strong>Escalate</strong><p>If you are still unsatisfied, you can escalate to the Managing Director, whose decision is final.</p></div></li>
            </ol>
          </div>
          <div>
            <Reveal><span className="eyebrow">Hygiene rating appeals</span><h2>Hygiene Rating Audit appeals</h2></Reveal>
            <CheckList one items={[
              'Appeals can be submitted in writing or online by the FBO or applicant, and each receives a unique reference number.',
              'If we cannot resolve the appeal within 15 days, it is referred to the Quality Council of India (QCI).',
              'If the matter remains unresolved or unsatisfactory, the appellant can escalate to FSSAI within 15 days of the QCI decision.',
              'The process follows QCI–PADD guidelines.',
            ]} />
            <div style={{ marginTop: '2rem' }}>
              <EnquiryFormDefault type="complaint" title="Submit a complaint or appeal" subtitle="This creates a recorded submission with a reference number." compact messageLabel="Details of your complaint or appeal" />
            </div>
          </div>
        </div>
      </section>
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
