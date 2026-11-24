import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MessagesSquare, FileText, MessageCircle, CheckCheck, X } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from './fields';

const POLL_MS = 30000;
const SEEN_KEY = 'aspira_notif_seen';

const ago = (d) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const dd = Math.round(h / 24);
  return dd === 1 ? 'yesterday' : `${dd} days ago`;
};
const readSeen = () => {
  try { return Number(localStorage.getItem(SEEN_KEY)) || 0; } catch { return 0; }
};
const writeSeen = (t) => {
  try { localStorage.setItem(SEEN_KEY, String(t)); } catch { /* ignore */ }
};

/** Soft two-note chime (Web Audio – no file needed). Silently skipped if the browser blocks audio. */
function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.14;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {
    /* audio unavailable */
  }
}

/** Polls the API for enquiries with status "new". Shared by the bell and the sidebar badge. */
export function useNewEnquiries() {
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, seenAt: readSeen() });
  const known = useRef(null); // ids seen in previous polls
  const appsSeen = useRef(null);
  const [appsNew, setAppsNew] = useState(0);

  const load = useCallback(async () => {
    try {
      const d = await api('/enquiries?status=new&limit=8', { auth: true });
      const items = d.items || [];
      if (known.current) {
        const fresh = items.filter((e) => !known.current.has(e._id));
        if (fresh.length) {
          chime();
          window.dispatchEvent(new Event('aspira:new-enquiry'));
          toast(fresh.length === 1 ? `New enquiry from ${fresh[0].name}` : `${fresh.length} new enquiries received`);
        }
      }
      known.current = new Set(items.map((e) => e._id));
      setState((s) => ({ ...s, items, total: d.total || 0 }));
      // Job applications: count of "new" ones for the sidebar badge, toast when it grows
      const a = await api('/careers?status=new&limit=1', { auth: true }).catch(() => null);
      if (a) {
        if (appsSeen.current !== null && a.total > appsSeen.current) {
          chime();
          toast(a.total - appsSeen.current === 1 ? `New job application from ${a.items?.[0]?.name || 'a candidate'}` : `${a.total - appsSeen.current} new job applications`);
        }
        appsSeen.current = a.total;
        setAppsNew(a.total);
      }
    } catch {
      /* offline – try again next poll */
    }
  }, [toast]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('aspira:enquiries-changed', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('aspira:enquiries-changed', onFocus);
    };
  }, [load]);

  const unread = state.items.filter((e) => new Date(e.createdAt).getTime() > state.seenAt).length;
  const markSeen = () => {
    const t = Date.now();
    writeSeen(t);
    setState((s) => ({ ...s, seenAt: t }));
  };

  // Show the count of new enquiries in the browser tab
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\)\s*/, '');
    document.title = state.total ? `(${state.total > 99 ? '99+' : state.total}) ${base}` : base;
  }, [state.total]);

  return { ...state, unread, markSeen, reload: load, appsNew };
}

const CH_ICON = { chat: MessagesSquare, whatsapp: MessageCircle, form: FileText };

export function NotificationBell({ feed }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open) feed.reload();
  };
  const go = (id) => {
    setOpen(false);
    feed.markSeen();
    nav(`/admin/enquiries?open=${id}`);
  };
  const count = feed.unread || 0;

  return (
    <div className="notif" ref={box}>
      <button type="button" className={`notif__btn ${count ? 'has' : ''}`} onClick={toggle} aria-label={`Notifications${feed.total ? `, ${feed.total} new enquiries` : ''}`} aria-expanded={open}>
        <Bell size={18} />
        {feed.total > 0 && <span className={`notif__count ${count ? 'pulse' : ''}`}>{feed.total > 99 ? '99+' : feed.total}</span>}
      </button>
      {open && (
        <div className="notif__panel" role="dialog" aria-label="New enquiries">
          <div className="notif__head">
            <div><b>Notifications</b><small>{feed.total ? `${feed.total} new ${feed.total === 1 ? 'enquiry' : 'enquiries'} awaiting action` : 'You’re all caught up'}</small></div>
            <div className="notif__head-tools">
              {count > 0 && <button type="button" onClick={feed.markSeen} title="Mark all as read"><CheckCheck size={16} /></button>}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
            </div>
          </div>
          <div className="notif__list">
            {feed.items.length === 0 && (
              <div className="notif__empty"><Bell size={26} /><p>No new enquiries right now.<br />New website, chat and WhatsApp leads will appear here.</p></div>
            )}
            {feed.items.map((e) => {
              const Ic = CH_ICON[e.channel] || FileText;
              const unread = new Date(e.createdAt).getTime() > feed.seenAt;
              return (
                <button type="button" key={e._id} className={`notif__item ${unread ? 'unread' : ''}`} onClick={() => go(e._id)}>
                  <span className={`notif__ic notif__ic--${e.channel || 'form'}`}><Ic size={16} /></span>
                  <span className="notif__txt">
                    <b>{e.name}{e.organization ? <span> · {e.organization}</span> : null}</b>
                    <span>{e.service || e.category || e.type} {e.channel === 'chat' ? '· via chat' : e.channel === 'whatsapp' ? '· via WhatsApp' : ''}</span>
                    <small>{ago(e.createdAt)}</small>
                  </span>
                  {unread && <i className="notif__dot" aria-label="Unread" />}
                </button>
              );
            })}
          </div>
          <Link to="/admin/enquiries?status=new" className="notif__foot" onClick={() => (setOpen(false), feed.markSeen())}>View all new enquiries</Link>
        </div>
      )}
    </div>
  );
}
