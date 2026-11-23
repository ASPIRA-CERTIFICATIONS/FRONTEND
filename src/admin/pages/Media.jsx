import { useEffect, useState } from 'react';
import { Copy, Trash2, FileText } from 'lucide-react';
import { api, fileUrl } from '../../lib/api';
import { Uploader, useToast } from '../fields';

const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default function MediaLibrary() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('');
  const load = () => api(`/media${type ? `?type=${type}` : ''}`, { auth: true }).then(setItems).catch((e) => toast(e.message, 'err'));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  async function del(m) {
    if (!window.confirm(`Delete ${m.originalName} permanently? Pages using it will show a broken image.`)) return;
    try {
      await api(`/media/${m._id}`, { method: 'DELETE', auth: true });
      toast('File deleted');
      load();
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  async function saveAlt(m, alt) {
    if (alt === m.alt) return;
    try {
      await api(`/media/${m._id}`, { method: 'PATCH', body: { alt }, auth: true });
      toast('Alt text saved');
    } catch (e) {
      toast(e.message, 'err');
    }
  }
  const copy = (url) => navigator.clipboard?.writeText(url).then(() => toast('Path copied'));

  return (
    <>
      <Uploader onUploaded={load} accept="image/*,application/pdf,.doc,.docx" />
      <div className="toolbar">
        <select className="sel" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All files</option><option value="image">Images</option><option value="document">Documents</option>
        </select>
        <span className="muted">{items.length} files</span>
      </div>
      <div className="media-grid">
        {items.map((m) => (
          <div className="media-tile" key={m._id}>
            <a className="media-tile__thumb" href={fileUrl(m.url)} target="_blank" rel="noopener noreferrer">
              {m.mimeType?.startsWith('image/') ? <img src={fileUrl(m.url)} alt={m.alt} loading="lazy" /> : <FileText size={30} />}
            </a>
            <div style={{ padding: '.5rem .6rem 0' }}>
              <input className="inp" style={{ fontSize: '.78rem', padding: '.35rem .5rem' }} placeholder="Alt text (for SEO)" defaultValue={m.alt} onBlur={(e) => saveAlt(m, e.target.value)} />
            </div>
            <div className="media-tile__meta">
              <span title={m.originalName}>{kb(m.size)}</span>
              <span style={{ display: 'flex', gap: 4 }}>
                <button className="iconbtn" title="Copy path" onClick={() => copy(m.url)}><Copy size={13} /></button>
                <button className="iconbtn danger" title="Delete" onClick={() => del(m)}><Trash2 size={13} /></button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
