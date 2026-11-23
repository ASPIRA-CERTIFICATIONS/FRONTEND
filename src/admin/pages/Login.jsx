import { useState } from 'react';
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, Inbox, Layers, ShieldCheck, Phone, ArrowLeft, BadgeCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../AdminApp';
import { useSite } from '../../context/SiteContext';
import { BrandLogo, DEFAULT_HERO_IMG } from '../../components/ui';

const FEATURES = [
  [Inbox, 'Never miss a lead', 'Website, chat and WhatsApp enquiries with live notifications.'],
  [Layers, 'Publish without code', 'Services, blogs, downloads and page images in a few clicks.'],
  [ShieldCheck, 'Credentials in one place', 'Accreditation details and verifiable certificates.'],
];
// Verified facts only (from the NABCB accreditation certificate)
const FACTS = [
  ['IB 159', 'NABCB registration no.'],
  ['Type ‘A’', 'Inspection body'],
  ['ISO/IEC 17020', 'Accreditation standard'],
];

export default function Login() {
  const { login } = useAuth();
  const { settings } = useSite();
  const phone = settings.contact?.phones?.[0];
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const d = await api('/auth/login', { method: 'POST', body: f });
      login(d.token, d.admin);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lg">
      <header className="lg__bar">
        <a href="/" aria-label="Aspira Certifications – website"><BrandLogo size="sm" /></a>
        <div className="lg__bar-right">
          {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="lg__help"><Phone size={16} /> <span>Need help?</span> <b>{phone}</b></a>}
          <a href="/" className="lg__back"><ArrowLeft size={16} /> Back to website</a>
        </div>
      </header>

      <div className="lg__main">
        <aside className="lg__art" style={{ backgroundImage: `url(${DEFAULT_HERO_IMG.replace(/w=\d+/, 'w=1400')})` }}>
          <div className="lg__art-in">
            <span className="lg__pill"><BadgeCheck size={16} /> NABCB accredited inspection body</span>
            <div className="lg__copy">
              <span className="lg__kicker">For the Aspira team</span>
              <h2>Manage audits, leads &amp; content in one place</h2>
              <p>Respond to enquiries faster, keep services and blogs up to date, and publish accreditation details the whole website relies on.</p>
              <ul className="lg__feats">
                {FEATURES.map(([Ic, t, d]) => (
                  <li key={t}><span className="lg__feat-ic"><Ic size={18} /></span><span><b>{t}</b>{d}</span></li>
                ))}
              </ul>
              <div className="lg__facts">
                {FACTS.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg__side">
          <form onSubmit={submit} className="lg__card">
            <div className="lg__head">
              <h1>Admin sign in</h1>
              <p>Use your Aspira admin account to continue.</p>
            </div>
            <div className="f">
              <label htmlFor="em">Email address</label>
              <div className="inp-ic">
                <Mail size={17} />
                <input id="em" className="inp" type="email" autoComplete="username" placeholder="you@aspiracertifications.com" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              </div>
            </div>
            <div className="f">
              <label htmlFor="pw">Password</label>
              <div className="inp-ic">
                <Lock size={17} />
                <input id="pw" className="inp" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                <button type="button" className="inp-ic__btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </div>
            {err && <div className="alert alert--err" role="alert"><AlertCircle size={18} /> {err}</div>}
            <button className="btn login__submit" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <LogIn size={16} /></>}</button>
            <div className="lg__secure"><ShieldCheck size={15} /> Authorised Aspira staff only. Forgot your password? Ask your administrator to reset it.</div>
          </form>
          <p className="lg__copy-foot">© {new Date().getFullYear()} Aspira Certifications Private Limited</p>
        </main>
      </div>
    </div>
  );
}
