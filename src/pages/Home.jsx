import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Leaf, ShieldCheck, UtensilsCrossed, Headset, GraduationCap, Briefcase, CalendarCheck } from 'lucide-react';
import { useSite, useFetch } from '../context/SiteContext';
import Seo, { orgSchema } from '../components/Seo';
import { Reveal, SectionHead, ArrowLink, BADGE_SRC } from '../components/ui';
import { VerifyStrip, TrustBar, ServiceCard, imgSize, AudienceSplit, CustomerTable, AccreditationSection, ProcessSteps, Testimonials, ClientLogos, CtaBand } from '../components/Sections';
import { PostCard, CaseCard } from './Publishing';
import { isApiDown } from '../lib/api';
import { FALLBACK_POSTS } from '../lib/fallback';
import EnquiryForm from '../components/EnquiryForm';

const FORM_TABS = [
  { key: 'institution', label: 'Educational institution', sub: 'Green Audit', I: GraduationCap, service: 'Green Audits', slug: 'green-audits', category: 'Sustainability', title: 'Book a Green Audit for your institution', submit: 'Book a Green Audit' },
  { key: 'restaurant', label: 'Restaurant / food outlet', sub: 'Hygiene Rating Audit', I: UtensilsCrossed, service: 'Hygiene Rating Audits', slug: 'hygiene-rating-audits', category: 'Food Safety', title: 'Get your restaurant audited', submit: 'Get My Restaurant Audited' },
  { key: 'default', label: 'Other services', sub: 'Safety, energy, water…', I: Briefcase, service: '', slug: '', category: '', title: 'Request a quote', submit: 'Request a Quote' },
];

