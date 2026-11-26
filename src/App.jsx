import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="accreditations" element={<Accreditations />} />
            <Route path="industries" element={<Navigate to="/services" replace />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="contact" element={<Contact />} />
            {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
              <Route key={from} path={from.slice(1)} element={<Navigate to={to} replace />} />
            ))}
            <Route path="certificate-status" element={<CertificateStatus />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="case-studies" element={<CaseStudies />} />
            <Route path="case-studies/:slug" element={<CaseStudy />} />
            <Route path="resources" element={<Resources />} />
            <Route path="downloads" element={<Resources />} />
            <Route path="complaints-and-appeals" element={<Complaints />} />
            <Route path="careers" element={<Careers />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="policies" element={<Policies />} />
            <Route path="policies/:slug" element={<PolicyDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </SiteProvider>
  );
}
