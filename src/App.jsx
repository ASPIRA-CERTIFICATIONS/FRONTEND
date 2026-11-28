import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CmsPage } from './components/Cms';
import { LEGACY_REDIRECTS } from './lib/legacy';
import { SiteProvider } from './context/SiteContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import { Loader } from './components/ui';

const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const info = () => import('./pages/InfoPages');
const About = lazy(() => info().then((m) => ({ default: m.About })));
const Accreditations = lazy(() => info().then((m) => ({ default: m.Accreditations })));
const Contact = lazy(() => info().then((m) => ({ default: m.Contact })));
const CertificateStatus = lazy(() => info().then((m) => ({ default: m.CertificateStatus })));
const Complaints = lazy(() => info().then((m) => ({ default: m.Complaints })));
const NotFound = lazy(() => info().then((m) => ({ default: m.NotFoundPage })));
const pubPages = () => import('./pages/Publishing');
const Blog = lazy(() => pubPages().then((m) => ({ default: m.Blog })));
const BlogPost = lazy(() => pubPages().then((m) => ({ default: m.BlogPost })));
const CaseStudies = lazy(() => pubPages().then((m) => ({ default: m.CaseStudies })));
const CaseStudy = lazy(() => pubPages().then((m) => ({ default: m.CaseStudy })));
const Resources = lazy(() => pubPages().then((m) => ({ default: m.Resources })));
const company = () => import('./pages/Company');
const Careers = lazy(() => company().then((m) => ({ default: m.Careers })));
const Gallery = lazy(() => company().then((m) => ({ default: m.Gallery })));
const Policies = lazy(() => company().then((m) => ({ default: m.Policies })));
const PolicyDetail = lazy(() => company().then((m) => ({ default: m.PolicyDetail })));
const TestimonialsPage = lazy(() => import('./pages/Testimonials'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <SiteProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route element={<Layout />}>
            <Route index element={<CmsPage slug="home"><Home /></CmsPage>} />
            <Route path="about" element={<CmsPage slug="about"><About /></CmsPage>} />
            <Route path="services" element={<CmsPage slug="services"><Services /></CmsPage>} />
            <Route path="services/:slug" element={<CmsPage slug={(p) => `service-${p.slug}`}><ServiceDetail /></CmsPage>} />
            <Route path="accreditations" element={<CmsPage slug="accreditations"><Accreditations /></CmsPage>} />
            <Route path="industries" element={<Navigate to="/services" replace />} />
            <Route path="testimonials" element={<CmsPage slug="testimonials"><TestimonialsPage /></CmsPage>} />
            <Route path="contact" element={<CmsPage slug="contact"><Contact /></CmsPage>} />
            {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
              <Route key={from} path={from.slice(1)} element={<Navigate to={to} replace />} />
            ))}
            <Route path="certificate-status" element={<CmsPage slug="certificate-status"><CertificateStatus /></CmsPage>} />
            <Route path="blog" element={<CmsPage slug="blog"><Blog /></CmsPage>} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="case-studies" element={<CaseStudies />} />
            <Route path="case-studies/:slug" element={<CaseStudy />} />
            <Route path="resources" element={<CmsPage slug="resources"><Resources /></CmsPage>} />
            <Route path="downloads" element={<CmsPage slug="resources"><Resources /></CmsPage>} />
            <Route path="complaints-and-appeals" element={<CmsPage slug="complaints"><Complaints /></CmsPage>} />
            <Route path="careers" element={<CmsPage slug="careers"><Careers /></CmsPage>} />
            <Route path="gallery" element={<CmsPage slug="gallery"><Gallery /></CmsPage>} />
            <Route path="policies" element={<CmsPage slug="policies"><Policies /></CmsPage>} />
            <Route path="policies/:slug" element={<PolicyDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </SiteProvider>
  );
}