export default function Home() {
  const { settings, services, accreditations } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const others = services.filter((s) => !s.parentSlug && !['green-audits', 'hygiene-rating-audits'].includes(s.slug));
  const heroTitle = settings.heroTitle || 'Inspection services that elevate your business potential';
  const words = heroTitle.split(' ');
  const accentFrom = Math.max(1, words.length - 2);
  const [tab, setTab] = useState(FORM_TABS[0]);
  const postsRes = useFetch('/posts?limit=3');
  const posts = postsRes.data || (isApiDown(postsRes.error) ? FALLBACK_POSTS.slice(0, 3) : []);
  const cases = useFetch('/case-studies').data || [];

  return (
    <>
      <Seo jsonLd={[orgSchema(settings, accreditations), { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName || 'Aspira Certifications', url: (import.meta.env.VITE_SITE_URL || window.location.origin) + '/' }]} />

      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            {nabcb && (
              <Link to="/accreditations" className="hero__accr">
                <img src={BADGE_SRC} alt="" width="44" height="48" />
                <span><b>{nabcb.shortName} Accredited Inspection Body</b>Reg. No. {nabcb.registrationNo} · ISO/IEC 17020 Type ‘A’</span>
              </Link>
            )}
            <span className="eyebrow">{settings.tagline || 'Audit · Inspection · Certification'}</span>
            <h1 aria-label={heroTitle}>
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className="w" aria-hidden="true">
                    <span style={{ animationDelay: `${0.05 * i}s` }}>{i >= accentFrom ? <em className="accent">{w}</em> : w}</span>
                  </span>{' '}
                </Fragment>
              ))}
            </h1>
            <p className="hero__lead">{settings.heroSubtitle}</p>
            <div className="hero__actions">
              <Link to="/contact?intent=booking#enquiry" className="btn btn--green"><CalendarCheck size={16} /> Book an audit</Link>
              <Link to="/contact?intent=expert#enquiry" className="btn btn--ghost"><Headset size={16} /> Talk to our experts</Link>
            </div>
            <div className="hero__quick">
              <Link to="/services/green-audits"><span className="hq-ic hq-ic--green"><GraduationCap size={16} /></span><span><b>Green Audit</b>for educational institutions</span><ArrowRight size={14} /></Link>
              <Link to="/services/hygiene-rating-audits"><span className="hq-ic hq-ic--amber"><UtensilsCrossed size={16} /></span><span><b>Hygiene Rating Audit</b>for restaurants & food businesses</span><ArrowRight size={14} /></Link>
            </div>
          </div>

          <div className="hero__media">
            {settings.heroImage && <img className="hero__img" src={imgSize(settings.heroImage, 1200)} alt="Aspira auditors reviewing an inspection on site" width="1200" height="900" fetchpriority="high" />}
            <div className="report report--float" aria-label="Illustration of an Aspira inspection report">
              <div className="report__top">
                <div><small>Inspection report</small><strong>Compliance summary</strong></div>
              </div>
              <ul className="report__rows">
                <li><span className="tick"><Check size={12} strokeWidth={3} /></span><span><Leaf size={13} className="ri" />Campus green audit</span><em>Done</em></li>
                <li><span className="tick"><Check size={12} strokeWidth={3} /></span><span><UtensilsCrossed size={13} className="ri" />Restaurant hygiene</span><em>Done</em></li>
                <li><span className="tick"><Check size={12} strokeWidth={3} /></span><span><ShieldCheck size={13} className="ri" />Workplace safety</span><em>Done</em></li>
              </ul>
            </div>
            {nabcb && (
              <div className="hero__badge-card">
                <img src={BADGE_SRC} alt="NABCB Accredited Inspection Body – Reg. No. IB 159" width="64" height="70" />
                <div><b>NABCB Accredited</b><span>Valid till Sep 2028</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <TrustBar />
      <section className="section section--tight vstrip-sec"><div className="container"><VerifyStrip /></div></section>

      {/* ---------------- WHO WE SERVE ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHead split eyebrow="Who we serve" title={<>Specialist audits for <em className="accent">campuses</em> and <em className="accent">restaurants</em></>} intro="We are a B2B audit, inspection and certification company — our clients are organisations. Green Audits for educational institutions, Hygiene Rating Audits for food businesses, and safety, energy and water audits for everyone else." />
          <AudienceSplit />
          <div style={{ marginTop: '2rem' }}>
            <h3 className="ctable-title">Which service is right for your organisation?</h3>
            <CustomerTable limit={7} />
          </div>
        </div>
      </section>

      {/* ---------------- ACCREDITATION (USP) ---------------- */}
      <section className="section section--white" id="accreditation">
        <div className="container">
          <SectionHead split eyebrow="Accreditation" title={<>Accredited by <em className="accent">NABCB</em> — so your audit report carries weight</>} intro="Choosing an accredited inspection body means your audit is carried out by an organisation whose competence and impartiality have been independently assessed." />
          <AccreditationSection compactHead />
        </div>
      </section>

      {/* ---------------- OTHER SERVICES ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHead split eyebrow="Other services" title="Construction, electrical, fire, energy & water audits" intro="Independent third-party audits for builders, factories, offices, hotels, institutions and commercial buildings.">
            <div style={{ marginTop: '.75rem' }}><ArrowLink to="/services">View all services</ArrowLink></div>
          </SectionHead>
          <div className="services-grid services-grid--4">
            {others.map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section className="section section--white">
        <div className="container">
          <SectionHead center eyebrow="How it works" title="From enquiry to certification in six clear steps" />
          <ProcessSteps white />
        </div>
      </section>

      <Testimonials />

      {cases.length > 0 && (
        <section className="section section--paper2">
          <div className="container">
            <SectionHead split eyebrow="Case studies" title="Recent audits we've delivered"><div style={{ marginTop: '.75rem' }}><ArrowLink to="/case-studies">All case studies</ArrowLink></div></SectionHead>
            <div className="post-grid">{cases.slice(0, 3).map((c) => <CaseCard key={c._id} c={c} />)}</div>
          </div>
        </section>
      )}

      <ClientLogos />

      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead split eyebrow="Insights" title="Guides for institutions & food businesses"><div style={{ marginTop: '.75rem' }}><ArrowLink to="/blog">Read the blog</ArrowLink></div></SectionHead>
            <div className="post-grid">{posts.map((p) => <PostCard key={p._id} p={p} />)}</div>
          </div>
        </section>
      )}

      {/* ---------------- ENQUIRY ---------------- */}
      <section className="section section--white" id="enquiry">
        <div className="container split split--top">
          <Reveal>
            <span className="eyebrow">Enquire</span>
            <h2>Tell us what you need audited</h2>
            <p className="lead">Choose who you are and share a few details. Our team will reply with the right scope, timeline and fees.</p>
            <div className="form-tabs" role="tablist" aria-label="Enquiry type">
              {FORM_TABS.map((t) => (
                <button key={t.key} role="tab" aria-selected={tab.key === t.key} onClick={() => setTab(t)}>
                  <t.I size={18} />
                  <span><b>{t.label}</b><small>{t.sub}</small></span>
                </button>
              ))}
            </div>
            <ul className="check-list check-list--one" style={{ marginTop: '1.25rem' }}>
              <li><Check size={17} strokeWidth={2.4} /> <span>NABCB-accredited inspection body</span></li>
              <li><Check size={17} strokeWidth={2.4} /> <span>Independent, impartial assessment</span></li>
              <li><Check size={17} strokeWidth={2.4} /> <span>Your information is kept confidential</span></li>
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <EnquiryForm
              key={tab.key}
              variant={tab.key}
              service={tab.service}
              serviceSlug={tab.slug}
              category={tab.category}
              lockService={!!tab.service}
              intent="booking"
              title={tab.title}
              submitLabel={tab.submit}
            />
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
