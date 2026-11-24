import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquareText, X, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api, isApiDown } from '../lib/api';
import { waLink } from '../lib/whatsapp';
import { isEmail, isMobile } from './EnquiryForm';

/**
 * Guided website chat. Answers common questions from verified site content, collects
 * name / mobile / email / enquiry, saves the lead in MongoDB (channel: chat) and
 * offers to continue on WhatsApp.
 */
const TOPICS = {
  green: { label: 'Green Audit', service: 'Green Audits', slug: 'green-audits', category: 'Sustainability', audience: 'educational institution' },
  hygiene: { label: 'Hygiene Rating Audit', service: 'Hygiene Rating Audits', slug: 'hygiene-rating-audits', category: 'Food Safety', audience: 'restaurant' },
  other: { label: 'Other Services', service: '', slug: '', category: '' },
};

function answerFor(text, settings, nabcb) {
  const t = text.toLowerCase();
  const phone = settings.contact?.phones?.[0];
  if (/naac|green|campus|college|school|universit|institution|7\.1\.6/.test(t))
    return { topic: 'green', text: `Our Green Audits are for schools, colleges, universities and other educational institutions. We check water usage, electricity consumption, waste management, solar energy, tree plantation and environmental practices, and the audit report supports NAAC metric 7.1.6.${nabcb ? ` Aspira is a NABCB-accredited Inspection Body (Reg. No. ${nabcb.registrationNo}) for green audits of educational institutions.` : ''}` };
  if (/hygiene|fssai|restaurant|hotel|canteen|cafe|kitchen|food|smiley|rating/.test(t))
    return { topic: 'hygiene', text: 'Our Hygiene Rating Audits are for restaurants, hotels, canteens and food businesses. We check kitchen cleanliness, food storage and handling, pest control, sanitation and drinking-water hygiene under the FSSAI Hygiene Rating Scheme (rated 1–5 smileys).' };
  if (/nabcb|accredit|ib ?159|17020|certificate of accreditation/.test(t))
    return { text: nabcb ? `Aspira is accredited by NABCB as a Type ‘A’ Inspection Body, Reg. No. ${nabcb.registrationNo}, for green audits for educational institutions (IAF Scope 28). You can verify this on the NABCB website: https://nabcb.qci.org.in/ib-159/` : 'Please see our Accreditations page for details.' };
  if (/price|cost|fee|charge|quote|rate/.test(t))
    return { text: 'Fees depend on the service and the size of your site. Share your details below and our team will send you a quote.' };
  if (/verify|certificate status|check certificate/.test(t)) return { text: 'You can verify an Aspira certificate on our Certificate Status page using the number printed on it.' };
  if (/where|address|location|office|chennai/.test(t)) return { text: `Our office is in Chennai: ${settings.contact?.address || ''}` };
  if (/phone|call|contact|number|email/.test(t)) return { text: `You can call us on ${phone || 'our office number'}${settings.contact?.emails?.[0] ? ` or email ${settings.contact.emails[0]}` : ''}.` };
  if (/what do you do|about aspira|who are you|company/.test(t)) return { text: 'Aspira Certifications is an audit, inspection and certification company. We check whether schools, colleges, restaurants, construction companies and other organisations follow the required safety, hygiene and environmental standards.' };
  if (/construction|builder|contractor|scaffold|helmet/.test(t)) return { topic: 'other', text: 'Our Construction Safety Audits are for builders, contractors and construction companies – we check workers’ safety, scaffolding, helmets and PPE, safety equipment and site electrical safety.' };
  if (/fire|extinguisher|alarm|evacuat/.test(t)) return { topic: 'other', text: 'Our Fire Safety Audits check fire extinguishers, emergency exits, fire alarms and evacuation systems – for offices, hotels, industries and institutions.' };
  if (/electric/.test(t)) return { topic: 'other', text: 'Our Electrical Safety Audits check electrical installations, wiring, earthing and shock prevention in factories, industries and commercial buildings.' };
  if (/safety|warehouse|workplace/.test(t)) return { topic: 'other', text: 'We carry out workplace, construction, fire, electrical and warehouse safety audits. Let me take your details so an auditor can contact you.' };
  if (/energy|water|green building|igbc|griha/.test(t)) return { topic: 'other', text: 'Our Energy and Water Audits analyse your electricity and water consumption and recommend ways to reduce wastage – for industries, colleges, schools, factories and commercial buildings. Share your details and our team will get in touch.' };
  return null;
}

