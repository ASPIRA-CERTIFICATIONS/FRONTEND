import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Check, MessageCircle, Scale, FileCheck2, Lock } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { fileUrl } from '../lib/api';

/** Fades/slides children in when they scroll into view */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ '--d': `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}

export const BADGE_SRC = '/accreditation/aspira-nabcb-badge.webp';

/**
 * Aspira's genuine "NABCB Accredited Inspection Body – Reg. No. IB 159" badge
 * (taken from the company's existing website). Used wherever accreditation is shown.
 */
export function Seal({ size = 150, className = '' }) {
  return (
    <img
      className={`acc-badge ${className}`}
      src={BADGE_SRC}
      width={size}
      height={Math.round(size * 1.087)}
      style={{ width: size, height: 'auto' }}
      alt="NABCB Accredited Inspection Body – Reg. No. IB 159"
      loading="lazy"
    />
  );
}
export const Badge = Seal;

export function SectionHead({ eyebrow, title, intro, center, split, children }) {
  return (
    <Reveal className={`section-head ${center ? 'section-head--center' : ''} ${split ? 'section-head--split' : ''}`}>
      <div>
        {eyebrow && <span className="eyebrow">{typeof eyebrow === 'string' ? eyebrow.replace(/^§\s*/, '') : eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {(intro || children) && <div>{intro && <p>{intro}</p>}{children}</div>}
    </Reveal>
  );
}

const unsplashW = (u, w) => (u && /images\.unsplash\.com/.test(u) ? u.replace(/([?&])w=\d+/, `$1w=${w}`) : u);
export const DEFAULT_HERO_IMG = 'https://images.unsplash.com/photo-1742112125567-3e8967bad60f?auto=format&fit=crop&w=1600&q=70';

/**
 * Premium inner-page hero: text on the left, full-height photo bleeding to the right edge
 * with a diagonal brand-coloured edge, floating credential cards, CTAs and a trust row.
 * doc = show a document (e.g. the accreditation certificate) on a brand panel instead of a photo.
 */
export const CERT_DOC_FALLBACK = '/accreditation/nabcb-ib159-certificate-page1.jpg';

/** First certificate image uploaded for NABCB in admin (falls back to the bundled page 1). */
export function useCertificateImage() {
  const { accreditations } = useSite();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const f = (nabcb?.certificateFiles || []).find((x) => /\.(jpe?g|png|webp)$/i.test(x || ''));
  return fileUrl(f || CERT_DOC_FALLBACK);
}

/**
 * Inner-page header – clean layout: breadcrumb, label, heading, one paragraph, one action,
 * and a single image (or the accreditation certificate). `cards` is accepted for
 * compatibility but no longer rendered, to keep the header uncluttered.
 */
export function PageHero({ eyebrow, title, intro, crumbs = [], image, doc, pageKey, actions = true, primary, children, accrText }) {
  const { settings } = useSite();
  const wa = settings.contact?.whatsapp;
  const certImg = useCertificateImage();
  if (doc === 'cert') doc = certImg;
  const custom = pageKey ? settings.pageImages?.[pageKey] : '';
  const img = doc ? null : fileUrl(unsplashW(custom || image || DEFAULT_HERO_IMG, 1200));
  const p = primary || { to: '/contact?intent=booking#enquiry', label: 'Book an audit' };
  return (
    <section className={`ph ${doc ? 'ph--doc' : ''}`}>
      <div className="container ph__grid">
        <div className="ph__text">
          {crumbs.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="ph__crumbs">
                <li><Link to="/">Home</Link></li>
                {crumbs.map((c, i) => (
                  <li key={i}>{c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && <p className="ph__eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {intro && <p className="ph__lead">{intro}</p>}
          {children}
          {actions && (
            <div className="ph__actions">
              {p.href ? <a href={p.href} className="btn btn--green">{p.label} <ArrowRight size={16} /></a> : <Link to={p.to} className="btn btn--green">{p.label} <ArrowRight size={16} /></Link>}
              {wa && (
                <a href={`https://wa.me/${String(wa).replace(/\D/g, '')}?text=${encodeURIComponent(p.wa || 'Hello Aspira Certifications, I would like to know more about your audit services.')}`} className="ph__wa" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={17} /> WhatsApp us
                </a>
              )}
            </div>
          )}
          {accrText && <p className="ph__note"><img src={BADGE_SRC} alt="" width="22" height="24" /> {accrText}</p>}
        </div>
        <div className="ph__media" aria-hidden="true">
          {img && <img src={img} alt="" fetchpriority="high" width="1200" height="900" />}
          {doc && <img className="ph__doc" src={doc} alt="" width="560" height="790" />}
        </div>
      </div>
    </section>
  );
}

export function Faq({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="faq">
      {items.map((f, i) => (
        <details key={i} open={i === 0}>
          <summary>
            {f.question}
            <span className="pm" aria-hidden="true"><Plus size={16} /></span>
          </summary>
          <div>{f.answer}</div>
        </details>
      ))}
    </div>
  );
}

export function CheckList({ items = [], one = false }) {
  return (
    <ul className={`check-list ${one ? 'check-list--one' : ''}`}>
      {items.map((t, i) => (
        <li key={i}><Check size={18} strokeWidth={2.4} /> <span>{t}</span></li>
      ))}
    </ul>
  );
}

export const Loader = () => (
  <div className="loader" role="status" aria-label="Loading"><span /></div>
);

export function ArrowLink({ to, children }) {
  return <Link to={to} className="link-arrow">{children} <ArrowRight size={16} /></Link>;
}

/** Aspira logo mark with the brand wordmark underneath (navy "ASPIRA", green "CERTIFICATIONS"). */
export function BrandLogo({ src, size = 'md', className = '' }) {
  return (
    <span className={`blogo blogo--${size} ${className}`}>
      <img src={src || '/brand/aspira-logo.png'} alt="" width="85" height="46" />
      <span className="blogo__word"><span className="blogo__a">ASPIRA</span> <span className="blogo__c">CERTIFICATIONS</span></span>
    </span>
  );
}
