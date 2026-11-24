import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Phone, Mail, MapPin, ArrowRight, ArrowUp, BadgeCheck, MessageCircle, Search, Download, ExternalLink, BookOpen, FileText, Briefcase, ShieldCheck, Users, Images, ScrollText, Building2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { Icon } from '../lib/icons';
import { fileUrl } from '../lib/api';
import { waLink, waMessageFor } from '../lib/whatsapp';
import { BADGE_SRC, BrandLogo } from './ui';
import ChatWidget, { ChatLauncher } from './ChatWidget';

const tel = (p) => `tel:${String(p).replace(/[^+\d]/g, '')}`;

function SocialIcon({ name }) {
  const paths = {
    facebook: 'M14 8h3V4h-3c-2.8 0-4 1.7-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z',
    instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    linkedin: 'M4 9h4v12H4zM6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm4 6h4v1.8c.6-1 1.9-2 3.9-2 4 0 4.1 2.7 4.1 6V21h-4v-5.4c0-1.4 0-3.1-1.9-3.1s-2.1 1.5-2.1 3V21h-4z',
    twitter: 'M4 4h4.5l4 5.5L17 4h3l-6 7 7 9h-4.5l-4.4-6L7 20H4l6.6-7.6z',
    youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z',
  };
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d={paths[name]} /></svg>
  );
}

