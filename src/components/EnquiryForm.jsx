import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { api, isApiDown } from '../lib/api';
import { waLink } from '../lib/whatsapp';
import { useSite } from '../context/SiteContext';

/* Variants: who the form is for. Keeps Green Audit (institutions) and Hygiene Rating (restaurants) separate. */
const VARIANTS = {
  default: { orgLabel: 'Organisation name', segmentLabel: null, segments: [] },
  institution: {
    orgLabel: 'Institution name',
    segmentLabel: 'Type of institution',
    segments: ['School', 'College', 'University / deemed university', 'Polytechnic / ITI', 'Other educational institution'],
  },
  restaurant: {
    orgLabel: 'Restaurant / food business name',
    segmentLabel: 'Type of establishment',
    segments: ['Restaurant', 'Hotel', 'Canteen', 'Cafe', 'Quick-service / food outlet', 'Cloud kitchen', 'Bakery / sweet shop', 'Caterer', 'Food court / cafeteria', 'Other food business'],
  },
};

export const INTENTS = {
  quote: { type: 'quote', label: 'Request a Quote' },
  booking: { type: 'booking', label: 'Book an Audit' },
  expert: { type: 'consultation', label: 'Talk to Our Experts' },
  consultation: { type: 'consultation', label: 'Get a Consultation' },
};

const EMPTY = { name: '', organization: '', segment: '', phone: '', email: '', location: '', service: '', message: '', website: '', extra: {} };
// Placeholders, button and notes as written in the client's content doc
const PH = { name: 'e.g. Priya Raman', organization: 'College, restaurant or company name', phone: '98XXX XXXXX', email: 'you@organisation.com', location: 'e.g. Chennai', message: "Campus size, number of outlets or sites, and any deadline you're working to" };
const DEFAULT_SUCCESS = 'Thank you. Our team will contact you shortly to discuss your audit.';
const PRIVACY = 'We use your details only to respond to your enquiry. No spam, ever.';

/** Indian mobile: 10 digits starting 6-9, optional +91 / 91 / 0 prefix */
export const isMobile = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d);
};
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());

