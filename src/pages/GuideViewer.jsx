/**
 * Insights & guides – online viewer for guide documents.
 * Guides are view-only: the file is drawn page by page onto canvases with an ASPIRA watermark
 * baked into each page (subtle, behind-the-text look), and there is no download or print option.
 * Opened with the viewing pass (?t=…) the visitor receives after giving their name + email.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Lock, AlertCircle } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Seo from '../components/Seo';
import { api } from '../lib/api';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

let logoImg = null;
const loadLogo = () => new Promise((resolve) => {
  if (logoImg) return resolve(logoImg);
  const im = new Image();
  im.onload = () => resolve((logoImg = im));
  im.onerror = () => resolve(null);
  im.src = '/brand/Aspiralogo.png';
});

/** ASPIRA watermark: tiled diagonal wordmark + a faint logo in the middle of the page */
function watermark(ctx, w, h, logo) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; // tints the paper, leaves dark text dark – reads as a background mark
  const size = Math.max(18, Math.round(w / 11));
  ctx.font = `800 ${size}px "Hanken Grotesk Variable", "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(27, 135, 69, 0.075)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 6);
  const stepX = size * 6.2;
  const stepY = size * 3.4;
  const span = Math.hypot(w, h);
  for (let y = -span / 2, row = 0; y < span / 2; y += stepY, row += 1) {
    for (let x = -span / 2 + (row % 2 ? stepX / 2 : 0); x < span / 2; x += stepX) ctx.fillText('ASPIRA', x, y);
  }
  ctx.restore();
  if (logo) {
    ctx.save();
    ctx.globalAlpha = 0.06;
    const lw = w * 0.42;
    const lh = (logo.height / logo.width) * lw;
    ctx.drawImage(logo, (w - lw) / 2, (h - lh) / 2, lw, lh);
    ctx.restore();
  }
}

export default function GuideViewer() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const t = params.get('t') || '';
  const [meta, setMeta] = useState(null);
  const [state, setState] = useState({ s: 'loading' });
  const [pages, setPages] = useState(0);
  const holder = useRef(null);
  const docRef = useRef(null);

  // details + file
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const m = await api(`/resources/${id}/view?t=${encodeURIComponent(t)}`);
        if (!live) return;
        setMeta(m);
        if (m.format === 'other') return setState({ s: 'error', msg: 'This guide cannot be shown online yet. Please contact us for a copy.' });
        const res = await fetch(`${BASE}/api/resources/${id}/view-file?t=${encodeURIComponent(t)}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status === 401 ? 'Your viewing link has expired. Please open the guide again from Insights & guides.' : 'Could not load the guide.');
        const buf = await res.arrayBuffer();
        if (!live) return;
        if (m.format === 'pdf') {
          const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
          docRef.current = { kind: 'pdf', doc };
          setPages(doc.numPages);
        } else {
          const url = URL.createObjectURL(new Blob([buf]));
          const im = new Image();
          await new Promise((ok, bad) => { im.onload = ok; im.onerror = bad; im.src = url; });
          docRef.current = { kind: 'image', im, url };
          setPages(1);
        }
        setState({ s: 'ready' });
      } catch (e) {
        if (live) setState({ s: 'error', msg: e.message || 'Could not load the guide.' });
      }
    })();
    return () => {
      live = false;
      if (docRef.current?.url) URL.revokeObjectURL(docRef.current.url);
      docRef.current?.doc?.destroy?.();
    };
  }, [id, t]);

  // draw every page at the current width (redrawn when the window is resized)
  useEffect(() => {
    if (state.s !== 'ready' || !holder.current) return undefined;
    let cancelled = false;
    let timer;
    const draw = async () => {
      const logo = await loadLogo();
      const width = holder.current?.clientWidth || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvases = holder.current?.querySelectorAll('canvas') || [];
      const d = docRef.current;
      for (let i = 0; i < canvases.length && !cancelled; i += 1) {
        const c = canvases[i];
        const ctx = c.getContext('2d');
        if (d.kind === 'pdf') {
          const page = await d.doc.getPage(i + 1);
          const base = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (width / base.width) * dpr });
          c.width = Math.floor(vp.width);
          c.height = Math.floor(vp.height);
          c.style.aspectRatio = `${vp.width} / ${vp.height}`;
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
        } else {
          c.width = Math.floor(width * dpr);
          c.height = Math.floor((d.im.height / d.im.width) * c.width);
          c.style.aspectRatio = `${c.width} / ${c.height}`;
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(d.im, 0, 0, c.width, c.height);
        }
        watermark(ctx, c.width, c.height, logo);
      }
    };
    draw();
    const onResize = () => { clearTimeout(timer); timer = setTimeout(draw, 250); };
    window.addEventListener('resize', onResize);
    return () => { cancelled = true; clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, [state.s, pages]);

  // view-only: no save / print shortcuts while the guide is open
  useEffect(() => {
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  return (
    <>
      <Seo title={meta?.title ? `${meta.title} – Guide` : 'Guide'} noindex />
      <section className="gv">
        <div className="gv__wrap">
          <Link to="/resources" className="gv__back"><ArrowLeft size={16} /> Insights &amp; guides</Link>
          <div className="gv__head">
            {meta?.category && <span className="post-card__cat">{meta.category}</span>}
            <h1>{meta?.title || 'Guide'}</h1>
            {meta?.description && <p>{meta.description}</p>}
            <span className="gv__badge"><Eye size={14} /> View-only guide <span aria-hidden="true">·</span> <Lock size={13} /> Download and printing are not available</span>
          </div>
          {state.s === 'loading' && <div className="gv__loading" role="status"><span className="spinner" /> Loading the guide…</div>}
          {state.s === 'error' && <div className="alert alert--err" role="alert"><AlertCircle size={18} /> {state.msg} <Link to="/resources">Back to Insights &amp; guides</Link></div>}
          {state.s === 'ready' && (
            <div className="gv__pages" ref={holder} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
              {Array.from({ length: pages }, (_, i) => (
                <figure key={i} className="gv__page">
                  <canvas aria-label={`${meta?.title || 'Guide'} – page ${i + 1} of ${pages}`} role="img" />
                  {pages > 1 && <figcaption>Page {i + 1} of {pages}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          <p className="gv__print-note">This guide is available to view online only.</p>
        </div>
      </section>
    </>
  );
}
