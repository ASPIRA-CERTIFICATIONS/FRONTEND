import { useMemo, useState } from 'react';
import { useSite } from '../context/SiteContext';
import Seo, { breadcrumbSchema } from '../components/Seo';
import { PageHero, Reveal, Seal } from '../components/ui';
import { ServiceCard, ProcessSteps, CtaBand, CustomerTable } from '../components/Sections';

export default function Services() {
  const { services, accreditations } = useSite();
  const [cat, setCat] = useState('All');
  const nabcb = accreditations.find((a) => a.shortName === 'NABCB');
  const cats = useMemo(() => ['All', ...new Set(services.map((s) => s.category).filter(Boolean))], [services]);
  const list = services.filter((s) => cat === 'All' || s.category === cat);

  return (
    <>
      <Seo
        title="Audit & Inspection Services"
        description="Green audits, FSSAI hygiene rating audits, workplace, construction, fire, electrical and warehouse safety audits, energy and water audits and green building assessments."
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }])}
      />
      <PageHero
        crumbs={[{ label: 'Services' }]}
        pageKey="services"
        image="https://images.unsplash.com/photo-1742112125567-3e8967bad60f?auto=format&fit=crop&w=1600&q=70"
        eyebrow="Services"
        title={<>Audit, inspection & <em className="accent">certification</em> services</>}
        intro="We check whether institutions, restaurants and businesses follow the required environmental, hygiene and safety standards — with a clear report and practical recommendations."
        side={nabcb && <Seal reg={nabcb.registrationNo} top={`${nabcb.shortName} ACCREDITED INSPECTION BODY`} size={150} />}
      />
      <section className="section">
        <div className="container">
          <div className="filter-tabs" role="group" aria-label="Filter services by category">
            {cats.map((c) => (
              <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          {list.length ? (
            <div className="services-grid">{list.map((s, i) => <ServiceCard key={s.slug} s={s} i={i} />)}</div>
          ) : (
            <div className="empty">No services in this category yet.</div>
          )}
        </div>
      </section>
      <section className="section section--white">
        <div className="container">
          <Reveal className="section-head section-head--center"><div><span className="eyebrow">Target customers</span><h2>Who each service is for</h2></div></Reveal>
          <CustomerTable />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <div><span className="eyebrow">§ Our process</span><h2>How an Aspira audit works</h2></div>
          </Reveal>
          <ProcessSteps white />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