function Header() {
  const { settings, services, accreditations } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const c = settings.contact || {};
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB') || accreditations[0];
  const parents = services.filter((s) => !s.parentSlug);
  const childrenOf = (slug) => services.filter((s) => s.parentSlug === slug);
  const half = Math.ceil(parents.length / 2);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const ServiceLinks = ({ list }) =>
    list.map((s) => (
      <div key={s.slug}>
        <Link className="mega__link" to={`/services/${s.slug}`}>
          <span className="ic"><Icon name={s.icon} size={18} /></span>
          <span><strong>{s.title}</strong><span>{s.shortDescription?.slice(0, 70)}{s.shortDescription?.length > 70 ? '…' : ''}</span></span>
        </Link>
        {childrenOf(s.slug).length > 0 && (
          <div className="mega__sub">
            {childrenOf(s.slug).map((ch) => <Link key={ch.slug} to={`/services/${ch.slug}`}>{ch.title}</Link>)}
          </div>
        )}
      </div>
    ));

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="brand" aria-label={`${settings.companyName || 'Aspira Certifications'} – home`}>
            <BrandLogo src={fileUrl(settings.logo)} />
          </Link>

          <nav className="nav" aria-label="Main">
            <div className="nav__item">
              <NavLink to="/about" className="nav__trigger" aria-haspopup="true">About <ChevronDown size={15} /></NavLink>
              <div className="mega mega--sm" role="menu">
                <Link className="mega__link" to="/about"><span className="ic"><Building2 size={17} /></span><span><strong>About us</strong><span>Who we are and how we work</span></span></Link>
                <Link className="mega__link" to="/careers"><span className="ic"><Users size={17} /></span><span><strong>Careers</strong><span>Open roles and resume submission</span></span></Link>
                <Link className="mega__link" to="/gallery"><span className="ic"><Images size={17} /></span><span><strong>Gallery</strong><span>Photos from our audits and events</span></span></Link>
                <Link className="mega__link" to="/policies"><span className="ic"><ScrollText size={17} /></span><span><strong>Policies</strong><span>Impartiality, confidentiality & more</span></span></Link>
              </div>
            </div>
            <div className="nav__item">
              <NavLink to="/services" className="nav__trigger" aria-haspopup="true">
                Services <ChevronDown size={15} />
              </NavLink>
              {parents.length > 0 && (
                <div className="mega" role="menu">
                  <div className="mega__col">
                    <h6>Audits & Assessments</h6>
                    <ServiceLinks list={parents.slice(0, half)} />
                  </div>
                  <div className="mega__col">
                    <h6>&nbsp;</h6>
                    <ServiceLinks list={parents.slice(half)} />
                  </div>
                  <div className="mega__feature">
                    <BadgeCheck size={28} color="#8be09f" />
                    <h5>Not sure which audit you need?</h5>
                    <p>Tell us about your organisation and we'll recommend the right scope.</p>
                    <Link to="/contact" className="btn btn--green btn--sm">Talk to an expert <ArrowRight size={15} /></Link>
                  </div>
                </div>
              )}
            </div>
            <NavLink to="/accreditations">Accreditation</NavLink>
            <div className="nav__item">
              <button className="nav__trigger" aria-haspopup="true">Resources <ChevronDown size={15} /></button>
              <div className="mega mega--sm" role="menu">
                <Link className="mega__link" to="/blog"><span className="ic"><BookOpen size={17} /></span><span><strong>Blog</strong><span>Guides on green audits, hygiene rating & safety</span></span></Link>
                <Link className="mega__link" to="/case-studies"><span className="ic"><Briefcase size={17} /></span><span><strong>Case studies</strong><span>Verified projects completed by Aspira</span></span></Link>
                <Link className="mega__link" to="/resources"><span className="ic"><FileText size={17} /></span><span><strong>Downloads</strong><span>Accreditation certificate & documents</span></span></Link>
                <Link className="mega__link" to="/industries"><span className="ic"><Icon name="Factory" size={17} /></span><span><strong>Industries</strong><span>Who we serve</span></span></Link>
              </div>
            </div>
            <NavLink to="/certificate-status">Verify Certificate</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="header__cta">
            {nabcb && (
              <Link to="/accreditations" className="hdr-cert" title={`NABCB Accredited Inspection Body – Reg. No. ${nabcb.registrationNo}`}>
                <img src={nabcb.logo ? fileUrl(nabcb.logo) : BADGE_SRC} alt="NABCB Accredited Inspection Body, Reg. No. IB 159" width="46" height="50" />
              </Link>
            )}
            <Link to="/contact?intent=booking#enquiry" className="btn btn--green btn--sm hdr-book">Book an audit <ArrowRight size={15} /></Link>
            <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={22} /></button>
          </div>
        </div>
      </header>

      <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer__backdrop" onClick={() => setOpen(false)} />
        <div className="drawer__panel" role="dialog" aria-label="Menu">
          <div className="drawer__head">
            <BrandLogo size="sm" src={fileUrl(settings.logo)} />
            <button className="burger" style={{ display: 'grid' }} aria-label="Close menu" onClick={() => setOpen(false)}><X size={22} /></button>
          </div>
          <Link to="/certificate-status" className="drawer__verify"><ShieldCheck size={18} /> Verify a certificate <ArrowRight size={16} /></Link>
          <Link to="/">Home</Link>
          <details className="drawer__group">
            <summary>About <ChevronDown size={18} /></summary>
            <Link to="/about">About us</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/policies">Policies</Link>
          </details>
          <details className="drawer__group">
            <summary>Services <ChevronDown size={18} /></summary>
            <Link to="/services">All services</Link>
            {parents.map((s) => (
              <div key={s.slug}>
                <Link to={`/services/${s.slug}`}>{s.title}</Link>
                {childrenOf(s.slug).map((ch) => <Link key={ch.slug} className="sub" to={`/services/${ch.slug}`}>{ch.title}</Link>)}
              </div>
            ))}
          </details>
          <Link to="/accreditations">Accreditation</Link>
          <details className="drawer__group">
            <summary>Resources <ChevronDown size={18} /></summary>
            <Link to="/blog">Blog</Link>
            <Link to="/case-studies">Case studies</Link>
            <Link to="/resources">Downloads</Link>
            <Link to="/industries">Industries</Link>
          </details>
          <Link to="/certificate-status">Certificate Status</Link>
          <Link to="/complaints-and-appeals">Complaints & Appeals</Link>
          <Link to="/contact">Contact</Link>
          <div className="drawer__foot">
            <Link to="/contact?intent=booking#enquiry" className="btn btn--green">Book an audit <ArrowRight size={16} /></Link>
            {settings.contact?.whatsapp && <a href={waLink(settings.contact.whatsapp)} className="btn btn--wa" target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp us</a>}
            {c.phones?.[0] && <a href={tel(c.phones[0])} className="btn btn--ghost"><Phone size={16} /> {c.phones[0]}</a>}
          </div>
        </div>
      </div>
    </>
  );
}

