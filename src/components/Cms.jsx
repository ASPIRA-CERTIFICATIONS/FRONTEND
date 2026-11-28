/**
 * Renders admin-added page sections using the site's design system.
 * Layouts: text · text-image · image-text · cards · list · cta · faq · gallery · quote
 */
import { Link, useParams } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { ArrowRight, CheckCircle2, Eye, X, Quote } from 'lucide-react';
import { Reveal, Faq } from './ui';
import { fileUrl } from '../lib/api';
import { rich, Paras, exitPreview, usePage, PageCtx } from '../lib/cms';

function CmsLink({ b, i }) {
  if (!b?.label || !b?.href) return null;
  const cls = i === 0 ? 'btn btn--green' : 'btn btn--outline';
  if (/^(https?:|tel:|mailto:)/i.test(b.href)) {
    const ext = /^https?:/i.test(b.href);
    return <a className={cls} href={b.href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{b.label} <ArrowRight size={16} /></a>;
  }
  if (b.href.startsWith('#')) return <a className={cls} href={b.href}>{b.label} <ArrowRight size={16} /></a>;
  return <Link className={cls} to={b.href}>{b.label} <ArrowRight size={16} /></Link>;
}
export function CmsButtons({ buttons, className = '' }) {
  const list = (buttons || []).filter((b) => b?.label && b?.href);
  if (!list.length) return null;
  return <div className={`cms-btns ${className}`}>{list.map((b, i) => <CmsLink key={i} b={b} i={i} />)}</div>;
}

function Head({ s, center }) {
  if (!s.eyebrow && !s.heading && !s.intro) return null;
  return (
    <div className={`cms-head ${center ? 'cms-head--center' : ''}`}>
      {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
      {s.heading && <h2>{rich(s.heading)}</h2>}
      {s.intro && <p className="cms-intro">{rich(s.intro)}</p>}
    </div>
  );
}

const img = (src) => (src ? fileUrl(src) : '');

export function CmsBlock({ s, index = 0 }) {
  const layout = s.layout || 'text';
  const items = (s.items || []).filter((x) => x.title || x.text || x.image);
  const soft = index % 2 === 1 ? 'cms-sec--soft' : '';

  if (layout === 'cta') {
    return (
      <section className="section section--tight cms-sec">
        <div className="container">
          <Reveal className="cms-cta">
            <div>
              {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
              {s.heading && <h2>{rich(s.heading)}</h2>}
              {s.intro && <p>{rich(s.intro)}</p>}
            </div>
            <CmsButtons buttons={s.buttons} />
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className={`section cms-sec cms-sec--${layout} ${soft}`} id={`s-${s.key}`}>
      <div className="container">
        {(layout === 'text-image' || layout === 'image-text') ? (
          <div className={`cms-split ${layout === 'image-text' ? 'cms-split--rev' : ''}`}>
            <Reveal className="cms-split__text">
              <Head s={s} />
              <div className="cms-prose"><Paras text={s.body} /></div>
              {items.length > 0 && <ul className="cms-checks">{items.map((it, i) => <li key={i}><CheckCircle2 size={18} /><span>{it.title && <b>{rich(it.title)}</b>}{it.text && rich(it.text)}</span></li>)}</ul>}
              <CmsButtons buttons={s.buttons} />
            </Reveal>
            {s.image && (
              <Reveal className="cms-split__media" delay={0.08}>
                <img src={img(s.image)} alt={s.imageAlt || ''} loading="lazy" decoding="async" />
              </Reveal>
            )}
          </div>
        ) : (
          <>
            <Reveal><Head s={s} center={layout !== 'text'} /></Reveal>
            {layout === 'text' && (
              <Reveal className="cms-prose cms-prose--narrow">
                <Paras text={s.body} />
                {s.image && <img className="cms-wide-img" src={img(s.image)} alt={s.imageAlt || ''} loading="lazy" />}
              </Reveal>
            )}
            {layout === 'cards' && (
              <div className="cms-cards">
                {items.map((it, i) => {
                  const inner = (
                    <>
                      {it.image && <span className="cms-card__img"><img src={img(it.image)} alt="" loading="lazy" /></span>}
                      <span className="cms-card__body">
                        {!it.image && <span className="cms-card__n">{String(i + 1).padStart(2, '0')}</span>}
                        {it.title && <h3>{rich(it.title)}</h3>}
                        {it.text && <Paras text={it.text} />}
                        {it.href && <span className="link-arrow">Learn more <ArrowRight size={14} /></span>}
                      </span>
                    </>
                  );
                  return it.href
                    ? <Reveal key={i} delay={i * 0.04} as={it.href.startsWith('/') ? Link : 'a'} {...(it.href.startsWith('/') ? { to: it.href } : { href: it.href })} className="cms-card cms-card--link">{inner}</Reveal>
                    : <Reveal key={i} delay={i * 0.04} className="cms-card">{inner}</Reveal>;
                })}
              </div>
            )}
            {layout === 'list' && (
              <Reveal className="cms-list">
                {items.map((it, i) => <div key={i} className="cms-list__item"><CheckCircle2 size={20} /><div>{it.title && <b>{rich(it.title)}</b>}{it.text && <Paras text={it.text} />}</div></div>)}
              </Reveal>
            )}
            {layout === 'faq' && <Reveal className="cms-faq"><Faq items={items.map((it) => ({ question: plain(it.title), answer: <Paras text={it.text} /> }))} /></Reveal>}
            {layout === 'gallery' && (
              <div className="cms-gallery">
                {items.filter((it) => it.image).map((it, i) => (
                  <Reveal key={i} delay={i * 0.04} as="figure" className="cms-gallery__item">
                    <img src={img(it.image)} alt={it.title || ''} loading="lazy" decoding="async" />
                    {it.title && <figcaption>{it.title}</figcaption>}
                  </Reveal>
                ))}
              </div>
            )}
            {layout === 'quote' && (
              <Reveal as="figure" className="cms-quote">
                <Quote size={30} />
                <blockquote><Paras text={s.body} /></blockquote>
                {items[0] && <figcaption><b>{items[0].title}</b>{items[0].text && <span>{items[0].text}</span>}</figcaption>}
              </Reveal>
            )}
            {layout !== 'text' && s.body && layout !== 'quote' && <div className="cms-prose cms-prose--narrow cms-after"><Paras text={s.body} /></div>}
            <CmsButtons buttons={s.buttons} className={layout === 'text' ? '' : 'cms-btns--center'} />
          </>
        )}
      </div>
    </section>
  );
}

function plain(t) { return String(t || '').replace(/\*([^*\n]+)\*/g, '$1'); }

/** Admin-added sections placed after a built-in section ('top' = before the first one, 'end' = page end) */
export function CmsSlot({ pg, after }) {
  if (!pg) return null;
  const list = pg.custom(after);
  if (!list.length) return null;
  return list.map((s, i) => <CmsBlock key={s.key} s={s} index={i} />);
}

/** Banner shown while an admin previews unpublished changes */
export function PreviewBar() {
  return (
    <div className="cms-preview" role="status">
      <Eye size={16} /> <span>Preview – you are seeing <b>unpublished draft</b> content.</span>
      <button type="button" onClick={exitPreview}><X size={14} /> Exit preview</button>
    </div>
  );
}

/** Wraps a website page: loads its content, shows the preview bar and admin-added end sections */
export function CmsPage({ slug, children }) {
  const { settings, services } = useSite();
  const params = useParams();
  const key = typeof slug === 'function' ? slug(params) : slug;
  const pg = usePage(key, { settings, services });
  return (
    <PageCtx.Provider value={pg}>
      {pg.preview && <PreviewBar />}
      {children}
      <CmsSlot pg={pg} after="end" />
    </PageCtx.Provider>
  );
}
