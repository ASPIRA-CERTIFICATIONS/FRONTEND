import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Target, MapPin, Phone, Mail, Clock, Search, ExternalLink, FileText, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api, fileUrl } from '../lib/api';
import Seo, { breadcrumbSchema, orgSchema } from '../components/Seo';
import { PageHero, Reveal, SectionHead, Seal, CheckList } from '../components/ui';
import { WhyChoose, IndustriesGrid, AccreditationBand, AccreditationSection, CtaBand, ServiceCard, CustomerTable, WhyAspira } from '../components/Sections';
import EnquiryFormDefault, { INTENTS } from '../components/EnquiryForm';
import { waLink } from '../lib/whatsapp';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const tel = (p) => `tel:${String(p).replace(/[^+\d]/g, '')}`;

/* ============================ ABOUT ============================ */
export function About() {
  const { settings } = useSite();
  return (
    <>
      <Seo title="About Us" description={settings.aboutShort} jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />
      <PageHero crumbs={[{ label: 'About' }]} image={settings.aboutImage} eyebrow="About Aspira" title={<>Aspiring to improve the <em className="accent">quality of lives</em></>} intro={settings.aboutShort} />
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
      <section className="section section--white">
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
      <section className="section section--tight"><div className="container"><AccreditationBand /></div></section>
      <CtaBand />
    </>
  );
}

/* ============================ ACCREDITATIONS ============================ */
export function Accreditations() {
  const { accreditations, settings } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const others = accreditations.filter((a) => a !== nabcb);
  return (
    <>
      <Seo title="NABCB Accreditation – Reg. No. IB 159" description="Aspira Certifications Private Limited is accredited by NABCB as a Type ‘A’ Inspection Body (ISO/IEC 17020:2012), Reg. No. IB 159, for green audits of educational institutions. Download the certificate." jsonLd={[orgSchema(settings, accreditations), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Accreditation', path: '/accreditations' }])]} />
      <PageHero
        crumbs={[{ label: 'Accreditation' }]}
        eyebrow="Accreditation"
        title={<>NABCB-accredited <em className="accent">Inspection Body</em></>}
        intro="We publish our accreditation in full — registration number, standard, scope and validity — with the certificate available to download and verify."
        doc="cert"
        primary={{ to: '/services/green-audits#enquire', label: 'Book an accredited Green Audit', wa: 'Hello Aspira, I would like to book a NABCB-accredited Green Audit for our institution.' }}
        accrText="NABCB accredited for green audits · IB 159"
      />
      <section className="section">
        <div className="container">
          <AccreditationSection />
        </div>
      </section>
      <section className="section section--white">
        <div className="container split split--top">
          <Reveal>
            <span className="eyebrow">About NABCB</span>
            <h2>What NABCB accreditation means</h2>
          </Reveal>
          <Reveal className="prose" delay={0.06}>
            <p>The National Accreditation Board for Certification Bodies (NABCB) is India’s national accreditation authority under the Quality Council of India. It assesses certification, inspection and verification bodies to confirm they operate with competence, impartiality and internationally accepted practices.</p>
            <p>For you, NABCB accreditation is assurance that the audit you rely on is carried out to recognised international standards — giving your institution or organisation confidence in the results and strengthening trust with regulators and stakeholders.</p>
            <div className="note"><AlertCircle size={18} /> <span>Our accreditation applies to the scope stated above — green audits of educational institutions. Our other services are delivered as independent third-party assessments with the same impartial approach.</span></div>
          </Reveal>
        </div>
      </section>
      {others.length > 0 && (
        <section className="section">
          <div className="container accr-cards">
            {others.map((a) => (
              <Reveal key={a._id} className="accr-card">
                <div>
                  <span className="eyebrow">{a.shortName}</span>
                  <h2 style={{ fontSize: 'var(--fs-xl)' }}>{a.title}</h2>
                  {a.description && <p style={{ color: 'var(--muted)' }}>{a.description}</p>}
                  {a.registrationNo && <p><b>Registration no.:</b> {a.registrationNo}</p>}
                  {a.scope && <p><b>Scope:</b> {a.scope}</p>}
                </div>
                <div>{a.logo && <img src={fileUrl(a.logo)} alt={`${a.shortName} logo`} style={{ maxWidth: 180 }} loading="lazy" />}</div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      <CtaBand title="Book an accredited green audit" text="NABCB-accredited green audits for schools, colleges and universities." service="Green Audits" />
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
  const intent = INTENTS[params.get('intent')] ? params.get('intent') : 'quote';
  const aud = AUDIENCES.find((x) => x.key === ({ green: 'institution', hygiene: 'restaurant' }[params.get('for')] || params.get('for'))) || AUDIENCES[2];
  const set = (k, v) => {
    const next = new URLSearchParams(params);
    next.set(k, v);
    setParams(next, { replace: true });
  };
  return (
    <>
      <Seo title="Contact Us – Book an Audit or Request a Quote" description={`Book an audit, request a quote or talk to Aspira's experts. Call ${c.phones?.[0] || ''} or email ${c.emails?.[0] || ''}.`} jsonLd={[orgSchema(settings, []), breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])]} />
      <PageHero crumbs={[{ label: 'Contact' }]} pageKey="contact" image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=70" eyebrow="Contact" title={<>Let's talk about your <em className="accent">audit</em></>} intro="Book an audit, request a quote or speak to our experts — we respond to every enquiry." primary={{ href: '#enquiry', label: 'Send an enquiry' }} />
      <section className="section" id="enquiry">
        <div className="container contact-grid">
          <div className="contact-list">
            <div className="intent-tabs" role="tablist" aria-label="What would you like to do?">
              {Object.entries(INTENTS).map(([k, v]) => (
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
      <Seo title="Certificate Status" description="Verify the status of a certificate or inspection report issued by Aspira Certifications." />
      <PageHero crumbs={[{ label: 'Certificate Status' }]} doc="cert" primary={{ href: '#cert-no', label: 'Verify a certificate' }} eyebrow="Verify" title={<>Check a certificate's <em className="accent">status</em></>} intro="Enter the certificate or report number exactly as printed to confirm it was issued by Aspira and is currently valid." />
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
      <PageHero crumbs={[{ label: 'Complaints & Appeals' }]} pageKey="complaints" image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=70" actions={false} eyebrow="Impartiality" title={<>Complaints & <em className="accent">appeals</em></>} intro="Every complaint and appeal is acknowledged, recorded and handled impartially under our documented procedure." />
      <section className="section">
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