function Footer() {
  const { settings, services, accreditations } = useSite();
  const c = settings.contact || {};
  const social = settings.social || {};
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const year = new Date().getFullYear();
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  return (
    <footer className="footer">
      <div className="container">
        {nabcb && (
          <div className="footer__accr-card">
            <img src={BADGE_SRC} alt="NABCB Accredited Inspection Body – Reg. No. IB 159" width="72" height="78" loading="lazy" />
            <div>
              <b>{nabcb.shortName} Accredited Type ‘A’ Inspection Body · Reg. No. {nabcb.registrationNo}</b>
              <span>Scope: green audits of educational institutions{nabcb.validUntil ? ` · Valid until ${fmt(nabcb.validUntil)}` : ''}</span>
            </div>
            <div className="footer__accr-actions">
              <Link to="/certificate-status" className="btn btn--sm btn--green"><ShieldCheck size={14} /> Verify an Aspira certificate</Link>
              <Link to="/resources" className="btn btn--sm btn--outline-light"><Download size={14} /> Certificate</Link>
              {nabcb.verifyUrl && <a href={nabcb.verifyUrl} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--outline-light"><ExternalLink size={14} /> Verify on NABCB</a>}
            </div>
          </div>
        )}
        <div className="footer__grid">
          <div className="footer__brand">
            <BrandLogo className="blogo--card" src={fileUrl(settings.logo)} />
            <p>{settings.aboutShort}</p>
            <div className="socials">
              {Object.entries(social).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noopener noreferrer" aria-label={k}><SocialIcon name={k} /></a>
              ))}
            </div>
          </div>
          <div>
            <h5>Services</h5>
            <ul>
              {services.filter((s) => !s.parentSlug).map((s) => <li key={s.slug}><Link to={`/services/${s.slug}`}>{s.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About us</Link></li>
              <li><Link to="/accreditations">Accreditation</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/policies">Policies</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/case-studies">Case studies</Link></li>
              <li><Link to="/resources">Downloads</Link></li>
              <li><Link to="/certificate-status">Certificate status</Link></li>
              <li><Link to="/complaints-and-appeals">Complaints & appeals</Link></li>
            </ul>
          </div>
          <div>
            <h5>Get in touch</h5>
            <ul className="footer__contact">
              {c.address && <li><MapPin size={15} /> <span>{c.address}</span></li>}
              {(c.phones || []).map((p) => <li key={p}><Phone size={15} /> <a href={tel(p)}>{p}</a></li>)}
              {(c.emails || []).map((e) => <li key={e}><Mail size={15} /> <a href={`mailto:${e}`}>{e}</a></li>)}
              {c.whatsapp && <li><MessageCircle size={15} /> <a href={waLink(c.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {year} {settings.legalName || 'Aspira Certifications Private Limited'}. All rights reserved.</span>
          <span>Chennai, Tamil Nadu, India</span>
        </div>
      </div>
    </footer>
  );
}

function FloatingActions() {
  const { settings, services } = useSite();
  const { pathname } = useLocation();
  const [chat, setChat] = useState(false);
  useEffect(() => {
    const openChat = () => setChat(true);
    window.addEventListener('aspira:open-chat', openChat);
    return () => window.removeEventListener('aspira:open-chat', openChat);
  }, []);
  const wa = settings.contact?.whatsapp;
  return (
    <>
      <ChatWidget open={chat} setOpen={setChat} />
      <div className={`fab ${chat ? 'fab--chat-open' : ''}`}>
        {wa && !chat && (
          <a className="fab__wa fab__wa--round" href={waLink(wa, waMessageFor(pathname, services))} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" data-testid="wa-fab">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg>
          </a>
        )}
        <ChatLauncher open={chat} setOpen={setChat} />
      </div>
    </>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) return void setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
