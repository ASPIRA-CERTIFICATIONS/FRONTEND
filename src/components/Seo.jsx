import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { SITE_URL } from '../lib/api';

const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`);

/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter, JSON-LD.
 * `jsonLd` may be an object or an array of schema.org objects.
 */
export default function Seo({ title, description, image, type = 'website', noindex = false, jsonLd, path }) {
  const { settings } = useSite();
  const { pathname } = useLocation();
  const seo = settings.seo || {};
  const company = settings.companyName || 'Aspira Certifications';
  const fullTitle = title
    ? (seo.titleTemplate || `%s | ${company}`).replace('%s', title)
    : seo.defaultTitle || `${company} – Green, Hygiene & Safety Audits`;
  const desc = description || seo.defaultDescription || '';
  const canonical = `${SITE_URL}${path ?? pathname}`.replace(/(?<!:)\/+$/, '') || SITE_URL;
  const ogImage = abs(image || seo.ogImage || '/brand/og-image.png');
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={canonical || SITE_URL + '/'} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:site_name" content={company} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImage} />
      {ld.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}

/* ----- schema.org helpers ----- */
export function orgSchema(settings, accreditations = []) {
  const c = settings.contact || {};
  const social = Object.values(settings.social || {}).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: settings.legalName || settings.companyName || 'Aspira Certifications Private Limited',
    alternateName: settings.companyName,
    url: SITE_URL + '/',
    logo: abs(settings.logo || '/brand/aspira-logo.png'),
    image: abs(settings.seo?.ogImage || '/brand/og-image.png'),
    description: settings.seo?.defaultDescription,
    email: c.emails?.[0],
    telephone: c.phones?.[0],
    address: c.address ? { '@type': 'PostalAddress', streetAddress: c.address, addressLocality: 'Chennai', addressRegion: 'Tamil Nadu', postalCode: '600041', addressCountry: 'IN' } : undefined,
    areaServed: 'IN',
    sameAs: social.length ? social : undefined,
    hasCredential: accreditations
      .filter((a) => a.registrationNo)
      .map((a) => ({
        '@type': 'EducationalOccupationalCredential',
        name: a.title,
        credentialCategory: 'Accreditation',
        identifier: a.registrationNo,
        recognizedBy: { '@type': 'Organization', name: a.body },
      })),
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function faqSchema(faqs = []) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };
}

export function serviceSchema(s) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    serviceType: s.title,
    description: s.seo?.description || s.shortDescription,
    url: `${SITE_URL}/services/${s.slug}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'India' },
    ...(s.image ? { image: abs(s.image) } : {}),
  };
}
