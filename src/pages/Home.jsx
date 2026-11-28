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
import { photo, customImage } from '../lib/companyPhotos';
import { TESTIMONIAL_LETTERS } from '../lib/testimonialLetters';
import LetterImg from '../components/LetterImg';
import { usePageCtx, rich, Paras } from '../lib/cms';
import { CmsSlot } from '../components/Cms';

const ABOUT_PHOTO = photo('05');
const HOME_PHOTOS = ['01', '02', '07', '06', '04'].map(photo);
// hero background slideshow – photos framed to keep people in view
const HERO_SLIDES = [['04', '50% 40%'], ['07', '50% 55%'], ['05', '50% 45%'], ['08', '50% 50%'], ['10', '50% 30%'], ['06', '50% 35%']].map(([n, pos]) => ({ ...photo(n), pos }));
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
const COMMIT_ICONS = [Scale, ShieldCheck, Lock, FileSearch];
const COMMITMENTS = [
  { I: Scale, t: 'Impartial', d: 'No consultancy, training or internal audits for the clients we inspect.' },
  { I: ShieldCheck, t: 'Independent', d: 'Type ‘A’ inspection body – free from commercial or financial influence.' },
  { I: Lock, t: 'Confidential', d: 'Client information protected in line with ISO/IEC 17020.' },
  { I: FileSearch, t: 'Evidence-based', d: 'Every finding rests on objective, verifiable evidence.' },
];
function HeroPanel({ data }) {
  const list = (data?.items?.length ? data.items.map((x, k) => ({ I: COMMIT_ICONS[k % 4], t: x.title, d: x.text })) : COMMITMENTS);
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setOn((n) => (n + 1) % list.length), 2600);
    return () => clearInterval(id);
  }, [list.length]);
  return (
    <div className="hpan hpan--c">
      <div className="hpan__glow" aria-hidden="true" />
      <div className="hpan__card">
        <div className="hpan__head">
          <span className="hpan__live"><i aria-hidden="true" /> {data?.heading || 'Our commitments'}</span>
        </div>
        <ul className="hcm">
          {list.map(({ I, t, d }, k) => (
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
      <h2>{typeof title === 'string' ? rich(title) : title}</h2>
      {text && <p className="mg-sub">{typeof text === 'string' ? rich(text) : text}</p>}
    </div>
  );
}

export default function Home() {
  const { settings, services, accreditations } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const parents = services.filter((s) => !s.parentSlug);
  const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
  const steps = (settings.process || []).slice(0, 6);
  const pg = usePageCtx();
  const H = (k) => !pg.hidden(k);
  const hero = pg.s('hero');
  const heroTitle = hero.heading || 'Audits & inspections you can rely on';
  const starred = /\*[^*]+\*/.test(heroTitle);
  const words = heroTitle.split(' ');
  const accentFrom = Math.max(1, words.length - 2);
  let inStar = false;
  const heroWords = words.map((w, i) => {
    let acc = i >= accentFrom;
    if (starred) {
      const opens = w.startsWith('*');
      if (opens) inStar = true;
      acc = inStar;
      if (w.endsWith('*')) inStar = false;
    }
    return { w: starred ? w.replace(/\*/g, '') : w, acc };
  });
  const heroPlain = heroTitle.replace(/\*/g, '');
  const banner = pg.s('banner');
  const bannerSaved = pg.saved('banner')?.body;
  const facts = pg.s('facts');
  const about = pg.s('about');
  const svc = pg.s('services');
  const enq = pg.s('enquiry');
  const sec = pg.s('sectors');
  const gal = pg.s('gallery');
  const proc = pg.s('process');
  const tst = pg.s('testimonials');
  const ins = pg.s('insights');
  const fq = pg.s('faq');
  const ctaS = pg.s('cta');
  const procSteps = (proc.items || []).filter((x) => x.title);
  const sectorList = (sec.items || []).filter((x) => x.title).map((x, k) => ({ I: (SECTORS.find((z) => z.t === x.title) || SECTORS[k % SECTORS.length]).I, t: x.title }));
  const factIcons = [ClipboardCheck, Building2, Scale, ShieldCheck];
  const postsRes = useFetch('/posts?limit=3');
  const posts = postsRes.data || (isApiDown(postsRes.error) ? FALLBACK_POSTS.slice(0, 3) : []);
  const customFaqs = (fq.items || []).filter((x) => x.title && x.text).map((x) => ({ question: x.title, answer: x.text }));
  const faqs = customFaqs.length ? customFaqs : [
    ...(bySlug['green-audits']?.faqs || []).slice(0, 2),
    ...(bySlug['hygiene-rating-audits']?.faqs || []).slice(0, 2),
    ...(bySlug['safety-audits']?.faqs || []).slice(0, 1),
  ];

  return (
    <div className="mg">
      <Seo jsonLd={[orgSchema(settings, accreditations), faqSchema(faqs), { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName || 'Aspira Certifications', url: (import.meta.env.VITE_SITE_URL || window.location.origin) + '/' }]} />

      {/* ---------- ACCREDITATION BANNER ---------- */}
      {H('banner') && <div className="accr-banner pbanner" role="note">
        <span className="pbanner__sheen" aria-hidden="true" />
        <div className="mg-wrap pbanner__in">
          <span className="pbanner__tag"><BadgeCheck size={14} aria-hidden="true" /> NABCB Accredited</span>
          <span className="pbanner__div" aria-hidden="true" />
          {bannerSaved
            ? <p>{rich(bannerSaved)}</p>
            : <p>We are a <b>National Accreditation Board for Certification Bodies (NABCB)</b> accredited Inspection Body <b>(Reg No: {nabcb?.registrationNo || 'IB 159'})</b> for green audits for educational institutions (IAF Scope 28)</p>}
          {(banner.buttons || []).filter((b) => b.label && b.href).slice(0, 1).map((b) => (
            <a key={b.href} href={b.href} {...(/^https?:/.test(b.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="pbanner__link">{b.label} <ArrowUpRight size={14} /></a>
          ))}
        </div>
      </div>}

      {/* ---------- HERO: background video, animated headline, key facts ---------- */}
      <section className="vh" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`); }}>
        <span className="vh__spot" aria-hidden="true" />
        <span className="vh__grid" aria-hidden="true" />
        <HeroSlides slides={customImage(settings.heroImage) ? [{ _id: 'admin-hero', image: fileUrl(customImage(settings.heroImage)), width: 1600, height: 900, pos: '50% 40%' }, ...HERO_SLIDES] : HERO_SLIDES} />
        <div className="mg-wrap vh__inner">
          <div className="vh__text">
            <span className="vh__eyebrow"><span className="vh__dot" />{hero.eyebrow}</span>
            <h1 aria-label={heroPlain}>
              {heroWords.map(({ w, acc }, i) => (
                <Fragment key={i}>
                  <span className="w" aria-hidden="true">
                    <span style={{ animationDelay: `${0.15 + 0.06 * i}s` }}>{acc ? <em className="accent">{w}</em> : w}</span>
                  </span>{' '}
                </Fragment>
              ))}
            </h1>
            {hero.intro && <p className="vh__lead">{rich(hero.intro)}</p>}
            {(hero.buttons || []).some((b) => b.label && b.href) && (
              <div className="vh__actions">
                {(hero.buttons || []).filter((b) => b.label && b.href).slice(0, 2).map((b, k) => (
                  /^(https?:|tel:|mailto:|#)/.test(b.href)
                    ? <a key={k} href={b.href} className={`btn ${k ? 'btn--outline-light' : 'btn--green'} btn--lg vh__cta`}>{k === 0 && <CalendarCheck size={18} />} {b.label} <ArrowRight size={17} /></a>
                    : <Link key={k} to={b.href} className={`btn ${k ? 'btn--outline-light' : 'btn--green'} btn--lg vh__cta`}>{k === 0 && <CalendarCheck size={18} />} {b.label} <ArrowRight size={17} /></Link>
                ))}
              </div>
            )}
          </div>

          {H('commitments') && <HeroPanel data={pg.s('commitments')} />}
        </div>
      </section>

      {/* ---------- KEY FACTS: floating card overlapping the hero ---------- */}
      {H('facts') && (facts.items || []).length > 0 && (
      <div className="mg-wrap kf-wrap">
        <dl className="kf" aria-label="Aspira at a glance">
          {(facts.items || []).filter((x) => x.title).slice(0, 4).map((x, k) => {
            const I = factIcons[k % 4];
            return (
              <div className="kf__item" style={{ '--i': k }} key={k}>
                <span className="kf__ic"><I size={22} strokeWidth={1.8} /></span>
                <div><dd>{/^\d+$/.test(x.title) ? <CountUp to={Number(x.title)} /> : x.title}</dd><dt>{x.text}</dt></div>
              </div>
            );
          })}
        </dl>
      </div>
      )}
      <CmsSlot pg={pg} after="hero" />
      <CmsSlot pg={pg} after="facts" />

      {/* Client logos appear here once genuine ones are uploaded */}
      <ClientLogos />

      {/* ---------- ABOUT ---------- */}
      {H('about') && <section className="mg-sec" id="about">
        <div className="mg-wrap mg-about">
          <Reveal className="mg-about__media">
            {about.image
              ? <img src={imgSize(fileUrl(about.image), 1000)} alt={about.imageAlt || 'Aspira auditors at work'} loading="lazy" decoding="async" className="mg-about__photo" />
              : customImage(settings.aboutImage)
              ? <img src={imgSize(fileUrl(customImage(settings.aboutImage)), 1000)} alt="Aspira auditors at work" loading="lazy" decoding="async" className="mg-about__photo" />
              : <img src={ABOUT_PHOTO.image} width={ABOUT_PHOTO.width} height={ABOUT_PHOTO.height} alt="Aspira audit team with faculty members of an institution" loading="lazy" decoding="async" className="mg-about__photo" />}
          </Reveal>
          <div className="mg-about__text">
            <Head center={false} kicker={about.eyebrow} title={about.heading} text={about.intro} />
            <Paras text={about.body} className="mg-about__p" />
            {(about.items || []).length > 0 && (
              <ul className="mg-checks">
                {(about.items || []).filter((x) => x.title).map((x, k) => (
                  <li key={k}>
                    <CheckCircle2 size={20} />
                    <span><b>{x.title}</b>{x.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {(about.buttons || []).filter((b) => b.label && b.href).map((b, k) => <Link key={k} to={b.href} className="mg-link">{b.label} <ArrowRight size={16} /></Link>)}
          </div>
        </div>
      </section>}
      <CmsSlot pg={pg} after="about" />

      {/* ---------- SERVICES: photo cards ---------- */}
      {H('services') && <section className="mg-sec mg-sec--soft">
        <div className="mg-wrap">
          <Head kicker={svc.eyebrow} title={svc.heading} text={svc.intro} />
          <div className="sv-grid">
            {parents.map((s, i) => {
              const points = s.copy?.cardPoints?.length ? s.copy.cardPoints : (s.scope || []).slice(0, 3).map(short);
              return (
                <Reveal key={s.slug} delay={i * 60} as={Link} to={`/services/${s.slug}`} className="sv-card">
                  <div className="sv-card__img">
                    {s.image && <img src={imgSize(fileUrl(s.image), 760)} alt="" loading="lazy" />}
                    <span className="sv-card__ic"><Icon name={s.icon} size={22} /></span>
                  </div>
                  <div className="sv-card__body">
                    <h3>{s.title}</h3>
                    {(s.copy?.cardText || s.audience) && <p className="sv-card__for">{s.copy?.cardText || s.audience}</p>}
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
          {(svc.buttons || []).filter((b) => b.label && b.href).slice(0, 1).map((b) => <div key={b.href} className="mg-center"><Link to={b.href} className="btn btn--outline">{b.label} <ArrowRight size={16} /></Link></div>)}
        </div>
      </section>}
      <CmsSlot pg={pg} after="services" />

      {H('why') && <WhyAspira data={pg.s('why')} />}
      <CmsSlot pg={pg} after="why" />

      {/* ---------- ENQUIRY ---------- */}
      {H('enquiry') && <section className="mg-sec mg-enq" id="enquiry">
        <div className="mg-wrap">
          <Head kicker={enq.eyebrow} title={enq.heading} text={enq.intro} />
          <div className="mg-enq__card">
            <EnquiryForm variant="default" title="" submitLabel="Send enquiry" intent="booking" />
          </div>
        </div>
      </section>}
      <CmsSlot pg={pg} after="enquiry" />

      {/* ---------- WHO WE SERVE: sector → matching audits ---------- */}
      {H('sectors') && <section className="mg-sec mg-sec--soft">
        <div className="mg-wrap">
          <Head kicker={sec.eyebrow} title={sec.heading} text={sec.intro} />
          <div className="ws-tiles">
            {sectorList.map(({ I, t }, i) => (
              <Reveal key={t} delay={i * 0.03} className="ws-tile">
                <span className="ws-tile__ic"><I size={22} strokeWidth={1.7} /></span>
                <h3>{t}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>}
      <CmsSlot pg={pg} after="sectors" />

      {/* ---------- GALLERY PREVIEW: Aspira's own photos ---------- */}
      {H('gallery') && <section className="mg-sec hg">
        <div className="mg-wrap">
          <div className="hg__head">
            <Head kicker={gal.eyebrow} title={gal.heading} text={gal.intro} />
            {(gal.buttons || []).filter((b) => b.label && b.href).slice(0, 1).map((b) => <Link key={b.href} to={b.href} className="btn btn--outline hg__all">{b.label} <ArrowRight size={16} /></Link>)}
          </div>
          <div className="hg__grid">
            {HOME_PHOTOS.map((ph, i) => (
              <Reveal key={ph._id} delay={i * 0.05} as={Link} to="/gallery" className={`hg__item hg__item--${i + 1}`}>
                <img src={i === 0 ? ph.image : ph.thumb} width={ph.width} height={ph.height} alt={ph.title} loading="lazy" decoding="async" />
                
              </Reveal>
            ))}
          </div>
          {(gal.buttons || []).filter((b) => b.label && b.href).slice(0, 1).map((b) => <div key={b.href} className="hg__more"><Link to={b.href} className="btn btn--outline">{b.label} <ArrowRight size={16} /></Link></div>)}
        </div>
      </section>}
      <CmsSlot pg={pg} after="gallery" />

      {/* ---------- PROCESS ---------- */}
      {H('process') && procSteps.length > 0 && (
        <section className="mg-sec">
          <div className="mg-wrap">
            <Head kicker={proc.eyebrow} title={proc.heading} text={proc.intro} />
            <ol className="mg-steps" style={{ '--n': procSteps.length }}>
              {procSteps.map((st, i) => (
                <li key={i}>
                  <span className="mg-steps__n">{String(i + 1).padStart(2, '0')}</span>
                  <b>{st.title}</b>
                  <p>{st.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      <CmsSlot pg={pg} after="process" />

      {/* ---------- CLIENT TESTIMONIALS ---------- */}
      {H('testimonials') && <section className="mg-sec ht">
        <div className="mg-wrap ht__in">
          <div className="ht__text">
            <Head kicker={tst.eyebrow} title={tst.heading} text={tst.intro} />
            {(tst.buttons || []).filter((b) => b.label && b.href).slice(0, 1).map((b) => <Link key={b.href} to={b.href} className="btn btn--outline">{b.label} <ArrowRight size={16} /></Link>)}
          </div>
          <div className="ht__letters">
            {TESTIMONIAL_LETTERS.slice(0, 2).map((l, i) => (
              <Reveal key={l._id} delay={i * 0.08} as={Link} to="/testimonials" className={`ht__letter ht__letter--${i + 1}`}>
                <LetterImg l={l} alt={`Client testimonial letter ${i + 1}`} loading="lazy" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>}
      {H('testimonials') && <Testimonials />}
      <CmsSlot pg={pg} after="testimonials" />

      {/* ---------- INSIGHTS ---------- */}
      {H('insights') && posts.length > 0 && (
        <section className="mg-sec mg-sec--soft">
          <div className="mg-wrap">
            <Head kicker={ins.eyebrow} title={ins.heading} text={ins.intro} />
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
      <CmsSlot pg={pg} after="insights" />
      {H('faq') && faqs.length > 0 && (
        <section className="mg-sec">
          <div className="mg-wrap mg-faq">
            <Head kicker={fq.eyebrow} title={fq.heading} text={fq.intro} />
            <Faq items={faqs} />
          </div>
        </section>
      )}

      {/* ---------- CTA (existing band) ---------- */}
      <CmsSlot pg={pg} after="faq" />
      {H('cta') && <CtaBand title={ctaS.heading} text={ctaS.intro} buttons={ctaS.buttons} />}
      <CmsSlot pg={pg} after="cta" />
    </div>
  );
}
