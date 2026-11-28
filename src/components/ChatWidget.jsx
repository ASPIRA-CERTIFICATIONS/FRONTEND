import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquareText, X, Send, MessageCircle, ArrowRight, RotateCcw, ClipboardList } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api, isApiDown } from '../lib/api';
import { waLink } from '../lib/whatsapp';
import { isEmail, isMobile } from './EnquiryForm';
import { SPIRA, BRANCHES, VERIFY, OTHER_PROMPT } from '../lib/chatScript';

/**
 * Spira – guided website chat (script in lib/chatScript.js, from the client's content doc).
 * The visitor picks a topic and answers a few questions; Spira replies with what's worth knowing,
 * shows a summary card, then collects contact details and saves the lead (Enquiries, channel: chat).
 * "Talk to a person" is visible throughout and opens WhatsApp.
 */
const EMPTY_CONTACT = { name: '', organization: '', phone: '', email: '', city: '' };

export default function ChatWidget({ open, setOpen }) {
  const { settings } = useSite();
  const { pathname } = useLocation();
  const wa = settings.contact?.whatsapp;
  const [msgs, setMsgs] = useState([]);
  const [branch, setBranch] = useState(null);
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState('menu'); // menu | steps | verify | free | contact | done
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [errs, setErrs] = useState({});
  const [free, setFree] = useState('');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState('');
  const endRef = useRef(null);

  const bot = (text, extra = {}) => setMsgs((m) => [...m, { from: 'bot', text, ...extra }]);
  const me = (text) => setMsgs((m) => [...m, { from: 'me', text }]);

  function start() {
    setMsgs([{ from: 'bot', text: SPIRA.opening, menu: true }]);
    setBranch(null); setAnswers({}); setStage('menu'); setSummary(''); setFree(''); setErrs({});
  }
  useEffect(() => { if (open && msgs.length === 0) start(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, open, stage]);

  const stepsOf = (b, a) => (b.steps || []).filter((st) => !st.when || st.when(a));
  function askNext(b, a) {
    const next = stepsOf(b, a).find((st) => a[st.id] === undefined);
    if (next) {
      bot(next.q, { step: next.id });
      setStage('steps');
      return;
    }
    const sum = b.summary(a);
    setSummary(sum);
    bot(sum, { summary: true });
    bot(SPIRA.contactIntro);
    setStage('contact');
  }
  function pickBranch(b) {
    me(b.label);
    setBranch(b);
    setAnswers({});
    if (b.key === 'verify') {
      bot(VERIFY.text, { link: VERIFY.link });
      bot(VERIFY.ask, { verify: true });
      setStage('verify');
      return;
    }
    if (b.key === 'other') {
      bot(OTHER_PROMPT);
      setStage('free');
      return;
    }
    askNext(b, {});
  }
  function answer(stepId, opt) {
    const st = branch.steps.find((x) => x.id === stepId);
    const [label, reply] = opt;
    me(label);
    const a = { ...answers, [stepId]: label };
    setAnswers(a);
    if (reply) bot(reply);
    else if (st.reply) bot(st.reply);
    if (st.after) bot(st.after);
    askNext(branch, a);
  }
  function onFree(e) {
    e.preventDefault();
    const t = free.trim();
    if (t.length < 3) return;
    me(t);
    setFree('');
    setSummary(t);
    bot(SPIRA.contactIntro);
    setStage('contact');
  }

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (contact.name.trim().length < 2) er.name = 'Please enter your name';
    if (!isMobile(contact.phone)) er.phone = 'Please enter a valid 10-digit mobile number';
    if (contact.email.trim() && !isEmail(contact.email)) er.email = 'Please enter a valid email or leave it empty';
    if (contact.city.trim().length < 2) er.city = 'Please enter your city';
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const b = branch || BRANCHES.find((x) => x.key === 'other');
    const qa = stepsOf(b, answers).map((st) => `${st.q} ${answers[st.id]}`).join('\n');
    try {
      await api('/enquiries', {
        method: 'POST',
        body: {
          type: 'chat',
          channel: 'chat',
          name: contact.name.trim(),
          organization: contact.organization.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim(),
          city: contact.city.trim(),
          service: b.service || '',
          serviceSlug: b.slug || '',
          message: [`Spira summary: ${summary}`, qa].filter(Boolean).join('\n\n'),
          sourcePage: pathname,
        },
      });
      const first = contact.name.trim().split(' ')[0];
      bot(SPIRA.closing(first), b.slug ? { readMore: { to: `/services/${b.slug}`, label: b.service } } : {});
      setStage('done');
    } catch (err) {
      bot(!isApiDown(err) ? err.message : `Sorry, I couldn't send that right now. Please call ${settings.contact?.phones?.[0] || 'us'} or tap “${SPIRA.talkToPerson}”.`);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  const last = msgs.length - 1;
  const waText = `Hello Aspira, ${summary ? `my enquiry: ${summary}` : 'I would like to talk to someone about an audit.'}`;
  const set = (k) => (e) => { setContact((c) => ({ ...c, [k]: e.target.value })); setErrs((x) => ({ ...x, [k]: undefined })); };

  return (
    <div className="chat" role="dialog" aria-label={`Chat with ${SPIRA.name}`}>
      <div className="chat__head">
        <div className="chat__who">
          <span className="chat__avatar"><img src="/brand/favicon.png" alt="" /></span>
          <div><b>{SPIRA.name}</b><small>{SPIRA.tagline}</small></div>
        </div>
        <div className="chat__headbtns">
          {msgs.length > 1 && <button className="chat__close" onClick={start} aria-label="Start again" title="Start again"><RotateCcw size={16} /></button>}
          <button className="chat__close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
        </div>
      </div>
      <div className="chat__body" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`chat__msg chat__msg--${m.from}`}>
            <div className={`chat__bubble ${m.summary ? 'chat__summary' : ''}`}>
              {m.summary && <span className="chat__summary-h"><ClipboardList size={14} /> Summary</span>}
              {m.text}
              {m.link && <> <Link className="chat__inl" to={m.link.to} onClick={() => window.innerWidth < 640 && setOpen(false)}>{m.link.label} →</Link></>}
              {m.readMore && <> {SPIRA.readMore} <Link className="chat__inl" to={m.readMore.to} onClick={() => window.innerWidth < 640 && setOpen(false)}>{m.readMore.label}</Link>.</>}
            </div>
            {m.menu && stage === 'menu' && i === last && (
              <div className="chat__opts">{BRANCHES.map((b) => <button key={b.key} onClick={() => pickBranch(b)}>{b.label}</button>)}</div>
            )}
            {m.step && stage === 'steps' && i === last && (
              <div className="chat__opts">{branch.steps.find((x) => x.id === m.step).options.map((o) => <button key={o[0]} onClick={() => answer(m.step, o)}>{o[0]}</button>)}</div>
            )}
            {m.verify && stage === 'verify' && i === last && (
              <div className="chat__opts">
                <button onClick={() => { me(VERIFY.options[0]); bot(SPIRA.opening, { menu: true }); setStage('menu'); }}>{VERIFY.options[0]}</button>
                <button onClick={() => { me(VERIFY.options[1]); bot('Thank you for visiting Aspira. Have a great day!'); setStage('done'); }}>{VERIFY.options[1]}</button>
              </div>
            )}
          </div>
        ))}
        {stage === 'contact' && (
          <form className="chat__form" onSubmit={submit} noValidate>
            {[['name', 'Your name', 'name'], ['organization', 'Organisation or business name', 'organization'], ['phone', 'Phone / WhatsApp number', 'tel'], ['email', 'Email (optional)', 'email'], ['city', 'City', 'address-level2']].map(([k, label, ac]) => (
              <label key={k}>
                <span>{label}</span>
                <input value={contact[k]} onChange={set(k)} autoComplete={ac} type={k === 'phone' ? 'tel' : k === 'email' ? 'email' : 'text'} inputMode={k === 'phone' ? 'tel' : undefined} maxLength={k === 'organization' ? 160 : 120} aria-invalid={!!errs[k]} />
                {errs[k] && <small>{errs[k]}</small>}
              </label>
            ))}
            <button className="btn btn--green btn--sm" disabled={busy}>{busy ? 'Sending…' : 'Send to the team'} <Send size={14} /></button>
          </form>
        )}
        {busy && <div className="chat__msg chat__msg--bot"><div className="chat__bubble chat__typing"><span /><span /><span /></div></div>}
        <div ref={endRef} />
      </div>
      {stage === 'free' && (
        <form className="chat__input" onSubmit={onFree} noValidate>
          <input value={free} onChange={(e) => setFree(e.target.value)} placeholder="Tell us what you need…" aria-label="Tell us what you need" maxLength={1000} autoFocus />
          <button aria-label="Send" disabled={free.trim().length < 3}><Send size={17} /></button>
        </form>
      )}
      {wa && (
        <a className="chat__foot chat__person" href={waLink(wa, waText)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> {SPIRA.talkToPerson}</a>
      )}
    </div>
  );
}

export function ChatLauncher({ open, setOpen, unread }) {
  return (
    <button className={`fab__chat ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label={open ? 'Close chat' : 'Chat with us'} aria-expanded={open}>
      {open ? <X size={22} /> : <MessageSquareText size={22} />}
      {!open && unread && <span className="fab__dot" />}
    </button>
  );
}