export default function ChatWidget({ open, setOpen }) {
  const { settings, accreditations } = useSite();
  const { pathname } = useLocation();
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const wa = settings.contact?.whatsapp;
  const [msgs, setMsgs] = useState([]);
  const [step, setStep] = useState('topic'); // topic -> name -> phone -> email -> details -> done
  const [lead, setLead] = useState({ topic: null, name: '', phone: '', email: '', message: '' });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const bot = (text, extra = {}) => setMsgs((m) => [...m, { from: 'bot', text, ...extra }]);
  const me = (text) => setMsgs((m) => [...m, { from: 'me', text }]);

  useEffect(() => {
    if (open && msgs.length === 0) {
      bot(`Hello! 👋 I'm Aspira's virtual assistant. How can we help you today?`, { options: true });
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [msgs, open]);

  function chooseTopic(key, silent = false) {
    const t = TOPICS[key];
    if (!silent) me(t.label);
    setLead((l) => ({ ...l, topic: key }));
    if (key === 'green') bot('Great choice. Our NABCB-accredited Green Audits are for schools, colleges, universities and other educational institutions.', { link: { to: '/services/green-audits', label: 'About Green Audits' } });
    else if (key === 'hygiene') bot('Our Hygiene Rating Audits help restaurants, hotels, cafes and food outlets achieve and display an FSSAI hygiene rating.', { link: { to: '/services/hygiene-rating-audits', label: 'About Hygiene Rating Audits' } });
    else bot('We also offer safety, energy and water audits and green building assessments.', { link: { to: '/services', label: 'See all services' } });
    bot('May I have your name?');
    setStep('name');
  }

  async function submit(final) {
    setBusy(true);
    const t = TOPICS[final.topic || 'other'];
    try {
      const res = await api('/enquiries', {
        method: 'POST',
        body: {
          type: 'chat',
          channel: 'chat',
          name: final.name,
          phone: final.phone,
          email: final.email,
          service: t.service,
          serviceSlug: t.slug,
          category: t.category,
          message: final.message,
          sourcePage: pathname,
        },
      });
      setRef(res.reference);
      bot(`Thank you, ${final.name.split(' ')[0]}! Your enquiry is saved (ref. ${res.reference}). Our team will contact you shortly.`, { wa: true });
      setStep('done');
    } catch (e) {
      bot(!isApiDown(e) ? e.message : `Sorry, I couldn't save that right now. Please call ${settings.contact?.phones?.[0] || 'us'} or continue on WhatsApp.`, { wa: true });
      setStep('done');
    } finally {
      setBusy(false);
    }
  }

  function onSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    me(text);
    if (step === 'topic' || step === 'done') {
      const a = answerFor(text, settings, nabcb);
      if (a) {
        bot(a.text);
        if (step === 'topic') {
          if (a.topic) return setTimeout(() => chooseTopic(a.topic, true), 250);
          return bot('Would you like us to contact you? Choose a service:', { options: true });
        }
        return;
      }
      if (step === 'topic') return bot("I can help with Green Audits, Hygiene Rating Audits and our other services. Please pick one, or leave your details and an expert will call you.", { options: true });
      return bot(`For anything else, please call ${settings.contact?.phones?.[0] || 'us'} or continue on WhatsApp.`, { wa: true });
    }
    if (step === 'name') {
      if (text.length < 2) return bot('Please enter your full name.');
      setLead((l) => ({ ...l, name: text }));
      bot(`Thanks, ${text.split(' ')[0]}. What's your mobile number?`);
      return setStep('phone');
    }
    if (step === 'phone') {
      if (!isMobile(text)) return bot('That doesn’t look like a valid 10-digit Indian mobile number. Please try again.');
      setLead((l) => ({ ...l, phone: text }));
      bot('And your email address?');
      return setStep('email');
    }
    if (step === 'email') {
      if (!isEmail(text)) return bot('Please enter a valid email address.');
      setLead((l) => ({ ...l, email: text }));
      const aud = TOPICS[lead.topic]?.audience;
      bot(`Finally, tell us a little about your requirement${aud ? ` (${aud} name and city)` : ' (organisation, city, what you need)'}.`);
      return setStep('details');
    }
    if (step === 'details') {
      const final = { ...lead, message: text };
      setLead(final);
      return submit(final);
    }
  }

  const waText = ref
    ? `Hello Aspira, my chat enquiry reference is ${ref}.`
    : `Hello Aspira, I would like to enquire about ${TOPICS[lead.topic]?.service || 'your audit services'}.`;

  if (!open) return null;
  const placeholder = { topic: 'Type your question…', name: 'Your name', phone: 'Mobile number', email: 'Email address', details: 'Your requirement', done: 'Ask another question…' }[step];

  return (
    <div className="chat" role="dialog" aria-label="Chat with Aspira">
      <div className="chat__head">
        <div className="chat__who">
          <span className="chat__avatar"><img src="/brand/favicon.png" alt="" /></span>
          <div><b>Aspira Certifications</b><small>Virtual assistant · typically replies instantly</small></div>
        </div>
        <button className="chat__close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
      </div>
      <div className="chat__body" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`chat__msg chat__msg--${m.from}`}>
            <div className="chat__bubble">{m.text}</div>
            {m.link && <Link className="chat__link" to={m.link.to} onClick={() => window.innerWidth < 640 && setOpen(false)}>{m.link.label} <ArrowRight size={13} /></Link>}
            {m.options && step === 'topic' && i === msgs.length - 1 && (
              <div className="chat__opts">
                {Object.entries(TOPICS).map(([k, t]) => <button key={k} onClick={() => chooseTopic(k)}>{t.label}</button>)}
                <button onClick={() => { me('Talk to an expert'); setLead((l) => ({ ...l, topic: 'other' })); bot('Sure — I’ll arrange a call back. May I have your name?'); setStep('name'); }}>Talk to an expert</button>
              </div>
            )}
            {m.wa && wa && (
              <a className="btn btn--sm btn--wa chat__wa" href={waLink(wa, waText)} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> Continue on WhatsApp</a>
            )}
          </div>
        ))}
        {busy && <div className="chat__msg chat__msg--bot"><div className="chat__bubble chat__typing"><span /><span /><span /></div></div>}
        <div ref={endRef} />
      </div>
      <form className="chat__input" onSubmit={onSend} noValidate>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          type={step === 'phone' ? 'tel' : step === 'email' ? 'email' : 'text'}
          inputMode={step === 'phone' ? 'tel' : undefined}
          aria-label={placeholder}
          maxLength={step === 'details' || step === 'topic' || step === 'done' ? 1000 : 120}
        />
        <button aria-label="Send" disabled={busy || !input.trim()}><Send size={17} /></button>
      </form>
      {wa && step !== 'done' && (
        <a className="chat__foot" href={waLink(wa, waText)} target="_blank" rel="noopener noreferrer"><MessageCircle size={13} /> Prefer WhatsApp? Chat with us there</a>
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
