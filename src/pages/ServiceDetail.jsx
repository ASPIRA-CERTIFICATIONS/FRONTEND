import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Download, Phone, Mail, MessageCircle, CheckCircle2, BadgeCheck, FileCheck2, Scale, Lock,
  ClipboardList, BookOpenCheck, Building, Sparkles, Target, TrendingUp, ShieldCheck, Award, Leaf, Users,
} from 'lucide-react';
import { useFetch, useSite, localService } from '../context/SiteContext';
import { fileUrl, isApiDown } from '../lib/api';
import { Icon } from '../lib/icons';
import { waLink } from '../lib/whatsapp';
import Seo, { breadcrumbSchema, faqSchema, serviceSchema } from '../components/Seo';
import { Faq, Loader, Reveal, BADGE_SRC, PageHero } from '../components/ui';
import { Testimonials, CtaBand, ServiceAccreditation, imgSize } from '../components/Sections';
import EnquiryForm from '../components/EnquiryForm';
import GreenAuditFlow from '../components/GreenAuditFlow';
import { COMPANY_PHOTOS, photo } from '../lib/companyPhotos';
import NotFound from './NotFound';

const cap = (t = '') => t.charAt(0).toUpperCase() + t.slice(1);
const BENEFIT_ICONS = [TrendingUp, ShieldCheck, Award, Leaf, Target, Sparkles, Users, BadgeCheck];
const TONES = ['blue', 'green', 'amber', 'violet', 'teal', 'rose'];

const SECTIONS = [
  ['overview', 'Overview'],
  ['services', 'Audit types'],
  ['benefits', 'Benefits'],
  ['scope', 'Scope'],
  ['standards', 'Standards'],
  ['process', 'Process'],
  ['photos', 'Photos'],
  ['faq', 'FAQs'],
  ['enquire', 'Enquire'],
];

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-35% 0px -55% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);
  return active;
}

