/**
 * Home – v3, styled after the reference site the client liked (magirenewables.com):
 * full-bleed photo hero with frosted fact cards, centred section headings, photo service cards,
 * a dark "why choose us" band, enquiry form, industries grid, numbered process, insights and FAQ.
 * All facts are Aspira's own (NABCB certificate, policies, services) – no invented statistics.
 */
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, FileCheck2, ClipboardCheck, CheckCircle2, Check, Leaf, ShieldCheck, Headset, CalendarCheck, Scale, FileSearch, Lock, Users, RefreshCcw, GraduationCap, UtensilsCrossed,
  Briefcase, Hotel, HardHat, Factory, Building2, Warehouse, School, MapPin,
} from 'lucide-react';
import { useSite, useFetch } from '../context/SiteContext';
import Seo, { orgSchema, faqSchema } from '../components/Seo';
import { Reveal, Faq, NABCB_VERIFY_URL } from '../components/ui';
import { imgSize, Testimonials, ClientLogos, CtaBand, WhyAspira } from '../components/Sections';
import EnquiryForm from '../components/EnquiryForm';
import { photo } from '../lib/companyPhotos';

const ABOUT_PHOTO = photo('05');
const HOME_PHOTOS = ['01', '02', '07', '06', '04'].map(photo);
// hero background slideshow – photos framed to keep people in view
const HERO_SLIDES = [['04', '50% 40%'], ['05', '50% 45%'], ['03', '50% 30%'], ['10', '50% 30%'], ['06', '50% 35%']].map(([n, pos]) => ({ ...photo(n), pos }));
import { isApiDown, fileUrl } from '../lib/api';
import { Icon } from '../lib/icons';
import { FALLBACK_POSTS } from '../lib/fallback';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const short = (x) => String(x?.title || x || '').split(' – ')[0];

/* Who we serve – each sector links to the audits designed for it (slugs from the services list) */
const SECTORS = [
  { I: School, t: 'Educational institutions', slugs: ['green-audits', 'energy-audits', 'water-audits'] },
  { I: UtensilsCrossed, t: 'Restaurants & food businesses', slugs: ['hygiene-rating-audits'] },
  { I: Hotel, t: 'Hotels & hospitality', slugs: ['hygiene-rating-audits', 'fire-safety-audits'] },
  { I: HardHat, t: 'Builders & contractors', slugs: ['construction-safety-audits'] },
  { I: Factory, t: 'Factories & industries', slugs: ['electrical-safety-audits', 'workplace-safety-audits', 'fire-safety-audits', 'energy-audits'] },
  { I: Building2, t: 'Commercial buildings', slugs: ['electrical-safety-audits', 'energy-audits', 'green-building-assessments'] },
  { I: Warehouse, t: 'Warehouses & logistics', slugs: ['warehouse-safety-audits'] },
  { I: Briefcase, t: 'Offices & workplaces', slugs: ['fire-safety-audits', 'workplace-safety-audits'] },
];



/** Counts up from 0 to `to` once the element scrolls into view */
function CountUp({ to, duration = 1400 }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { setN(to); return undefined; }
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / duration);
        setN(Math.round(to * (1 - (1 - k) ** 3)));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref}>{n}</span>;
}

/** Hero background: Aspira's own on-site audit photos, cross-fading with a slow zoom */
function HeroSlides({ slides }) {
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(1); // only the first photo loads up front
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => {
      setI((n) => (n + 1) % slides.length);
      setReady((r) => Math.min(slides.length, r + 1));
    }, 5500);
    // warm the next photos once the page is idle
    const t = setTimeout(() => setReady(slides.length), 2500);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [slides.length]);
  return (
    <div className="vh__bg" aria-hidden="true">
      {slides.slice(0, ready).map((ph, k) => (
        <img
          key={ph._id}
          className={`vh__slide ${k === i ? 'is-on' : ''}`}
          src={ph.image}
          width={ph.width}
          height={ph.height}
          alt=""
          fetchpriority={k === 0 ? 'high' : 'low'}
          decoding="async"
          style={{ objectPosition: ph.pos || '50% 35%' }}
        />
      ))}
      <span className="vh__shade" />
      {slides.length > 1 && (
        <span className="vh__dots">
          {slides.map((ph, k) => <i key={ph._id} className={k === i ? 'on' : ''} />)}
        </span>
      )}
    </div>
  );
}

