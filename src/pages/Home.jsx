/**
 * Home – v3, styled after the reference site the client liked (magirenewables.com):
 * full-bleed photo hero with frosted fact cards, centred section headings, photo service cards,
 * a dark "why choose us" band, enquiry form, industries grid, numbered process, insights and FAQ.
 * All facts are Aspira's own (NABCB certificate, policies, services) – no invented statistics.
 */
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, CheckCircle2, Check, Leaf, ShieldCheck, Headset, CalendarCheck, Scale, FileSearch, Lock, Users, RefreshCcw, GraduationCap, UtensilsCrossed,
  Briefcase, Hotel, HardHat, Factory, Building2, Warehouse, School,
} from 'lucide-react';
import { useSite, useFetch } from '../context/SiteContext';
import Seo, { orgSchema, faqSchema } from '../components/Seo';
import { Reveal, Faq, BADGE_SRC } from '../components/ui';
import { imgSize, Testimonials, ClientLogos, CtaBand } from '../components/Sections';
import EnquiryForm from '../components/EnquiryForm';
import { isApiDown, fileUrl } from '../lib/api';
import { Icon } from '../lib/icons';
import { FALLBACK_POSTS } from '../lib/fallback';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const short = (x) => String(x?.title || x || '').split(' – ')[0];

/* Why Aspira – every point comes from Aspira's accreditation certificate or its published policies */
const WHY = [
  { I: BadgeCheck, t: 'NABCB accredited', d: 'Type ‘A’ inspection body under ISO/IEC 17020, Reg. No. IB 159.' },
  { I: Scale, t: 'Independent & impartial', d: 'We do not provide consultancy, training or internal audits to the clients we inspect.' },
  { I: FileSearch, t: 'Evidence-based decisions', d: 'Findings rest on objective evidence – free from commercial, financial or external influence.' },
  { I: Lock, t: 'Strict confidentiality', d: 'Client information is protected in line with ISO/IEC 17020 and the DPDP Act 2023.' },
  { I: Users, t: 'Impartiality Committee', d: 'A dedicated committee regularly reviews and monitors impartiality risks.' },
  { I: RefreshCcw, t: 'Continuous improvement', d: 'Our systems, processes and resources are reviewed and improved through audits.' },
];

/* Who we serve – mapped from each service's stated audience */
const INDUSTRIES = [
  { I: School, t: 'Educational institutions', d: 'Green, energy and water audits for schools, colleges and universities.' },
  { I: UtensilsCrossed, t: 'Restaurants & food businesses', d: 'Hygiene rating audits for restaurants, canteens and food outlets.' },
  { I: Hotel, t: 'Hotels & hospitality', d: 'Hygiene and fire safety audits for hotels and kitchens.' },
  { I: HardHat, t: 'Builders & contractors', slug: 'construction-safety-audits', d: 'Construction safety audits – scaffolding, PPE and site practices.' },
  { I: Factory, t: 'Factories & industries', slug: 'electrical-safety-audits', d: 'Electrical, workplace, fire, energy and water audits.' },
  { I: Building2, t: 'Commercial buildings', d: 'Electrical safety, energy audits and green building assessments.' },
  { I: Warehouse, t: 'Warehouses & logistics', d: 'Warehouse safety audits – storage, racking and material handling.' },
  { I: Briefcase, t: 'Offices & institutions', slug: 'fire-safety-audits', d: 'Fire safety and workplace safety audits.' },
];

const FORM_TABS = [
  { key: 'institution', label: 'Educational institution', I: GraduationCap, service: 'Green Audits', slug: 'green-audits', category: 'Sustainability', title: 'Book a Green Audit for your institution', submit: 'Book a Green Audit' },
  { key: 'restaurant', label: 'Restaurant / food business', I: UtensilsCrossed, service: 'Hygiene Rating Audits', slug: 'hygiene-rating-audits', category: 'Food Safety', title: 'Get your restaurant audited', submit: 'Get My Restaurant Audited' },
  { key: 'default', label: 'Other organisations', I: Briefcase, service: '', slug: '', category: '', title: 'Request a quote', submit: 'Request a Quote' },
];

function Head({ kicker, title, text, light = false, center = true }) {
  return (
    <div className={`mg-head ${center ? 'is-center' : ''} ${light ? 'is-light' : ''}`}>
      {kicker && <p className="mg-kicker">{kicker}</p>}
      <h2>{title}</h2>
      {text && <p className="mg-sub">{text}</p>}
    </div>
  );
}

