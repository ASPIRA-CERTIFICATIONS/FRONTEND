import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Quote, Maximize2 } from 'lucide-react';
import { useFetch } from '../context/SiteContext';
import { fileUrl } from '../lib/api';
import Seo, { breadcrumbSchema } from '../components/Seo';
import { Reveal } from '../components/ui';
import { CtaBand } from '../components/Sections';
import { PageIntro } from './Company';
import { TESTIMONIAL_LETTERS } from '../lib/testimonialLetters';
import LetterImg from '../components/LetterImg';

export default function TestimonialsPage() {
  const { data } = useFetch('/testimonials');
  const quotes = (data || []).filter((t) => t.quote);
  const letters = [...TESTIMONIAL_LETTERS, ...(data || []).filter((t) => t.letter).map((t) => ({ _id: t._id, src: fileUrl(t.letter), fallback: fileUrl(t.letter), width: 1000, height: 1400, name: t.name }))];
  const [open, setOpen] = useState(-1);
  useEffect(() => {
    if (open < 0) return undefined;
    const k = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % letters.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + letters.length) % letters.length);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, letters.length]);

  return (
    <>
      <Seo title="Client Testimonials" description="What organisations say about their audits with Aspira Certifications." jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Testimonials', path: '/testimonials' }])} />
      <PageIntro
        eyebrow="Client testimonials"
        title={<>What our clients <em className="accent">say</em></>}
        lead="At Aspira Certifications, audits are conducted with a strong focus on credibility, rigor, and value. Our work supports organizations in strengthening compliance, improving systems, and advancing quality, safety, and sustainability practices. Here’s what organizations say about their experience working with us."
        crumbs={[{ label: 'Testimonials' }]}
      />
      <section className="q-sec">
        <div className="q-wrap">
          <div className="tl-grid">
            {letters.map((l, i) => (
              <Reveal key={l._id} delay={i * 0.06}>
                <button type="button" className="tl-letter" onClick={() => setOpen(i)} aria-label={`Open testimonial letter ${i + 1}`}>
                  <LetterImg l={l} alt={`Client testimonial letter ${i + 1} for Aspira Certifications`} loading={i < 2 ? 'eager' : 'lazy'} />
                  <span className="tl-letter__zoom"><Maximize2 size={16} /> Read letter</span>
                </button>
              </Reveal>
            ))}
          </div>
          {quotes.length > 0 && (
            <div className="tl-quotes">
              {quotes.map((t, i) => (
                <Reveal as="figure" key={t._id} className="tl-quote" delay={i * 0.05}>
                  <Quote size={26} className="tl-quote__mark" />
                  <blockquote>{t.quote}</blockquote>
                  <figcaption><b>{t.name}</b><span>{[t.designation, t.organization].filter(Boolean).join(', ')}</span></figcaption>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      {open >= 0 && (
        <div className="acc2-lb" role="dialog" aria-modal="true" aria-label="Testimonial letter" onClick={() => setOpen(-1)}>
          <button type="button" className="acc2-lb__x" aria-label="Close" onClick={() => setOpen(-1)}><X size={22} /></button>
          {letters.length > 1 && <button type="button" className="acc2-lb__nav acc2-lb__nav--l" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i - 1 + letters.length) % letters.length); }}><ChevronLeft size={26} /></button>}
          <figure onClick={(e) => e.stopPropagation()}>
            <LetterImg key={letters[open]._id} l={letters[open]} alt="" />
            <figcaption>Testimonial {open + 1} / {letters.length}</figcaption>
          </figure>
          {letters.length > 1 && <button type="button" className="acc2-lb__nav acc2-lb__nav--r" aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((i) => (i + 1) % letters.length); }}><ChevronRight size={26} /></button>}
        </div>
      )}
      <CtaBand />
    </>
  );
}
