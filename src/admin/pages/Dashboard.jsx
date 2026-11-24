import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Loader } from '../../components/ui';

export const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    const load = () => api('/dashboard/stats', { auth: true }).then(setD).catch((e) => setErr(e.message));
    load();
    window.addEventListener('aspira:new-enquiry', load);
    return () => window.removeEventListener('aspira:new-enquiry', load);
  }, []);
  if (err) return <div className="alert alert--err">{err}</div>;
  if (!d) return <Loader />;
  const e = d.enquiries;
  const maxSvc = Math.max(1, ...e.byService.map((x) => x.count));
  const statusCount = (s) => e.byStatus.find((x) => x._id === s)?.count || 0;
  return (
    <>
      <div className="kpis">
        <div className="kpi kpi--ink"><small>New enquiries</small><b>{e.new}</b></div>
        <div className="kpi"><small>Last 30 days</small><b>{e.last30}</b></div>
        <div className="kpi"><small>Total enquiries</small><b>{e.total}</b></div>
        <div className="kpi"><small>New chat leads</small><b>{e.chatNew ?? 0}</b></div>
        <div className="kpi"><small>Converted</small><b>{statusCount('converted')}</b></div>
        {d.applications && <Link to="/admin/careers?status=new" className="kpi"><small>New job applications</small><b>{d.applications.new}</b></Link>}
      </div>
      <div className="grid2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Latest enquiries</h2>
            <Link to="/admin/enquiries" className="link-arrow" style={{ fontSize: '.88rem' }}>View all <ArrowRight size={14} /></Link>
          </div>
          {e.recent.length === 0 ? (
            <p className="muted">No enquiries yet. Submissions from the website forms will appear here.</p>
          ) : (
            <table className="tbl">
              <tbody>
                {e.recent.map((r) => (
                  <tr key={r._id}>
                    <td><b>{r.name}</b><div className="muted">{r.service || r.type}</div></td>
                    <td className="muted">{fmt(r.createdAt)}</td>
                    <td><span className={`badge badge--${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h2>Enquiries by service</h2>
          {e.byService.length === 0 ? <p className="muted">No data yet.</p> : (
            <div className="bars">
              {e.byService.map((s) => (
                <div className="bar" key={s._id}>
                  <span>{s._id}</span><b>{s.count}</b>
                  <div className="bar__track"><div className="bar__fill" style={{ width: `${(s.count / maxSvc) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
          <h2 style={{ marginTop: '1.75rem' }}>Website content</h2>
          <div className="grid3">
            {Object.entries(d.content).map(([k, v]) => (
              <Link key={k} to={`/admin/${k}`} className="kpi" style={{ padding: '.9rem' }}><small>{k}</small><b style={{ fontSize: '1.6rem' }}>{v}</b></Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