/** Hero card: Aspira's commitments (from its Quality, Impartiality and Confidentiality policies) */
const COMMITMENTS = [
  { I: Scale, t: 'Impartial', d: 'No consultancy, training or internal audits for the clients we inspect.' },
  { I: ShieldCheck, t: 'Independent', d: 'Type ‘A’ inspection body – free from commercial or financial influence.' },
  { I: Lock, t: 'Confidential', d: 'Client information protected in line with ISO/IEC 17020.' },
  { I: FileSearch, t: 'Evidence-based', d: 'Every finding rests on objective, verifiable evidence.' },
];
function HeroPanel() {
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setOn((n) => (n + 1) % COMMITMENTS.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hpan hpan--c">
      <div className="hpan__glow" aria-hidden="true" />
      <div className="hpan__card">
        <div className="hpan__head">
          <span className="hpan__live"><i aria-hidden="true" /> Our commitments</span>
        </div>
        <ul className="hcm">
          {COMMITMENTS.map(({ I, t, d }, k) => (
            <li key={t} className={k === on ? 'is-on' : ''}>
              <span className="hcm__ic"><I size={18} /></span>
              <span><b>{t}</b><small>{d}</small></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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
  const heroTitle = settings.heroTitle || 'Audits & inspections you can rely on';
  const words = heroTitle.split(' ');
  const accentFrom = Math.max(1, words.length - 2);
  const postsRes = useFetch('/posts?limit=3');
  const posts = postsRes.data || (isApiDown(postsRes.error) ? FALLBACK_POSTS.slice(0, 3) : []);
  const faqs = [
    ...(bySlug['green-audits']?.faqs || []).slice(0, 2),
    ...(bySlug['hygiene-rating-audits']?.faqs || []).slice(0, 2),
    ...(bySlug['safety-audits']?.faqs || []).slice(0, 1),
  ];

  return (
    <div className="mg">
      <Seo jsonLd={[orgSchema(settings, accreditations), faqSchema(faqs), { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName || 'Aspira Certifications', url: (import.meta.env.VITE_SITE_URL || window.location.origin) + '/' }]} />

      {/* ---------- ACCREDITATION BANNER ---------- */}
      <div className="accr-banner pbanner" role="note">
        <span className="pbanner__sheen" aria-hidden="true" />
        <div className="mg-wrap pbanner__in">
          <span className="pbanner__tag"><BadgeCheck size={14} aria-hidden="true" /> NABCB Accredited</span>
          <span className="pbanner__div" aria-hidden="true" />
          <p>We are a <b>National Accreditation Board for Certification Bodies (NABCB)</b> accredited Inspection Body <b>(Reg No: {nabcb?.registrationNo || 'IB 159'})</b> for green audits for educational institutions (IAF Scope 28)</p>
          <a href={NABCB_VERIFY_URL} target="_blank" rel="noopener noreferrer" className="pbanner__link">Verify <ArrowUpRight size={14} /></a>
        </div>
      </div>

      {/* ---------- HERO: background video, animated headline, key facts ---------- */}
      <section className="vh" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`); }}>
        <span className="vh__spot" aria-hidden="true" />
        <span className="vh__grid" aria-hidden="true" />
        <HeroSlides slides={HERO_SLIDES} />
        <div className="mg-wrap vh__inner">
          <div className="vh__text">
            <span className="vh__eyebrow"><span className="vh__dot" />{settings.tagline || 'Audits · Inspections · Assessments'}</span>
            <h1 aria-label={heroTitle}>
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className="w" aria-hidden="true">
                    <span style={{ animationDelay: `${0.15 + 0.06 * i}s` }}>{i >= accentFrom ? <em className="accent">{w}</em> : w}</span>
                  </span>{' '}
                </Fragment>
              ))}
            </h1>
            {settings.heroSubtitle && <p className="vh__lead">{settings.heroSubtitle}</p>}
            <div className="vh__actions">
              <Link to="/contact?intent=booking#enquiry" className="btn btn--green btn--lg vh__cta"><CalendarCheck size={18} /> Book an audit <ArrowRight size={17} /></Link>
            </div>
          </div>

          <HeroPanel />
        </div>
      </section>

      {/* ---------- KEY FACTS: floating card overlapping the hero ---------- */}
      <div className="mg-wrap kf-wrap">
        <dl className="kf" aria-label="Aspira at a glance">
          <div className="kf__item" style={{ '--i': 0 }}>
            <span className="kf__ic"><ClipboardCheck size={22} strokeWidth={1.8} /></span>
            <div><dd><CountUp to={services.length || parents.length} /></dd><dt>Audit &amp; inspection services</dt></div>
          </div>
          <div className="kf__item" style={{ '--i': 1 }}>
            <span className="kf__ic"><Building2 size={22} strokeWidth={1.8} /></span>
            <div><dd><CountUp to={SECTORS.length} /></dd><dt>Sectors served</dt></div>
          </div>
          <div className="kf__item" style={{ '--i': 2 }}>
            <span className="kf__ic"><Scale size={22} strokeWidth={1.8} /></span>
            <div><dd>Type ‘A’</dd><dt>Independent inspection body</dt></div>
          </div>
          <div className="kf__item" style={{ '--i': 3 }}>
            <span className="kf__ic"><ShieldCheck size={22} strokeWidth={1.8} /></span>
            <div><dd>ISO/IEC 17020</dd><dt>Inspection standard</dt></div>
          </div>
        </dl>
      </div>

      {/* Client logos appear here once genuine ones are uploaded */}
      <ClientLogos />

      {/* ---------- ABOUT ---------- */}
      <section className="mg-sec" id="about">
        <div className="mg-wrap mg-about">
          <Reveal className="mg-about__media">
            <img src={ABOUT_PHOTO.image} width={ABOUT_PHOTO.width} height={ABOUT_PHOTO.height} alt="Aspira audit team with faculty members of an institution" loading="lazy" decoding="async" className="mg-about__photo" />
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

      <WhyAspira />

      {/* ---------- ENQUIRY ---------- */}
      <section className="mg-sec mg-enq" id="enquiry">
        <div className="mg-wrap">
          <Head kicker="Get started" title="Tell us what you need" text="Share a few details about your organisation and the audit or inspection you need – we'll confirm the scope, standards and timeline." />
          <div className="mg-enq__card">
            <EnquiryForm variant="default" title="" submitLabel="Send enquiry" intent="booking" />
          </div>
        </div>
      </section>

      {/* ---------- WHO WE SERVE: sector → matching audits ---------- */}
      <section className="mg-sec mg-sec--soft">
        <div className="mg-wrap">
          <Head kicker="Who we serve" title="Sectors we work with" text="Independent audits and inspections for organisations across these sectors." />
          <div className="ws-tiles">
            {SECTORS.map(({ I, t }, i) => (
              <Reveal key={t} delay={i * 0.03} className="ws-tile">
                <span className="ws-tile__ic"><I size={22} strokeWidth={1.7} /></span>
                <h3>{t}</h3>
              </Reveal>
            ))}
          </div>
          <div className="mg-center"><Link to="/industries" className="btn btn--outline">See all industries <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      {/* ---------- GALLERY PREVIEW: Aspira's own photos ---------- */}
      <section className="mg-sec hg">
        <div className="mg-wrap">
          <div className="hg__head">
            <Head kicker="Gallery" title="From our audits" text="Real photos from our on-site inspection audits." />
            <Link to="/gallery" className="btn btn--outline hg__all">View full gallery <ArrowRight size={16} /></Link>
          </div>
          <div className="hg__grid">
            {HOME_PHOTOS.map((ph, i) => (
              <Reveal key={ph._id} delay={i * 0.05} as={Link} to="/gallery" className={`hg__item hg__item--${i + 1}`}>
                <img src={i === 0 ? ph.image : ph.thumb} width={ph.width} height={ph.height} alt={ph.title} loading="lazy" decoding="async" />
                
              </Reveal>
            ))}
          </div>
          <div className="hg__more"><Link to="/gallery" className="btn btn--outline">View full gallery <ArrowRight size={16} /></Link></div>
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