export default function Home() {
  const { settings, services, accreditations } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const parents = services.filter((s) => !s.parentSlug);
  const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
  const steps = (settings.process || []).slice(0, 6);
  const heroTitle = settings.heroTitle || 'Audit, inspection & certification';
  const words = heroTitle.split(' ');
  const accentFrom = Math.max(1, words.length - 2);
  const postsRes = useFetch('/posts?limit=3');
  const posts = postsRes.data || (isApiDown(postsRes.error) ? FALLBACK_POSTS.slice(0, 3) : []);
  const [tab, setTab] = useState(FORM_TABS[0]);
  const faqs = [
    ...(bySlug['green-audits']?.faqs || []).slice(0, 2),
    ...(bySlug['hygiene-rating-audits']?.faqs || []).slice(0, 2),
    ...(bySlug['safety-audits']?.faqs || []).slice(0, 1),
  ];

  return (
    <div className="mg">
      <Seo jsonLd={[orgSchema(settings, accreditations), faqSchema(faqs), { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName || 'Aspira Certifications', url: (import.meta.env.VITE_SITE_URL || window.location.origin) + '/' }]} />

      {/* ---------- HERO (original design, kept at the client's request) ---------- */}
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


      {/* Client logos appear here once genuine ones are uploaded */}
      <ClientLogos />

      {/* ---------- ABOUT ---------- */}
      <section className="mg-sec">
        <div className="mg-wrap mg-about">
          <Reveal className="mg-about__media">
            {(settings.aboutImage || bySlug['safety-audits']?.image) && <img src={imgSize(fileUrl(settings.aboutImage || bySlug['safety-audits'].image), 1000)} alt="Aspira auditors at work" loading="lazy" />}
            {nabcb && (
              <Link to="/accreditations" className="mg-about__badge">
                <img src={nabcb.logo ? fileUrl(nabcb.logo) : BADGE_SRC} alt="" width="40" height="44" />
                <span><b>NABCB Accredited</b>Reg. No. {nabcb.registrationNo}</span>
              </Link>
            )}
          </Reveal>
          <div className="mg-about__text">
            <Head center={false} kicker="About Aspira" title="Independent audits you can rely on" />
            <p className="mg-about__p">{(settings.aboutShort || '').split('\n\n')[0]}</p>
            <p className="mg-about__p">We are a business-to-business (B2B) company – our clients are organisations, not individual consumers.</p>
            <ul className="mg-checks">
              {['green-audits', 'hygiene-rating-audits', 'safety-audits', 'energy-audits'].map((slug) => bySlug[slug] && (
                <li key={slug}>
                  <CheckCircle2 size={20} />
                  <span><b>{bySlug[slug].title}</b>{(bySlug[slug].audience || '').replace(/^For /, 'For ')}</span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="mg-link">More about us <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* ---------- SERVICES: photo cards ---------- */}
      <section className="mg-sec mg-sec--soft">
        <div className="mg-wrap">
          <Head kicker="Our services" title="Audit & inspection services" text="Independent, standards-based audits for institutions, food businesses, workplaces and buildings." />
          <div className="sv-grid">
            {parents.map((s, i) => {
              const points = (s.scope || []).slice(0, 3).map(short);
              return (
                <Reveal key={s.slug} delay={i * 60} as={Link} to={`/services/${s.slug}`} className="sv-card">
                  <div className="sv-card__img">
                    {s.image && <img src={imgSize(fileUrl(s.image), 760)} alt="" loading="lazy" />}
                    <span className="sv-card__ic"><Icon name={s.icon} size={22} /></span>
                  </div>
                  <div className="sv-card__body">
                    <h3>{s.title}</h3>
                    {s.audience && <p className="sv-card__for">{s.audience}</p>}
                    {points.length > 0 ? (
                      <ul className="sv-card__list">{points.map((x) => <li key={x}><Check size={15} strokeWidth={2.5} />{x}</li>)}</ul>
                    ) : (
                      s.shortDescription && <p className="sv-card__desc">{s.shortDescription}</p>
                    )}
                    <span className="sv-card__go">Explore service <ArrowRight size={16} /></span>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mg-center"><Link to="/services" className="btn btn--outline">View all services <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      {/* ---------- WHY ASPIRA ---------- */}
      <section className="mg-sec wy">
        <div className="mg-wrap wy__grid">
          <div className="wy__aside">
            <p className="mg-kicker">Why Aspira</p>
            <h2>Why organisations choose Aspira</h2>
            <p className="wy__intro">Our commitments are set out in our Quality, Impartiality and Confidentiality policies – and assessed by NABCB as part of our accreditation.</p>
            {nabcb && (
              <div className="wy__cred">
                <img src={nabcb.logo ? fileUrl(nabcb.logo) : BADGE_SRC} alt="" width="58" height="63" />
                <div>
                  <b>NABCB Accredited Inspection Body</b>
                  <span>Reg. No. {nabcb.registrationNo} · ISO/IEC 17020:2012 · Type ‘A’</span>
                </div>
              </div>
            )}
            <div className="wy__actions">
              <Link to="/policies" className="btn">Read our policies <ArrowRight size={16} /></Link>
              <Link to="/accreditations" className="mg-link">View accreditation <ArrowRight size={16} /></Link>
            </div>
          </div>
          <ol className="wy__list">
            {WHY.map(({ I, t, d }, idx) => (
              <li key={t}>
                <div className="wy__ic"><I size={20} /></div>
                <div>
                  <span className="wy__no">{String(idx + 1).padStart(2, '0')}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- ENQUIRY ---------- */}
      <section className="mg-sec mg-enq" id="enquiry">
        <div className="mg-wrap">
          <Head kicker="Get started" title="Find the right audit for your organisation" text="Tell us who you are and what you need – we'll confirm the scope, standards and timeline." />
          <div className="mg-enq__card">
            <div className="mg-tabs" role="tablist" aria-label="Who is enquiring">
              {FORM_TABS.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={tab.key === t.key} onClick={() => setTab(t)}>
                  <t.I size={18} /> {t.label}
                </button>
              ))}
            </div>
            <EnquiryForm
              key={tab.key}
              variant={tab.key}
              service={tab.service}
              serviceSlug={tab.slug}
              category={tab.category}
              title={tab.title}
              submitLabel={tab.submit}
              lockService={!!tab.service}
              intent="booking"
            />
          </div>
        </div>
      </section>

      {/* ---------- INDUSTRIES ---------- */}
      <section className="mg-sec mg-sec--soft">
        <div className="mg-wrap">
          <Head kicker="Who we serve" title="Audits for every kind of organisation" text="Each audit is matched to the organisations it is designed for." />
          <div className="mg-ind">
            {INDUSTRIES.map(({ I, t, d, slug }) => {
              // where a service states its audience, show that exact wording
              const s = slug && bySlug[slug];
              const text = s?.audience ? `${s.title} ${s.audience.replace(/^For /, 'for ')}.` : d;
              return (
                <div key={t} className="mg-ind__card">
                  <span className="mg-ind__ic"><I size={22} /></span>
                  <h3>{t}</h3>
                  <p>{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- PROCESS ---------- */}
      {steps.length > 0 && (
        <section className="mg-sec">
          <div className="mg-wrap">
            <Head kicker="How it works" title="From enquiry to report" text="A clear, documented process for every audit and inspection." />
            <ol className="mg-steps" style={{ '--n': steps.length }}>
              {steps.map((st, i) => (
                <li key={st.title}>
                  <span className="mg-steps__n">{String(i + 1).padStart(2, '0')}</span>
                  <b>{st.title}</b>
                  <p>{st.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <Testimonials />

      {/* ---------- INSIGHTS ---------- */}
      {posts.length > 0 && (
        <section className="mg-sec mg-sec--soft">
          <div className="mg-wrap">
            <Head kicker="Insights" title="Guides from our auditors" />
            <div className="mg-posts">
              {posts.map((p) => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="mg-post">
                  <div className="mg-post__img">{p.coverImage && <img src={imgSize(fileUrl(p.coverImage), 700)} alt="" loading="lazy" />}</div>
                  <div className="mg-post__body">
                    <small>{[p.category, fmtDate(p.publishedAt)].filter(Boolean).join(' · ')}</small>
                    <h3>{p.title}</h3>
                    <span className="mg-link">Read article <ArrowRight size={15} /></span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mg-center"><Link to="/blog" className="btn btn--outline">View all articles <ArrowRight size={16} /></Link></div>
          </div>
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      {faqs.length > 0 && (
        <section className="mg-sec">
          <div className="mg-wrap mg-faq">
            <Head kicker="FAQ" title="Frequently asked questions" />
            <Faq items={faqs} />
          </div>
        </section>
      )}

      {/* ---------- CTA (existing band) ---------- */}
      <CtaBand title="Planning an audit or inspection?" text="Tell us about your organisation and we'll confirm the scope, standards and timeline." />
    </div>
  );
}
