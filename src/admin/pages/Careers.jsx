import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Mail, Phone, Download, Trash2, MessageSquarePlus, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../fields';
import { JobsAdmin } from './Collections';

const STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'];
const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const kb = (n) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round((n || 0) / 1024)} KB`);

function Applications() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState({ q: '', status: params.get('status') || 'all', job: 'all', page: 1 });
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');

  const qs = new URLSearchParams({ q: q.q, status: q.status, page: q.page, limit: 25, ...(q.job !== 'all' ? { job: q.job } : {}) }).toString();
  const load = useCallback(() => {
    setLoading(true);
    return api(`/careers?${qs}`, { auth: true })
      .then(setData)
      .catch((e) => toast(e.message, 'err'))
      .finally(() => setLoading(false));
  }, [qs, toast]);

  useEffect(() => {
    const h = setTimeout(load, 250);
    return () => clearTimeout(h);
  }, [load]);
  useEffect(() => {
    api('/jobs/admin/all', { auth: true }).then(setJobs).catch(() => {});
  }, []);
  useEffect(() => {
    const id = params.get('open');
    if (id) api(`/careers/${id}`, { auth: true }).then(setSel).catch(() => {});
  }, [params]);

  const set = (k) => (e) => setQ((s) => ({ ...s, [k]: e.target.value, page: 1 }));

  async function update(body) {
    try {
      const a = await api(`/careers/${sel._id}`, { method: 'PATCH', body, auth: true });
      setSel(a);
      toast('Application updated');
      load();
      window.dispatchEvent(new Event('aspira:enquiries-changed'));
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  async function remove() {
    if (!window.confirm(`Delete ${sel.name}'s application and resume permanently? This cannot be undone.`)) return;
    try {
      await api(`/careers/${sel._id}`, { method: 'DELETE', auth: true });
      toast('Application deleted');
      setSel(null);
      load();
      window.dispatchEvent(new Event('aspira:enquiries-changed'));
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  // Resumes are private: fetch with the admin token, then hand the file to the browser.
  async function downloadResume(a) {
    try {
      const res = await api(`/careers/${a._id}/resume`, { auth: true, raw: true });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = (a.resume?.originalName || '').match(/\.\w+$/)?.[0] || '';
      link.download = `${a.name.replace(/[^a-z0-9]+/gi, '-')}-resume${ext}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      toast(e.message, 'err');
    }
  }

  return (
    <>
      <div className="card toolbar">
        <div className="grow" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--muted)' }} />
          <input className="inp" style={{ paddingLeft: 34 }} placeholder="Search name, email, phone, position, reference…" value={q.q} onChange={set('q')} />
        </div>
        <select className="sel" style={{ width: 'auto' }} value={q.status} onChange={set('status')} aria-label="Status">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="sel" style={{ width: 'auto' }} value={q.job} onChange={set('job')} aria-label="Position">
          <option value="all">All positions</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Received</th><th>Applicant</th><th>Contact</th><th>Position</th><th>Experience</th><th>Status</th></tr></thead>
          <tbody>
            {!loading && data.items.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '2.5rem' }}>No applications yet. Resumes submitted on the Careers page will appear here.</td></tr>
            )}
            {data.items.map((r) => (
              <tr key={r._id} className="click" onClick={() => (setSel(r), setNote(''))}>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{fmt(r.createdAt)}</td>
                <td><b>{r.name}</b>{r.location && <div className="muted">{r.location}</div>}</td>
                <td>{r.email}<div className="muted">{r.phone}</div></td>
                <td>{r.position || 'General application'}</td>
                <td className="muted">{r.experience || '—'}</td>
                <td><span className={`badge badge--app-${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span>{data.total} applications · page {q.page} of {data.pages}</span>
        <button className="btn btn--ghost btn--sm" disabled={q.page <= 1} onClick={() => setQ((s) => ({ ...s, page: s.page - 1 }))}>Previous</button>
        <button className="btn btn--ghost btn--sm" disabled={q.page >= data.pages} onClick={() => setQ((s) => ({ ...s, page: s.page + 1 }))}>Next</button>
      </div>

      {sel && (
        <div className="panel" role="dialog" aria-label="Application details">
          <div className="panel__bg" onClick={() => setSel(null)} />
          <div className="panel__box">
            <div className="panel__head">
              <h2>{sel.name}</h2>
              <button className="iconbtn" onClick={() => setSel(null)} aria-label="Close"><X size={16} /></button>
            </div>
            <div className="panel__body">
              <div className="card">
                <dl className="kv">
                  <dt>Reference</dt><dd style={{ fontFamily: 'var(--mono)' }}>{sel.reference}</dd>
                  <dt>Received</dt><dd>{fmt(sel.createdAt)}</dd>
                  <dt>Position</dt><dd>{sel.position || 'General application'}</dd>
                  <dt>Email</dt><dd><a href={`mailto:${sel.email}`}>{sel.email}</a></dd>
                  <dt>Phone</dt><dd><a href={`tel:${String(sel.phone).replace(/[^+\d]/g, '')}`}>{sel.phone}</a></dd>
                  {sel.experience && <><dt>Experience</dt><dd>{sel.experience}</dd></>}
                  {sel.location && <><dt>Location</dt><dd>{sel.location}</dd></>}
                  {sel.qualification && <><dt>Qualification</dt><dd>{sel.qualification}</dd></>}
                  {sel.linkedin && <><dt>LinkedIn</dt><dd><a href={/^https?:\/\//.test(sel.linkedin) ? sel.linkedin : `https://${sel.linkedin}`} target="_blank" rel="noopener noreferrer nofollow">{sel.linkedin}</a></dd></>}
                </dl>
                {sel.message && <><h3 style={{ marginTop: '1.25rem' }}>Cover note</h3><p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{sel.message}</p></>}
                {sel.resume?.file && (
                  <button type="button" className="resume-file" onClick={() => downloadResume(sel)}>
                    <FileText size={20} />
                    <span><b>{sel.resume.originalName || 'Resume'}</b><small>{kb(sel.resume.size)} · click to download</small></span>
                    <Download size={17} />
                  </button>
                )}
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <a className="btn btn--sm" href={`mailto:${sel.email}?subject=${encodeURIComponent(`Your application – Aspira Certifications`)}`}><Mail size={15} /> Email</a>
                  <a className="btn btn--ghost btn--sm" href={`tel:${String(sel.phone).replace(/[^+\d]/g, '')}`}><Phone size={15} /> Call</a>
                </div>
              </div>
              <div className="card">
                <h3>Status</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {STATUSES.map((s) => (
                    <button key={s} className={`badge badge--app-${s}`} style={{ border: sel.status === s ? '2px solid var(--ink)' : '2px solid transparent', cursor: 'pointer', padding: '.35rem .7rem' }} onClick={() => sel.status !== s && update({ status: s })}>{s}</button>
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
                  <textarea className="ta" rows={2} placeholder="Add a note (e.g. interview scheduled)…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button className="btn btn--sm" style={{ justifySelf: 'start' }} disabled={!note.trim()}><MessageSquarePlus size={15} /> Add note</button>
                </form>
              </div>
            </div>
            <div className="panel__foot">
              <button className="btn btn--danger btn--sm" onClick={remove}><Trash2 size={15} /> Delete application</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CareersAdmin() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'openings' ? 'openings' : 'applications';
  return (
    <>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'applications'} onClick={() => setParams({})}>Applications</button>
        <button role="tab" aria-selected={tab === 'openings'} onClick={() => setParams({ tab: 'openings' })}>Job openings</button>
      </div>
      {tab === 'applications' ? <Applications /> : <JobsAdmin />}
    </>
  );
}
