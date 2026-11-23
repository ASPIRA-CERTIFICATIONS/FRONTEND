import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, X, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, fileUrl } from '../lib/api';

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, kind = 'ok') => {
    setT({ msg, kind, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!t) return;
    const h = setTimeout(() => setT(null), 3200);
    return () => clearTimeout(h);
  }, [t]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && (
        <div className={`toast ${t.kind === 'err' ? 'toast--err' : ''}`} role="status">
          {t.kind === 'err' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />} {t.msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------------- Basic fields ---------------- */
export function Field({ label, hint, full, children }) {
  return (
    <div className={`f ${full ? 'full' : ''}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
export const Text = ({ label, hint, full, value, onChange, ...p }) => (
  <Field label={label} hint={hint} full={full}>
    <input className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...p} />
  </Field>
);
export const Area = ({ label, hint, full = true, value, onChange, rows = 4, ...p }) => (
  <Field label={label} hint={hint} full={full}>
    <textarea className="ta" rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...p} />
  </Field>
);
export const Select = ({ label, hint, full, value, onChange, options, ...p }) => (
  <Field label={label} hint={hint} full={full}>
    <select className="sel" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...p}>
      {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  </Field>
);
export const Toggle = ({ label, value, onChange }) => (
  <label className="switch"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
);
export const DateField = ({ label, value, onChange, full }) => (
  <Field label={label} full={full}>
    <input type="date" className="inp" value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value || null)} />
  </Field>
);

const move = (arr, i, d) => {
  const a = [...arr];
  const j = i + d;
  if (j < 0 || j >= a.length) return a;
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

/** Editable list of strings */
export function StringList({ label, hint, value = [], onChange, placeholder = 'Add item', multiline = false }) {
  const list = value || [];
  return (
    <Field label={label} hint={hint} full>
      <div className="listed">
        {list.map((v, i) => (
          <div className="listed__row" key={i}>
            {multiline ? (
              <textarea className="ta" rows={2} value={v} onChange={(e) => onChange(list.map((x, k) => (k === i ? e.target.value : x)))} />
            ) : (
              <input className="inp" value={v} onChange={(e) => onChange(list.map((x, k) => (k === i ? e.target.value : x)))} />
            )}
            <div className="listed__tools">
              <button type="button" className="iconbtn" title="Move up" onClick={() => onChange(move(list, i, -1))}><ArrowUp size={14} /></button>
              <button type="button" className="iconbtn" title="Move down" onClick={() => onChange(move(list, i, 1))}><ArrowDown size={14} /></button>
              <button type="button" className="iconbtn danger" title="Remove" onClick={() => onChange(list.filter((_, k) => k !== i))}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" style={{ justifySelf: 'start' }} onClick={() => onChange([...list, ''])}><Plus size={14} /> {placeholder}</button>
      </div>
    </Field>
  );
}

/** Editable list of objects. fields: [{ key, label, type: 'text'|'area'|'select', options }] */
export function ObjectList({ label, hint, value = [], onChange, fields, addLabel = 'Add' }) {
  const list = value || [];
  const blank = Object.fromEntries(fields.map((f) => [f.key, '']));
  const setItem = (i, k, v) => onChange(list.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <Field label={label} hint={hint} full>
      <div className="listed">
        {list.map((item, i) => (
          <div className="listed__obj" key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge">#{i + 1}</span>
              <div className="listed__tools">
                <button type="button" className="iconbtn" title="Move up" onClick={() => onChange(move(list, i, -1))}><ArrowUp size={14} /></button>
                <button type="button" className="iconbtn" title="Move down" onClick={() => onChange(move(list, i, 1))}><ArrowDown size={14} /></button>
                <button type="button" className="iconbtn danger" title="Remove" onClick={() => onChange(list.filter((_, k) => k !== i))}><Trash2 size={14} /></button>
              </div>
            </div>
            {fields.map((f) =>
              f.type === 'area' ? (
                <Area key={f.key} label={f.label} rows={3} value={item[f.key]} onChange={(v) => setItem(i, f.key, v)} />
              ) : f.type === 'select' ? (
                <Select key={f.key} label={f.label} options={f.options} value={item[f.key]} onChange={(v) => setItem(i, f.key, v)} />
              ) : (
                <Text key={f.key} label={f.label} value={item[f.key]} onChange={(v) => setItem(i, f.key, v)} />
              )
            )}
          </div>
        ))}
        <button type="button" className="btn btn--ghost btn--sm" style={{ justifySelf: 'start' }} onClick={() => onChange([...list, { ...blank }])}><Plus size={14} /> {addLabel}</button>
      </div>
    </Field>
  );
}

/* ---------------- Media ---------------- */
export function Uploader({ onUploaded, accept = 'image/*,application/pdf', folder = 'general', multiple = true }) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const input = useRef(null);
  async function upload(files) {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    fd.append('folder', folder);
    setBusy(true);
    try {
      const docs = await api('/media', { method: 'POST', body: fd, auth: true });
      toast(`${docs.length} file(s) uploaded`);
      onUploaded?.(docs);
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }
  return (
    <div
      className={`dropzone ${over ? 'over' : ''}`}
      onClick={() => input.current?.click()}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => (e.preventDefault(), setOver(false), upload(e.dataTransfer.files))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
    >
      <Upload size={22} style={{ margin: '0 auto .4rem' }} />
      {busy ? 'Uploading…' : <>Drag & drop files here, or <b>click to browse</b><br /><small>JPG, PNG, WebP, SVG, PDF, DOC · max 10 MB each</small></>}
      <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => upload(e.target.files)} />
    </div>
  );
}

export function MediaPicker({ open, onClose, onPick, type = 'image' }) {
  const [items, setItems] = useState([]);
  const load = useCallback(() => api(`/media?type=${type}`, { auth: true }).then(setItems).catch(() => {}), [type]);
  useEffect(() => {
    if (open) load();
  }, [open, load]);
  if (!open) return null;
  return (
    <div className="panel" role="dialog" aria-label="Choose a file">
      <div className="panel__bg" onClick={onClose} />
      <div className="panel__box">
        <div className="panel__head"><h2>Media library</h2><button className="iconbtn" onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        <div className="panel__body">
          <Uploader accept={type === 'image' ? 'image/*' : 'image/*,application/pdf,.doc,.docx'} onUploaded={(docs) => (docs.length === 1 ? onPick(docs[0].url) : load())} />
          <div className="media-grid">
            {items.map((m) => (
              <div key={m._id} className="media-tile pick" onClick={() => onPick(m.url)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onPick(m.url)}>
                <div className="media-tile__thumb">{m.mimeType?.startsWith('image/') ? <img src={fileUrl(m.url)} alt={m.alt} loading="lazy" /> : <FileText size={28} />}</div>
                <div className="media-tile__meta"><span>{m.originalName}</span></div>
              </div>
            ))}
            {!items.length && <p className="muted">No files yet – upload one above.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageField({ label, hint, value, onChange, type = 'image', full }) {
  const [open, setOpen] = useState(false);
  const isImg = value && !/\.(pdf|docx?)$/i.test(value);
  return (
    <Field label={label} hint={hint} full={full}>
      <div className="imgfield">
        <div className="imgfield__prev">{value ? (isImg ? <img src={fileUrl(value)} alt="" /> : <FileText size={24} />) : <ImageIcon size={22} color="#9aa3b5" />}</div>
        <div style={{ display: 'grid', gap: '.4rem', flex: 1 }}>
          <input className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/… or https://…" />
          <div style={{ display: 'flex', gap: '.4rem' }}>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(true)}>Choose / upload</button>
            {value && <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange('')}>Remove</button>}
          </div>
        </div>
      </div>
      <MediaPicker open={open} type={type} onClose={() => setOpen(false)} onPick={(url) => (onChange(url), setOpen(false))} />
    </Field>
  );
}

export function FileList({ label, hint, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const list = value || [];
  return (
    <Field label={label} hint={hint} full>
      <div className="media-grid">
        {list.map((f, i) => (
          <div className="media-tile" key={i}>
            <div className="media-tile__thumb">{/\.pdf$/i.test(f) ? <FileText size={26} /> : <img src={fileUrl(f)} alt="" />}</div>
            <div className="media-tile__meta">
              <span>Page {i + 1}</span>
              <button type="button" className="iconbtn danger" onClick={() => onChange(list.filter((_, k) => k !== i))} aria-label="Remove"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        <button type="button" className="dropzone" style={{ display: 'grid', placeItems: 'center', minHeight: 150 }} onClick={() => setOpen(true)}><Plus size={20} /> Add file</button>
      </div>
      <MediaPicker open={open} type="all" onClose={() => setOpen(false)} onPick={(url) => (onChange([...list, url]), setOpen(false))} />
    </Field>
  );
}

export function Callout({ children }) {
  return <div className="callout"><AlertTriangle size={16} /> <div>{children}</div></div>;
}
