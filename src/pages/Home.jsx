/**
 * Home – v3, styled after the reference site the client liked (magirenewables.com):
 * full-bleed photo hero with frosted fact cards, centred section headings, photo service cards,
 * a dark "why choose us" band, enquiry form, industries grid, numbered process, insights and FAQ.
 * All facts are Aspira's own (NABCB certificate, policies, services) – no invented statistics.
 */
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, Check, Leaf, ShieldCheck, Headset, CalendarCheck, Scale, FileSearch, Lock, Users, RefreshCcw, GraduationCap, UtensilsCrossed,
  Briefcase, Hotel, HardHat, Factory, Building2, Warehouse, School,
} from 'lucide-react';
import { useSite, useFetch } from '../context/SiteContext';
import Seo, { orgSchema, faqSchema } from '../components/Seo';
import { Reveal, Faq, NABCB_VERIFY_URL } from '../components/ui';
import { imgSize, Testimonials, ClientLogos, CtaBand, WhyAspira } from '../components/Sections';
import EnquiryForm from '../components/EnquiryForm';
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

/* Royalty-free hero footage (Pexels licence). Override from Admin → Settings → heroVideo,
   or drop a file at public/media/hero.mp4 – sources are tried in order. */
const HERO_VIDEO_FALLBACK = 'https://videos.pexels.com/video-files/8964291/8964291-hd_1280_720_50fps.mp4';

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

/** Background video that respects reduced-motion and data-saver, with the hero photo as poster */
function HeroVideo({ poster, src }) {
  const [ok, setOk] = useState(true);
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData);
  return (
    <div className="vh__bg" aria-hidden="true">
      {poster && <img className="vh__poster" src={poster} alt="" fetchpriority="high" width="1600" height="900" />}
      {ok && !reduce && (
        <video className="vh__video" autoPlay muted loop playsInline preload="metadata" poster={poster || undefined} onError={() => setOk(false)}>
          {src && <source src={src} type="video/mp4" />}
          <source src="/media/hero.mp4" type="video/mp4" />
          <source src={HERO_VIDEO_FALLBACK} type="video/mp4" onError={() => setOk(false)} />
        </video>
      )}
      <span className="vh__shade" />
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
  const sectors = SECTORS.map((x) => ({ ...x, list: x.slugs.map((sl) => bySlug[sl]).filter(Boolean) }));
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
        <div className="mg-wrap pbanner__in">
          <span className="pbanner__tag"><BadgeCheck size={14} aria-hidden="true" /> NABCB Accredited</span>
          <p>We are a <b>National Accreditation Board for Certification Bodies (NABCB)</b> accredited Inspection Body <b>(Reg No: {nabcb?.registrationNo || 'IB 159'})</b> for green audits for educational institutions (IAF Scope 28)</p>
          <a href={NABCB_VERIFY_URL} target="_blank" rel="noopener noreferrer" className="pbanner__link">Verify <ArrowUpRight size={14} /></a>
        </div>
      </div>

      {/* ---------- HERO: background video, animated headline, key facts ---------- */}
      <section className="vh">
        <HeroVideo poster={settings.heroImage ? imgSize(fileUrl(settings.heroImage), 1600) : ''} src={settings.heroVideo ? fileUrl(settings.heroVideo) : ''} />
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
              <Link to="/contact?intent=booking#enquiry" className="btn btn--green btn--lg"><CalendarCheck size={18} /> Book an audit <ArrowRight size={17} /></Link>
            </div>
          </div>

          <dl className="vh__facts" aria-label="Aspira at a glance">
            <div style={{ '--i': 0 }}><dt>Services</dt><dd><CountUp to={services.length || parents.length} /></dd></div>
            <div style={{ '--i': 1 }}><dt>Sectors served</dt><dd><CountUp to={SECTORS.length} /></dd></div>
            <div style={{ '--i': 2 }}><dt>Inspection body</dt><dd>Type ‘A’</dd></div>
            <div style={{ '--i': 3 }}><dt>Standard</dt><dd>ISO/IEC 17020</dd></div>
          </dl>
        </div>
        <a href="#about" className="vh__scroll" aria-label="Scroll to content"><span /></a>
      </section>

      {/* Client logos appear here once genuine ones are uploaded */}
      <ClientLogos />

      {/* ---------- ABOUT ---------- */}
      <section className="mg-sec" id="about">
        <div className="mg-wrap mg-about">
          <Reveal className="mg-about__media">
            {(settings.aboutImage || bySlug['safety-audits']?.image) && <img src={imgSize(fileUrl(settings.aboutImage || bySlug['safety-audits'].image), 1000)} alt="Aspira auditors at work" loading="lazy" />}
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
          <Head kicker="Who we serve" title="Find the right audit for your sector" text="Pick your type of organisation to see the audits and inspections designed for it." />
          <div className="ws-grid">
            {sectors.map(({ I, t, list }, i) => (
              <Reveal key={t} delay={i * 0.04} className="ws-card">
                <div className="ws-card__top">
                  <span className="ws-card__ic"><I size={22} /></span>
                  <h3>{t}</h3>
                </div>
                <ul className="ws-card__chips">
                  {list.map((sv) => (
                    <li key={sv.slug}><Link to={`/services/${sv.slug}`}>{sv.title}<ArrowUpRight size={13} /></Link></li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <div className="mg-center"><Link to="/industries" className="btn btn--outline">See all industries <ArrowRight size={16} /></Link></div>
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
