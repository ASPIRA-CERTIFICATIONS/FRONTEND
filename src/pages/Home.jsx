/**
 * Home – clean layout (v2).
 * One message per section, generous whitespace, one primary action per screen.
 * Testimonials / case studies / client logos appear automatically once genuine ones are published.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { useSite, useFetch } from '../context/SiteContext';
import Seo, { orgSchema } from '../components/Seo';
import { Reveal, BADGE_SRC, useCertificateImage } from '../components/ui';
import { imgSize, Testimonials, ClientLogos } from '../components/Sections';
import { Icon } from '../lib/icons';
import { isApiDown, fileUrl } from '../lib/api';
import { FALLBACK_POSTS } from '../lib/fallback';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const tel = (p) => `tel:${String(p).replace(/[^+\d]/g, '')}`;

// Short, factual one-liners for the two audiences (from the services Aspira described)
const AUDIENCES = [
  {
    slug: 'green-audits',
    label: 'Schools, colleges & universities',
    title: 'Green Audit',
    text: 'Water, energy, waste, solar and campus practices – assessed and reported to support NAAC requirements.',
    cta: 'Green Audit for institutions',
  },
  {
    slug: 'hygiene-rating-audits',
    label: 'Restaurants, hotels & canteens',
    title: 'Hygiene Rating Audit',
    text: 'Kitchen cleanliness, storage, handling, pest control and sanitation – audited for FSSAI hygiene rating.',
    cta: 'Hygiene audit for food businesses',
  },
];

function SectionTitle({ kicker, title, link }) {
  return (
    <div className="hm-head">
      <div>
        {kicker && <p className="hm-kicker">{kicker}</p>}
        <h2>{title}</h2>
      </div>
      {link && <Link to={link.to} className="hm-more">{link.label} <ArrowRight size={16} /></Link>}
    </div>
  );
}

export default function Home() {
  const { settings, services, accreditations } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const cert = useCertificateImage();
  const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
  // Every other service with who it is for (replaces the separate "target customers" table)
  const OTHER_ORDER = ['construction-safety-audits', 'electrical-safety-audits', 'fire-safety-audits', 'workplace-safety-audits', 'warehouse-safety-audits', 'energy-audits', 'water-audits', 'green-building-assessments'];
  const others = OTHER_ORDER.map((slug) => bySlug[slug]).filter(Boolean);
  const forWhom = (s) => (s?.audience || '').replace(/^For /, '').replace(/^./, (c) => c.toUpperCase());
  const steps = (settings.process || []).slice(0, 6);
  const postsRes = useFetch('/posts?limit=3');
  const posts = postsRes.data || (isApiDown(postsRes.error) ? FALLBACK_POSTS.slice(0, 3) : []);
  const phone = settings.contact?.phones?.[0];

  return (
    <div className="hm">
      <Seo jsonLd={[orgSchema(settings, accreditations), { '@context': 'https://schema.org', '@type': 'WebSite', name: settings.companyName || 'Aspira Certifications', url: (import.meta.env.VITE_SITE_URL || window.location.origin) + '/' }]} />

      {/* 1 · Hero – one message, one action */}
      <section className="hm-hero">
        <div className="hm-wrap hm-hero__grid">
          <div className="hm-hero__text">
            <p className="hm-kicker">{settings.tagline || 'Audit · Inspection · Certification'}</p>
            <h1>{settings.heroTitle || 'Audit, inspection & certification'}</h1>
            {settings.heroSubtitle && <p className="hm-hero__lead">{settings.heroSubtitle}</p>}
            <div className="hm-hero__actions">
              <Link to="/contact?intent=booking#enquiry" className="btn">Book an audit <ArrowRight size={16} /></Link>
              <Link to="/services" className="hm-textlink">Explore our services</Link>
            </div>
            {nabcb && (
              <Link to="/accreditations" className="hm-hero__accr">
                <img src={nabcb.logo ? fileUrl(nabcb.logo) : BADGE_SRC} alt="" width="34" height="37" />
                <span><b>NABCB accredited inspection body</b>Reg. No. {nabcb.registrationNo} · ISO/IEC 17020 Type ‘A’</span>
              </Link>
            )}
          </div>
          {settings.heroImage && (
            <div className="hm-hero__media">
              <img src={imgSize(fileUrl(settings.heroImage), 1100)} alt="Aspira auditors on site" width="1100" height="1300" fetchpriority="high" />
            </div>
          )}
        </div>
      </section>

      {/* 2 · Who we work with */}
      <section className="hm-sec">
        <div className="hm-wrap">
          <SectionTitle kicker="Who we work with" title="Two audits we're known for" />
          <p className="hm-intro">We are a business-to-business (B2B) company – our clients are organisations, not individual consumers.</p>
          <div className="hm-aud">
            {AUDIENCES.map((a) => {
              const s = bySlug[a.slug];
              return (
                <Reveal key={a.slug} as={Link} to={`/services/${a.slug}`} className="hm-aud__card">
                  {s?.image && <div className="hm-aud__img"><img src={imgSize(fileUrl(s.image), 900)} alt="" loading="lazy" /></div>}
                  <div className="hm-aud__body">
                    <p className="hm-aud__label">{forWhom(s) || a.label}</p>
                    <h3>{a.title}</h3>
                    <p>{a.text}</p>
                    <span className="hm-textlink">{a.cta} <ArrowRight size={16} /></span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 · Other services – a quiet list, no images */}
      {others.length > 0 && (
        <section className="hm-sec hm-sec--soft">
          <div className="hm-wrap">
            <SectionTitle kicker="Services" title="Other audits & inspections" link={{ to: '/services', label: 'All services' }} />
            <ul className="hm-svc">
              {others.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`}>
                    <span className="hm-svc__ic"><Icon name={s.icon} size={20} /></span>
                    <span className="hm-svc__txt"><b>{s.title}</b><span>{forWhom(s)}</span></span>
                    <ArrowRight size={18} className="hm-svc__go" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 4 · Accreditation – one calm statement */}
      {nabcb && (
        <section className="hm-sec">
          <div className="hm-wrap hm-accr">
            <div className="hm-accr__text">
              <p className="hm-kicker">Accreditation</p>
              <h2>Accredited by NABCB as a Type ‘A’ inspection body</h2>
              <p>Our accreditation (Reg. No. {nabcb.registrationNo}) under ISO/IEC 17020 covers green audits of educational institutions. It means our methods, people and reporting have been independently assessed for competence and impartiality.</p>
              <div className="hm-accr__links">
                <Link to="/accreditations" className="hm-textlink">View our accreditation <ArrowRight size={16} /></Link>
                <Link to="/certificate-status" className="hm-textlink">Verify a certificate <ArrowRight size={16} /></Link>
              </div>
            </div>
            <Link to="/accreditations" className="hm-accr__doc" aria-label="View the NABCB accreditation certificate">
              <img src={cert} alt="NABCB accreditation certificate, IB 159" loading="lazy" />
            </Link>
          </div>
        </section>
      )}

      {/* 5 · How it works */}
      {steps.length > 0 && (
        <section className="hm-sec hm-sec--soft">
          <div className="hm-wrap">
            <SectionTitle kicker="How it works" title="From enquiry to report" />
            <ol className="hm-steps">
              {steps.map((st, i) => (
                <li key={st.title}>
                  <span className="hm-steps__n">{String(i + 1).padStart(2, '0')}</span>
                  <b>{st.title}</b>
                  <p>{st.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Genuine testimonials only – the component renders nothing when none are published */}
      <Testimonials />
      <ClientLogos />

      {/* 6 · Insights */}
      {posts.length > 0 && (
        <section className="hm-sec">
          <div className="hm-wrap">
            <SectionTitle kicker="Insights" title="Guides from our auditors" link={{ to: '/blog', label: 'All articles' }} />
            <ul className="hm-posts">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`}>
                    <small>{[p.category, fmtDate(p.publishedAt)].filter(Boolean).join(' · ')}</small>
                    <b>{p.title}</b>
                    <span className="hm-textlink">Read article <ArrowRight size={16} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 7 · Closing call to action */}
      <section className="hm-cta">
        <div className="hm-wrap hm-cta__in">
          <h2>Planning an audit or inspection?</h2>
          <p>Tell us about your organisation and we'll confirm the scope, standards and timeline.</p>
          <div className="hm-cta__actions">
            <Link to="/contact?intent=booking#enquiry" className="btn btn--light">Book an audit <ArrowRight size={16} /></Link>
            {phone && <a href={tel(phone)} className="hm-cta__phone"><Phone size={16} /> {phone}</a>}
          </div>
        </div>
      </section>
    </div>
  );
}
