import { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Inbox, Layers, MessageSquareQuote, Building, Award, FileBadge, Image, Settings, LogOut, Menu, ExternalLink, MessagesSquare, Newspaper, Briefcase, FileDown, UserRound, Images, ScrollText } from 'lucide-react';
import { api, getToken, setToken } from '../lib/api';
import Seo from '../components/Seo';
import { Loader, BrandLogo } from '../components/ui';
import { ToastProvider } from './fields';
import { useNewEnquiries, NotificationBell } from './Notifications';
import Dashboard from './pages/Dashboard';
import Enquiries from './pages/Enquiries';
import { ServicesList, ServiceEditor } from './pages/Services';
import { Testimonials, Clients, AccreditationsAdmin, Certificates, Posts, CaseStudiesAdmin, ResourcesAdmin, GalleryAdmin, PoliciesAdmin } from './pages/Collections';
import CareersAdmin from './pages/Careers';
import MediaLibrary from './pages/Media';
import SettingsPage from './pages/Settings';
import Account from './pages/Account';
import Login from './pages/Login';
import './admin.css';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const NAV = [
  ['Leads', [['', 'Dashboard', LayoutDashboard, true], ['enquiries', 'All enquiries', Inbox], ['enquiries?channel=chat', 'Chat enquiries', MessagesSquare], ['careers', 'Careers', UserRound]]],
  ['Content', [['services', 'Services', Layers], ['posts', 'Blog', Newspaper], ['case-studies', 'Case studies', Briefcase], ['resources', 'Downloads', FileDown], ['testimonials', 'Testimonials', MessageSquareQuote], ['clients', 'Client logos', Building], ['gallery', 'Gallery', Images], ['policies', 'Policies', ScrollText]]],
  ['Credentials', [['accreditations', 'Accreditation', Award], ['certificates', 'Issued certificates', FileBadge]]],
  ['Site', [['media', 'Media library', Image], ['settings', 'Site settings', Settings]]],
];

const TITLES = { '': 'Dashboard', enquiries: 'Enquiries', posts: 'Blog', 'case-studies': 'Case studies', resources: 'Downloadable resources', services: 'Services', testimonials: 'Testimonials', clients: 'Client logos', accreditations: 'Accreditations', certificates: 'Certificates', media: 'Media library', careers: 'Careers', gallery: 'Gallery', policies: 'Policies', settings: 'Site settings', account: 'Account' };

/** Active-state aware of the query string, so "All enquiries" and "Chat enquiries" don't both light up. */
function SideLink({ to, end, icon: Ic, label, badge }) {
  const { pathname, search } = useLocation();
  const [path, query = ''] = to.split('?');
  const full = `/admin/${path}`.replace(/\/$/, '');
  const here = pathname.replace(/\/$/, '');
  const pathOk = end ? here === full : here === full || here.startsWith(`${full}/`);
  const params = new URLSearchParams(search);
  const wanted = new URLSearchParams(query);
  const queryOk = query ? [...wanted].every(([k, v]) => params.get(k) === v) : !params.get('channel');
  const active = pathOk && queryOk;
  return (
    <Link to={`/admin/${to}`} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
      <Ic size={16} strokeWidth={2} /> <span>{label}</span>{badge > 0 && <em className="adm-side__badge">{badge > 99 ? '99+' : badge}</em>}
    </Link>
  );
}

const initials = (n = '') => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A';

function Shell({ children }) {
  const { admin, logout } = useAuth();
  const feed = useNewEnquiries();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const seg = pathname.replace(/^\/admin\/?/, '').split('/')[0];
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <div className="adm">
      <aside className={`adm-side ${open ? 'open' : ''}`}>
        <div className="adm-side__brand">
          <BrandLogo size="sm" />
          <span className="adm-side__tag">Admin</span>
        </div>
        <nav className="adm-side__nav" aria-label="Admin">
          {NAV.map(([group, items]) => (
            <div key={group} className="adm-side__group">
              <h6>{group}</h6>
              {items.map(([to, label, Ic, end]) => <SideLink key={to} to={to} end={end} icon={Ic} label={label} badge={to === 'enquiries' ? feed.total : to === 'careers' ? feed.appsNew : 0} />)}
            </div>
          ))}
        </nav>
        <div className="adm-side__foot">
          <Link to="/admin/account" className="adm-user" title="Account settings">
            <span className="adm-user__av">{initials(admin?.name)}</span>
            <span className="adm-user__txt"><b>{admin?.name}</b><small>{admin?.email}</small></span>
          </Link>
          <button type="button" className="adm-user__out" onClick={logout} title="Log out" aria-label="Log out"><LogOut size={17} /></button>
        </div>
      </aside>
      <div className="adm-main">
        <div className="adm-top">
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
            <button className="iconbtn adm-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu"><Menu size={18} /></button>
            <div>
              <div className="adm-crumb">Admin <span>/</span> {TITLES[seg] ?? 'Admin'}</div>
              <h1>{TITLES[seg] ?? 'Admin'}</h1>
            </div>
          </div>
          <div className="who">
            <NotificationBell feed={feed} />
            <a href="/" target="_blank" rel="noopener noreferrer" className="adm-top__site"><ExternalLink size={15} /> View website</a>
            <Link to="/admin/account" className="adm-user__av adm-user__av--sm" title={admin?.email}>{initials(admin?.name)}</Link>
          </div>
        </div>
        <div className="adm-body">{children}</div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [state, setState] = useState({ admin: null, checking: true });
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) return setState({ admin: null, checking: false });
    api('/auth/me', { auth: true })
      .then((d) => setState({ admin: d.admin, checking: false }))
      .catch(() => setState({ admin: null, checking: false }));
  }, []);

  useEffect(() => {
    const onLogout = () => setState({ admin: null, checking: false });
    window.addEventListener('aspira:logout', onLogout);
    return () => window.removeEventListener('aspira:logout', onLogout);
  }, []);

  const value = {
    admin: state.admin,
    login: (token, admin) => (setToken(token), setState({ admin, checking: false })),
    logout: () => (setToken(null), setState({ admin: null, checking: false }), navigate('/admin/login')),
  };

  if (state.checking) return <Loader />;

  return (
    <AuthCtx.Provider value={value}>
      <ToastProvider>
        <Seo title="Admin" noindex />
        <Routes>
          <Route path="login" element={state.admin ? <Navigate to="/admin" replace /> : <Login />} />
          <Route
            path="*"
            element={
              state.admin ? (
                <Shell>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="enquiries" element={<Enquiries />} />
                    <Route path="services" element={<ServicesList />} />
                    <Route path="services/new" element={<ServiceEditor />} />
                    <Route path="services/:id" element={<ServiceEditor />} />
                    <Route path="testimonials" element={<Testimonials />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="case-studies" element={<CaseStudiesAdmin />} />
                    <Route path="resources" element={<ResourcesAdmin />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="accreditations" element={<AccreditationsAdmin />} />
                    <Route path="certificates" element={<Certificates />} />
                    <Route path="media" element={<MediaLibrary />} />
                    <Route path="careers" element={<CareersAdmin />} />
                    <Route path="gallery" element={<GalleryAdmin />} />
                    <Route path="policies" element={<PoliciesAdmin />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="account" element={<Account />} />
                    <Route path="*" element={<p>Page not found. <Link to="/admin">Back to dashboard</Link></p>} />
                  </Routes>
                </Shell>
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />
        </Routes>
      </ToastProvider>
    </AuthCtx.Provider>
  );
}