export default function ServiceDetail() {
  const { slug } = useParams();
  const remote = useFetch(`/services/${slug}`, [slug]);
  const apiDown = isApiDown(remote.error);
  const s = remote.data || (apiDown ? localService(slug) : null);
  const { settings, services, accreditations } = useSite();
  const c = settings.contact || {};
  const wa = c.whatsapp;
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');

  const isGreen = s?.slug === 'green-audits'; // Aspira's NABCB scope – official flowchart + own photos
  const has = {
    overview: true,
    services: !!s?.children?.length,
    benefits: !!(s?.purpose || s?.benefits?.length),
    scope: !!s?.scope?.length,
    standards: !!s?.standards?.length && !isGreen,
    process: !!s?.process?.length || isGreen,
    photos: isGreen,
    faq: !!s?.faqs?.length,
    enquire: true,
  };
  const visible = SECTIONS.filter(([id]) => has[id]);
  const active = useScrollSpy(visible.map(([id]) => id));

  if (remote.loading && !s) return <Loader />;
  if (!s) return <NotFound />;

  const parent = s.parentSlug ? services.find((x) => x.slug === s.parentSlug) : null;
  const inScope = s.slug === 'green-audits';
  const waMsg = s.whatsappMessage || `Hello Aspira, I would like to enquire about ${s.title}.`;
  const cta = s.ctaLabel || 'Book this audit';
  const gallery = (s.gallery || []).filter(Boolean);
  const overviewImg = isGreen ? null : gallery[0] || s.image;
  const ld = [
    serviceSchema(s),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }, ...(parent ? [{ name: parent.title, path: `/services/${parent.slug}` }] : []), { name: s.title, path: `/services/${s.slug}` }]),
    faqSchema(s.faqs),
  ].filter(Boolean);

  return (
    <>
      <Seo title={s.seo?.title ? undefined : s.title} description={s.seo?.description || s.shortDescription} image={s.image} jsonLd={ld} />
      {s.seo?.title && (
        <Helmet>
          <title>{s.seo.title}</title>
          <meta property="og:title" content={s.seo.title} />
          <meta name="twitter:title" content={s.seo.title} />
        </Helmet>
      )}

      {/* ================= HERO ================= */}
      <PageHero
        crumbs={[{ label: 'Services', to: '/services' }, ...(parent ? [{ label: parent.title, to: `/services/${parent.slug}` }] : []), { label: s.title }]}
        eyebrow={<><Icon name={s.icon} size={14} /> {s.audience || s.category}</>}
        title={s.title}
        intro={s.shortDescription}
        image={isGreen ? photo('01').image : s.image || undefined}
        primary={{ href: '#enquire', label: cta, wa: waMsg }}
        accrText={inScope && nabcb ? `NABCB accredited for green audits · ${nabcb.registrationNo}` : undefined}
        cards={
          <>
            {inScope && nabcb ? (
              <div className="phero__card">
                <img src={BADGE_SRC} alt="NABCB Accredited Inspection Body – Reg. No. IB 159" width="52" height="56" />
                <div><b>Within our NABCB scope</b><span>Type ‘A’ Inspection Body · {nabcb.registrationNo}</span></div>
              </div>
            ) : (
              <div className="phero__card">
                <span className="phero__card-ic"><Icon name={s.icon} size={22} /></span>
                <div><b>Independent third-party audit</b><span>{s.category}</span></div>
              </div>
            )}
            {s.scope?.length > 0 && (
              <div className="phero__card phero__card--sm">
                <span className="phero__card-num">{s.scope.length}</span>
                <div><b>Areas assessed</b><span>Clear report & recommendations</span></div>
              </div>
            )}
          </>
        }
      />

      {/* sticky in-page nav */}
      <nav className="svc-tabs" aria-label="On this page">
        <div className="container">
          {visible.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>)}
          <a href="#enquire" className="svc-tabs__cta">{cta}</a>
        </div>
      </nav>

      {/* ================= OVERVIEW ================= */}
      <section className="section svc-sec" id="overview">
        <div className="container svc-overview">
          <Reveal className="svc-overview__text">
            <span className="eyebrow">Overview</span>
            <h2>About our {s.title.toLowerCase()}</h2>
            {s.audience && <p className="audience-line"><strong>Who it’s for:</strong> {s.audience.replace(/^For /, '')}</p>}
            {String(s.intro || '').split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            <ServiceAccreditation slug={s.slug} />
          </Reveal>
          <Reveal className="svc-overview__media" delay={0.08}>
            {isGreen && <img src={photo('04').image} alt="Aspira green audit team inspecting campus green cover" loading="lazy" width={photo('04').width} height={photo('04').height} className="svc-own-photo" />}
            {overviewImg && <img src={imgSize(overviewImg, 900)} alt="" loading="lazy" width="900" height="700" />}
            {s.industries?.length > 0 && (
              <div className="svc-who">
                <h3><Building size={17} /> Who we audit</h3>
                <ul>{s.industries.map((x) => <li key={x}><CheckCircle2 size={15} /> {x}</li>)}</ul>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* ================= SUB-SERVICES ================= */}
      {has.services && (
        <section className="section section--white svc-sec" id="services">
          <div className="container">
            <div className="svc-head"><span className="eyebrow">Audit types</span><h2>Specialised {s.title.toLowerCase()}</h2></div>
            <div className="svc-subs">
              {s.children.map((ch, i) => (
                <Reveal key={ch.slug} delay={i * 0.05} className="svc-sub">
                  {ch.image && <img src={imgSize(ch.image, 600)} alt="" loading="lazy" width="600" height="380" />}
                  <div>
                    <span className="svc-sub__ic"><Icon name={ch.icon} size={20} /></span>
                    <h3>{ch.title}</h3>
                    <p>{ch.shortDescription}</p>
                    <span className="svc-card__more">Learn more <ArrowUpRight size={14} /></span>
                  </div>
                  <Link to={`/services/${ch.slug}`} className="svc-card__link" aria-label={ch.title} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= BENEFITS ================= */}
      {has.benefits && (
        <section className="section svc-sec svc-benefits-sec" id="benefits">
          <div className="container">
            <div className="svc-head svc-head--split">
              <div><span className="eyebrow">Purpose & benefits</span><h2>Why it matters</h2></div>
              {s.purpose && <p>{s.purpose}</p>}
            </div>
            {s.benefits?.length > 0 && (
              <div className="svc-benefits">
                {s.benefits.map((b, i) => {
                  const I = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                  return (
                    <Reveal key={i} delay={(i % 4) * 0.05} className={`svc-benefit tone-${TONES[i % TONES.length]}`}>
                      <span className="svc-benefit__ic"><I size={20} /></span>
                      <p>{b}</p>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= SCOPE ================= */}
      {has.scope && (
        <section className="section section--white svc-sec" id="scope">
          <div className="container svc-scope-wrap">
            <div className="svc-scope-side">
              <span className="eyebrow">Scope of audit</span>
              <h2>What we assess</h2>
              <p className="muted-p">Every engagement is scoped to your site. A typical {s.title.toLowerCase().replace(/s$/, '')} covers:</p>
            </div>
            <ol className={`svc-scope ${s.scope.length <= 5 ? 'svc-scope--few' : ''}`}>
              {s.scope.map((x, i) => {
                const [head, ...rest] = String(x).split(/\s[–-]\s/);
                return (
                  <Reveal as="li" key={i} delay={(i % 4) * 0.04}>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <div><b>{head}</b>{rest.length > 0 && <span>{cap(rest.join(' – '))}</span>}</div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ================= STANDARDS ================= */}
      {has.standards && (
        <section className="section svc-sec" id="standards">
          <div className="container">
            <div className="svc-head"><span className="eyebrow">Applicable standards & guidelines</span><h2>Standards we work to</h2></div>
            <div className="svc-standards">
              {s.standards.map((st, i) => (
                <Reveal key={i} delay={(i % 3) * 0.05} className="svc-standard">
                  <span className="svc-standard__ic"><BookOpenCheck size={20} /></span>
                  <div><b>{st.name}</b>{st.description && <p>{st.description}</p>}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= PROCESS ================= */}
      {has.process && (
        <section className="section svc-sec svc-process-sec" id="process">
          <div className="container">
            {isGreen ? (
              <>
                <div className="svc-head svc-head--center"><span className="eyebrow">Inspection process</span><h2>Green audit inspection flow</h2></div>
                <GreenAuditFlow />
              </>
            ) : (
              <>
                <div className="svc-head svc-head--center"><span className="eyebrow">Audit process</span><h2>How the audit works</h2></div>
                <ol className="svc-process">
                  {s.process.map((p, i) => (
                    <Reveal as="li" key={i} delay={i * 0.06}>
                      <span className="n">{i + 1}</span>
                      <h3>{p.title}</h3>
                      {p.description && <p>{p.description}</p>}
                    </Reveal>
                  ))}
                </ol>
              </>
            )}
          </div>
        </section>
      )}

      {/* ================= OWN AUDIT PHOTOS (green audits) ================= */}
      {has.photos && (
        <section className="section section--white svc-sec" id="photos">
          <div className="container">
            <div className="svc-head svc-photos__head">
              <div><span className="eyebrow">From our audits</span><h2>Green audits in the field</h2></div>
              <Link to="/gallery" className="btn btn--outline">View full gallery <ArrowRight size={16} /></Link>
            </div>
            <div className="svc-photos">
              {COMPANY_PHOTOS.slice(0, 9).map((ph, i) => (
                <Reveal key={ph._id} delay={i * 0.04} as={Link} to="/gallery" className="svc-photos__item">
                  <img src={ph.thumb} srcSet={`${ph.thumb} 720w, ${ph.image} ${ph.width}w`} sizes="(max-width: 700px) 50vw, 25vw" width={ph.width} height={ph.height} alt={ph.title} loading="lazy" decoding="async" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= WHY + ENQUIRY ================= */}
      <section className="section svc-sec" id="enquire">
        <div className="container svc-enquire">
          <Reveal className="svc-why">
            <span className="eyebrow">Why choose Aspira</span>
            <h2>{s.formType === 'institution' ? 'Trusted by institutions preparing for NAAC' : s.formType === 'restaurant' ? 'A hygiene audit that helps your restaurant improve' : 'Independent audits you can rely on'}</h2>
            {s.whyChoose?.length > 0 && (
              <ul className="svc-why__list">{s.whyChoose.map((w) => <li key={w}><CheckCircle2 size={18} /> {w}</li>)}</ul>
            )}
            <div className="svc-contact">
              <h3>Talk to our experts</h3>
              {(c.phones || []).slice(0, 2).map((p) => <a key={p} href={`tel:${p.replace(/[^+\d]/g, '')}`}><Phone size={16} /> {p}</a>)}
              {c.emails?.[0] && <a href={`mailto:${c.emails[0]}`}><Mail size={16} /> {c.emails[0]}</a>}
              {wa && <a href={waLink(wa, waMsg)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Chat on WhatsApp</a>}
              {s.brochure && <a href={fileUrl(s.brochure)} target="_blank" rel="noopener noreferrer"><Download size={16} /> Download brochure</a>}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <EnquiryForm
              title={cta}
              subtitle={s.formType === 'institution' ? 'For schools, colleges, universities and other educational institutions.' : s.formType === 'restaurant' ? 'For restaurants, hotels, cafes and food outlets.' : "Share a few details and we'll get back to you with scope, timelines and fees."}
              service={s.title}
              serviceSlug={s.slug}
              category={s.category}
              variant={s.formType || 'default'}
              lockService
              intent="booking"
              submitLabel={cta}
            />
          </Reveal>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      {has.faq && (
        <section className="section section--white svc-sec" id="faq">
          <div className="container svc-faq">
            <div>
              <span className="eyebrow">FAQs</span>
              <h2>Frequently asked questions</h2>
              <p className="muted-p">Can’t find your answer? Ask us directly — we reply quickly.</p>
              <div className="svc-faq__actions">
                <button className="btn btn--sm" onClick={() => window.dispatchEvent(new Event('aspira:open-chat'))}><ClipboardList size={15} /> Ask in chat</button>
                {wa && <a href={waLink(wa, waMsg)} className="btn btn--wa btn--sm" target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> WhatsApp</a>}
              </div>
            </div>
            <Faq items={s.faqs} />
          </div>
        </section>
      )}

      {/* ================= RELATED ================= */}
      {s.related?.length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <div className="svc-head"><span className="eyebrow">Related services</span><h2>You may also need</h2></div>
            <div className="svc-related">
              {s.related.map((r) => (
                <Link key={r.slug} to={`/services/${r.slug}`} className="svc-related__item">
                  <span className="svc-sub__ic"><Icon name={r.icon} size={18} /></span>
                  <span><b>{r.title}</b><small>{r.shortDescription}</small></span>
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Testimonials serviceSlug={s.slug} />
      <CtaBand service={s.title} title={cta} text={s.audience ? `${s.audience}. Talk to us about scope, timelines and fees.` : undefined} />
    </>
  );
}
