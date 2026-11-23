import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Download, X, Trash2, Mail, Phone, MessageSquarePlus } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../fields';
import { fmt } from './Dashboard';

const STATUSES = ['new', 'contacted', 'in-progress', 'converted', 'closed', 'spam'];
const TYPES = ['general', 'service', 'quote', 'booking', 'consultation', 'chat', 'certificate', 'complaint'];
const CHANNELS = [['all', 'All channels'], ['form', 'Website forms'], ['chat', 'Chat'], ['whatsapp', 'WhatsApp']];

export default function Enquiries() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState({ q: '', status: params.get('status') || 'all', type: 'all', channel: params.get('channel') || 'all', from: '', to: '', page: 1 });
  useEffect(() => {
    setQ((s) => ({ ...s, channel: params.get('channel') || 'all', status: params.get('status') || 'all', page: 1 }));
  }, [params]);
  // Opened from a notification: /admin/enquiries?open=<id>
  useEffect(() => {
    const id = params.get('open');
    if (id) api(`/enquiries/${id}`, { auth: true }).then(setSel).catch(() => {});
  }, [params]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');

  const qs = new URLSearchParams(Object.entries({ ...q, limit: 20 }).filter(([, v]) => v !== '' && v !== 'all')).toString();

  const load = useCallback(() => {
    setLoading(true);
    api(`/enquiries?${qs}`, { auth: true })
      .then(setData)
      .catch((e) => toast(e.message, 'err'))
      .finally(() => setLoading(false));
  }, [qs, toast]);

  useEffect(() => {
    const h = setTimeout(load, 250);
    return () => clearTimeout(h);
  }, [load]);
  // Refresh the list when the notification poller sees a new enquiry
  useEffect(() => {
    window.addEventListener('aspira:new-enquiry', load);
    return () => window.removeEventListener('aspira:new-enquiry', load);
  }, [load]);

  const set = (k) => (e) => setQ((s) => ({ ...s, [k]: e.target.value, page: 1 }));

  async function update(body) {
    try {
      const item = await api(`/enquiries/${sel._id}`, { method: 'PATCH', body, auth: true });
      setSel(item);
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === item._id ? item : x)) }));
      toast('Enquiry updated');
      window.dispatchEvent(new Event('aspira:enquiries-changed'));
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function remove() {
    if (!window.confirm('Delete this enquiry permanently? This cannot be undone.')) return;
    try {
      await api(`/enquiries/${sel._id}`, { method: 'DELETE', auth: true });
      setSel(null);
      toast('Enquiry deleted');
      window.dispatchEvent(new Event('aspira:enquiries-changed'));
      load();
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  async function exportCsv() {
    try {
      const res = await api(`/enquiries/export.csv?${qs}`, { auth: true, raw: true });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aspira-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  return (
    <>
      <div className="card toolbar">
        <div className="grow" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--muted)' }} />
          <input className="inp" style={{ paddingLeft: 34 }} placeholder="Search name, email, phone, organisation, message…" value={q.q} onChange={set('q')} />
        </div>
        <select className="sel" style={{ width: 'auto' }} value={q.status} onChange={set('status')}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="sel" style={{ width: 'auto' }} value={q.channel} onChange={set('channel')} aria-label="Channel">
          {CHANNELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="sel" style={{ width: 'auto' }} value={q.type} onChange={set('type')}>
          <option value="all">All types</option>
          {TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" className="inp" style={{ width: 'auto' }} value={q.from} onChange={set('from')} aria-label="From date" />
        <input type="date" className="inp" style={{ width: 'auto' }} value={q.to} onChange={set('to')} aria-label="To date" />
        <button className="btn btn--ghost btn--sm" onClick={exportCsv}><Download size={15} /> Export CSV</button>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Received</th><th>Name</th><th>Contact</th><th>Service / type</th><th>Source</th><th>Status</th></tr>
          </thead>
          <tbody>
            {!loading && data.items.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '2.5rem' }}>No enquiries match these filters.</td></tr>
            )}
            {data.items.map((r) => (
              <tr key={r._id} className="click" onClick={() => (setSel(r), setNote(''))}>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{fmt(r.createdAt)}</td>
                <td><b>{r.name}</b>{r.organization && <div className="muted">{r.organization}</div>}</td>
                <td>{r.email}<div className="muted">{r.phone}</div></td>
                <td>{r.service || '—'}<div className="muted">{r.type}{r.category ? ` · ${r.category}` : ''}</div></td>
                <td><span className={`badge badge--ch-${r.channel || 'form'}`}>{r.channel || 'form'}</span><div className="muted">{r.location || r.city}</div></td>
                <td><span className={`badge badge--${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span>{data.total} enquiries · page {q.page} of {data.pages}</span>
        <button className="btn btn--ghost btn--sm" disabled={q.page <= 1} onClick={() => setQ((s) => ({ ...s, page: s.page - 1 }))}>Previous</button>
        <button className="btn btn--ghost btn--sm" disabled={q.page >= data.pages} onClick={() => setQ((s) => ({ ...s, page: s.page + 1 }))}>Next</button>
      </div>

      {sel && (
        <div className="panel" role="dialog" aria-label="Enquiry details">
          <div className="panel__bg" onClick={() => setSel(null)} />
          <div className="panel__box">
            <div className="panel__head">
              <h2>{sel.name}</h2>
              <button className="iconbtn" onClick={() => setSel(null)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="panel__body">
              <div className="card">
                <dl className="kv">
                  <dt>Reference</dt><dd style={{ fontFamily: 'var(--mono)' }}>ASP-{String(sel._id).slice(-6).toUpperCase()}</dd>
                  <dt>Received</dt><dd>{fmt(sel.createdAt)}</dd>
                  <dt>Email</dt><dd><a href={`mailto:${sel.email}`}>{sel.email}</a></dd>
                  {sel.phone && <><dt>Phone</dt><dd><a href={`tel:${sel.phone.replace(/[^+\d]/g, '')}`}>{sel.phone}</a></dd></>}
                  {sel.organization && <><dt>Organisation</dt><dd>{sel.organization}</dd></>}
                  {sel.segment && <><dt>Type of client</dt><dd>{sel.segment}</dd></>}
                  {(sel.location || sel.city) && <><dt>Location</dt><dd>{sel.location || sel.city}</dd></>}
                  <dt>Channel</dt><dd>{sel.channel || 'form'}</dd>
                  <dt>Enquiry type</dt><dd>{sel.type}</dd>
                  {sel.category && <><dt>Category</dt><dd>{sel.category}</dd></>}
                  {sel.service && <><dt>Service</dt><dd>{sel.service}</dd></>}
                  {sel.sourcePage && <><dt>Submitted from</dt><dd>{sel.sourcePage}</dd></>}
                </dl>
                {sel.message && <><h3 style={{ marginTop: '1.25rem' }}>Message</h3><p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{sel.message}</p></>}
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <a className="btn btn--sm" href={`mailto:${sel.email}?subject=${encodeURIComponent('Your enquiry with Aspira Certifications')}`}><Mail size={15} /> Reply by email</a>
                  {sel.phone && <a className="btn btn--ghost btn--sm" href={`tel:${sel.phone.replace(/[^+\d]/g, '')}`}><Phone size={15} /> Call</a>}
                  {sel.phone && <a className="btn btn--wa btn--sm" href={`https://wa.me/${sel.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${sel.name}, thank you for contacting Aspira Certifications.`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                </div>
              </div>
              <div className="card">
                <h3>Status</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {STATUSES.map((s) => (
                    <button key={s} className={`badge badge--${s}`} style={{ border: sel.status === s ? '2px solid var(--ink)' : '2px solid transparent', cursor: 'pointer', padding: '.35rem .7rem' }} onClick={() => sel.status !== s && update({ status: s })}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3>Internal notes</h3>
                <div className="notes">
                  {(sel.notes || []).map((n, i) => <div className="note-item" key={i}>{n.text}<small>{n.by} · {fmt(n.at)}</small></div>)}
                  {!sel.notes?.length && <p className="muted" style={{ margin: 0 }}>No notes yet.</p>}
                </div>
                <form style={{ display: 'grid', gap: '.5rem', marginTop: '.75rem' }} onSubmit={(e) => (e.preventDefault(), note.trim() && update({ note }).then(() => setNote('')))}>
                  <textarea className="ta" rows={2} placeholder="Add a note (e.g. called, sent proposal)…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn btn--sm" style={{ justifySelf: 'start' }} disabled={!note.trim()}><MessageSquarePlus size={15} /> Add note</button>
                </form>
              </div>
            </div>
            <div className="panel__foot">
              <button className="btn btn--danger btn--sm" onClick={remove}><Trash2 size={15} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