function validate(v, variant, cfg) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name';
  const orgLabel = cfg?.orgLabel || VARIANTS[variant].orgLabel;
  if ((cfg?.orgLabel || variant !== 'default') && v.organization.trim().length < 2) e.organization = `Please enter the ${orgLabel.toLowerCase()}`;
  if (!v.phone.trim()) e.phone = 'Please enter your mobile number';
  else if (!isMobile(v.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
  if (!isEmail(v.email)) e.email = 'Please enter a valid email address';
  if (v.location.trim().length < 2) e.location = 'Please enter your city / location';
  return e;
}

/**
 * Enquiry form – saves to MongoDB via POST /api/enquiries.
 * Props: service, serviceSlug, category, variant ('default'|'institution'|'restaurant'), intent, title, subtitle, submitLabel
 * config (from the service's page copy): { orgLabel, selects: [{ label, options, optional }], service, hideService, messagePlaceholder, success }
 */
export default function EnquiryForm({
  service = '',
  serviceSlug = '',
  category = '',
  variant = 'default',
  intent,
  type,
  title = 'Request a quote',
  subtitle,
  submitLabel,
  compact = false,
  messageLabel = 'Message',
  lockService = false,
  config,
}) {
  const cfg = config && typeof config === 'object' ? config : null;
  const { services, settings } = useSite();
  const { pathname } = useLocation();
  const v = VARIANTS[variant] || VARIANTS.default;
  const [values, setValues] = useState({ ...EMPTY, service: cfg?.service || service });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle' });
  const sending = useRef(false);
  const wa = settings.contact?.whatsapp;

  const set = (k) => (e) => {
    setValues((x) => ({ ...x, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (sending.current) return; // prevents double submission
    const errs = validate(values, variant, cfg);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = document.querySelector(`#f-${Object.keys(errs)[0]}-${variant}`);
      first?.focus();
      return;
    }
    sending.current = true;
    setStatus({ state: 'sending' });
    try {
      const chosen = services.find((s) => s.title === values.service);
      const { extra, ...rest } = values;
      // the service's own questions (type of site, number of sites…) go with the message
      const answers = (cfg?.selects || []).map((q, i) => (extra[i] ? `${q.label.replace(/\s*\(optional\)/i, '')}: ${extra[i]}` : '')).filter(Boolean);
      const res = await api('/enquiries', {
        method: 'POST',
        body: {
          ...rest,
          segment: cfg?.selects?.length ? extra[0] || '' : rest.segment,
          message: [answers.join('\n'), rest.message].filter(Boolean).join('\n\n'),
          type: type || INTENTS[intent]?.type || (values.service ? 'service' : 'general'),
          channel: 'form',
          serviceSlug: serviceSlug || chosen?.slug || '',
          category: category || chosen?.category || '',
          sourcePage: pathname,
        },
      });
      setStatus({ state: 'done', reference: res.reference, duplicate: res.duplicate });
      setValues({ ...EMPTY, service: cfg?.service || service });
    } catch (err) {
      if (err.details) {
        const map = {};
        err.details.forEach((d) => (map[d.field] = d.message));
        setErrors(map);
      }
      const c = settings.contact || {};
      const down = isApiDown(err);
      setStatus({
        state: 'error',
        message: down
          ? `We couldn't submit your enquiry right now. Please call ${c.phones?.[0] || 'us'}${c.emails?.[0] ? ` or email ${c.emails[0]}` : ''}.`
          : err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      sending.current = false;
    }
  }

  if (status.state === 'done') {
    return (
      <div className="form-card">
        <div className="success-card" role="status">
          <span className="tick-lg"><Check size={30} strokeWidth={2.5} /></span>
          <h3>{status.duplicate ? 'We already have your enquiry' : 'Enquiry received'}</h3>
          <p>
            {status.duplicate ? 'You submitted this a few minutes ago, so we haven’t created a duplicate. ' : `${cfg?.success || DEFAULT_SUCCESS} `}
            Your reference number is <code>{status.reference}</code>.
          </p>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {wa && (
              <a className="btn btn--sm btn--wa" href={waLink(wa, `Hello Aspira, my enquiry reference is ${status.reference}.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} /> Continue on WhatsApp
              </a>
            )}
            <button className="btn btn--ghost btn--sm" onClick={() => setStatus({ state: 'idle' })}>Send another enquiry</button>
          </div>
        </div>
      </div>
    );
  }

  const id = (k) => `f-${k}-${variant}`;
  const field = (k, label, props = {}, required = false) => (
    <div className={`field ${errors[k] ? 'field--error' : ''}`}>
      <label htmlFor={id(k)}>{label} {required && <span className="req">*</span>}</label>
      <input id={id(k)} name={k} value={values[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${id(k)}-err` : undefined} {...props} />
      {errors[k] && <span className="field__err" id={`${id(k)}-err`}>{errors[k]}</span>}
    </div>
  );

  return (
    <div className="form-card">
      {title && <h3>{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="form__row">
          {field('name', 'Your name', { autoComplete: 'name', placeholder: PH.name }, true)}
          {field('organization', cfg?.orgLabel || v.orgLabel, { autoComplete: 'organization', placeholder: PH.organization }, !!cfg?.orgLabel || variant !== 'default')}
        </div>
        {cfg?.selects?.length > 0 && (
          <div className={cfg.selects.length > 1 ? 'form__row' : ''}>
            {cfg.selects.map((q, i) => (
              <div className="field" key={q.label}>
                <label htmlFor={id(`x${i}`)}>{q.label}</label>
                <select id={id(`x${i}`)} value={values.extra[i] || ''} onChange={(e) => setValues((x) => ({ ...x, extra: { ...x.extra, [i]: e.target.value } }))}>
                  <option value="">Select</option>
                  {q.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
        {!cfg?.selects?.length && v.segmentLabel && (
          <div className="field">
            <label htmlFor={id('segment')}>{v.segmentLabel}</label>
            <select id={id('segment')} value={values.segment} onChange={set('segment')}>
              <option value="">Select</option>
              {v.segments.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="form__row">
          {field('phone', 'Mobile number', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: PH.phone }, true)}
          {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: PH.email }, true)}
        </div>
        <div className="form__row">
          {field('location', 'City / location', { autoComplete: 'address-level2', placeholder: PH.location }, true)}
          {cfg?.hideService ? <span /> : lockService || cfg?.service ? (
            <div className="field">
              <label htmlFor={id('service')}>Service required</label>
              <input id={id('service')} value={values.service} readOnly />
            </div>
          ) : (
            <div className="field">
              <label htmlFor={id('service')}>Service required</label>
              <select id={id('service')} value={values.service} onChange={set('service')}>
                <option value="">Select a service</option>
                {services.map((s) => <option key={s.slug} value={s.title}>{s.parentSlug ? `— ${s.title}` : s.title}</option>)}
                <option value="Other">Other / not sure</option>
              </select>
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor={id('message')}>{messageLabel}</label>
          <textarea id={id('message')} value={values.message} onChange={set('message')} rows={compact ? 2 : 3} maxLength={4000} placeholder={cfg?.messagePlaceholder || (type === 'complaint' ? '' : PH.message)} />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor={id('website')}>Website</label>
          <input id={id('website')} tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
        </div>
        {status.state === 'error' && <div className="alert alert--err" role="alert"><AlertCircle size={18} /> {status.message}</div>}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="submit" className="btn btn--green" disabled={status.state === 'sending'}>
            {status.state === 'sending' ? 'Sending…' : <>{submitLabel || (intent === 'expert' ? INTENTS.expert.label : type === 'complaint' ? 'Submit' : 'Request a quote')} <Send size={15} /></>}
          </button>
          {wa && (
            <a className="btn btn--ghost btn--sm" href={waLink(wa, `Hello Aspira, I would like to enquire about ${values.service || service || 'your audit services'}.`)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} /> WhatsApp us
            </a>
          )}
        </div>
        <p className="form__note">{PRIVACY}</p>
      </form>
    </div>
  );
}
