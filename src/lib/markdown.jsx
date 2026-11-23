/**
 * Tiny, safe Markdown renderer for blog/case-study content (no raw HTML is ever injected).
 * Supports: ## / ### headings, paragraphs, - or * bullet lists, 1. numbered lists,
 * **bold**, *italic*, [link text](https://…), > quotes.
 */
import { Fragment } from 'react';

function inline(text, keyBase = '') {
  const out = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[2]) out.push(<strong key={k}>{m[2]}</strong>);
    else if (m[3]) out.push(<em key={k}>{m[3]}</em>);
    else if (m[4]) {
      const href = m[5];
      const safe = /^(https?:\/\/|\/|mailto:|tel:|#)/i.test(href) ? href : '#';
      const ext = /^https?:/i.test(safe);
      out.push(<a key={k} href={safe} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[4]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text = '' }) {
  const blocks = [];
  const lines = String(text).replace(/\r/g, '').split('\n');
  let para = [];
  let list = null;
  const flushPara = () => {
    if (para.length) blocks.push({ t: 'p', v: para.join(' ') });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    let m;
    if ((m = line.match(/^(#{2,4})\s+(.*)$/))) { flushPara(); flushList(); blocks.push({ t: `h${Math.min(m[1].length + 0, 4)}`, v: m[2] }); continue; }
    if ((m = line.match(/^[-*]\s+(.*)$/))) { flushPara(); if (!list || list.t !== 'ul') { flushList(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flushPara(); if (!list || list.t !== 'ol') { flushList(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = line.match(/^>\s?(.*)$/))) { flushPara(); flushList(); blocks.push({ t: 'quote', v: m[1] }); continue; }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return (
    <div className="md">
      {blocks.map((b, i) => {
        if (b.t === 'ul' || b.t === 'ol') {
          const L = b.t;
          return <L key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</L>;
        }
        if (b.t === 'quote') return <blockquote key={i}>{inline(b.v, i)}</blockquote>;
        if (b.t === 'h2') return <h2 key={i}>{inline(b.v, i)}</h2>;
        if (b.t === 'h3') return <h3 key={i}>{inline(b.v, i)}</h3>;
        if (b.t === 'h4') return <h4 key={i}>{inline(b.v, i)}</h4>;
        return <p key={i}>{inline(b.v, i)}</p>;
      })}
    </div>
  );
}
export default Fragment;
