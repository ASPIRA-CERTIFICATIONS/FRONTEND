/**
 * Every editable website page and its built-in sections.
 * `fields` = what the admin can edit for that section. `defaults` = the current website
 * content (used until the admin saves something). Headings: wrap a word in *stars* for accent colour.
 */
const intro = (eyebrow, heading, introText, extra = {}) => ({
  key: 'intro',
  label: 'Page header',
  fields: ['eyebrow', 'heading', 'intro', ...(extra.image ? ['image', 'imageAlt'] : [])],
  defaults: (ctx) => ({ eyebrow, heading, intro: typeof introText === 'function' ? introText(ctx) : introText }),
  hideable: false,
});
const head = (key, label, eyebrow, heading, text, more = {}) => ({
  key,
  label,
  fields: ['eyebrow', 'heading', 'intro', ...(more.fields || [])],
  defaults: (ctx) => ({ eyebrow, heading, intro: text, ...(typeof more.defaults === 'function' ? more.defaults(ctx) : more.defaults || {}) }),
  itemFields: more.itemFields,
  itemLabel: more.itemLabel,
  note: more.note,
});
const cta = (title = 'Ready to get audit-ready?', text = 'Speak to our team about scope, timelines and fees. We respond to every enquiry.') => ({
  key: 'cta',
  label: 'Call-to-action band (bottom)',
  fields: ['heading', 'intro', 'buttons'],
  defaults: () => ({ heading: title, intro: text, buttons: [{ label: 'Request a quote', href: '/contact?intent=quote#enquiry' }] }),
  note: 'The phone number button is added automatically from Settings.',
});
const why = {
  key: 'why',
  label: 'Why Aspira',
  fields: ['eyebrow', 'heading', 'intro', 'items', 'buttons'],
  itemFields: ['title', 'text'],
  itemLabel: 'Reason',
  defaults: () => ({
    eyebrow: 'Why Aspira',
    heading: 'Why organisations choose Aspira',
    intro: 'Our commitments are set out in our Quality, Impartiality and Confidentiality policies, signed by our top management.',
    items: [
      { title: 'Standards-based inspections', text: 'Every audit and inspection is aligned with national and international standards and regulations.' },
      { title: 'Independent & impartial', text: 'We do not provide consultancy, training or internal audits to the clients we inspect.' },
      { title: 'Evidence-based decisions', text: 'Findings rest on objective evidence – free from commercial, financial or external influence.' },
      { title: 'Strict confidentiality', text: 'Client information is protected in line with ISO/IEC 17020 and the DPDP Act 2023.' },
      { title: 'Impartiality Committee', text: 'A dedicated committee regularly reviews and monitors impartiality risks.' },
      { title: 'Continuous improvement', text: 'Our systems, processes and resources are reviewed and improved through audits.' },
    ],
    buttons: [{ label: 'Read our policies', href: '/policies' }, { label: 'About Aspira', href: '/about' }],
  }),
};

export const CMS_PAGES = [
  {
    slug: 'home',
    label: 'Home',
    path: '/',
    sections: [
      { key: 'banner', label: 'Accreditation banner (top strip)', fields: ['body', 'buttons'], defaults: () => ({ body: 'We are a National Accreditation Board for Certification Bodies (NABCB) accredited Inspection Body (Reg No: IB 159) for green audits for educational institutions (IAF Scope 28)', buttons: [{ label: 'Verify', href: 'https://nabcb.qci.org.in/ib-159/' }] }) },
      {
        key: 'hero',
        label: 'Hero',
        fields: ['eyebrow', 'heading', 'intro', 'buttons'],
        defaults: ({ settings = {} }) => ({ eyebrow: settings.tagline || 'Audits · Inspections · Assessments', heading: settings.heroTitle || 'Audits & inspections you can rely on', intro: settings.heroSubtitle || '', buttons: [{ label: 'Book an audit', href: '/contact?intent=booking#enquiry' }] }),
        note: 'Wrap words in *stars* to show them in green (if there are no stars, the last two words are green). Background photos: Admin → Settings → Hero image.',
        hideable: false,
      },
      { key: 'commitments', label: 'Hero card – our commitments', fields: ['heading', 'items'], itemFields: ['title', 'text'], itemLabel: 'Commitment', defaults: () => ({ heading: 'Our commitments', items: [{ title: 'Impartial', text: 'No consultancy, training or internal audits for the clients we inspect.' }, { title: 'Independent', text: 'Type ‘A’ inspection body – free from commercial or financial influence.' }, { title: 'Confidential', text: 'Client information protected in line with ISO/IEC 17020.' }, { title: 'Evidence-based', text: 'Every finding rests on objective, verifiable evidence.' }] }) },
      { key: 'facts', label: 'Key facts strip', fields: ['items'], itemFields: ['title', 'text'], itemLabel: 'Fact (value + label)', defaults: ({ services = [] }) => ({ items: [{ title: String(services.length || 11), text: 'Audit & inspection services' }, { title: '8', text: 'Sectors served' }, { title: 'Type ‘A’', text: 'Independent inspection body' }, { title: 'ISO/IEC 17020', text: 'Inspection standard' }] }), note: 'Numbers count up automatically.' },
      head('about', 'About Aspira', 'About Aspira', 'Independent audits you can rely on', '', {
        fields: ['body', 'image', 'imageAlt', 'items', 'buttons'],
        itemFields: ['title', 'text'],
        itemLabel: 'Service line',
        defaults: (ctx) => ({
          body: `${((ctx.settings || {}).aboutShort || '').split('\n\n')[0]}\n\nWe are a business-to-business (B2B) company – our clients are organisations, not individual consumers.`,
          image: '',
          imageAlt: 'Aspira audit team with faculty members of an institution',
          items: ['green-audits', 'hygiene-rating-audits', 'safety-audits', 'energy-audits']
            .map((slug) => (ctx.services || []).find((x) => x.slug === slug))
            .filter(Boolean)
            .map((x) => ({ title: x.title, text: x.audience || '' })),
          buttons: [{ label: 'More about us', href: '/about' }],
        }),
        note: 'Leave the service lines empty to list Green, Hygiene, Safety and Energy audits. Leave the image empty to use the company photo.',
      }),
      head('services', 'Our services', 'Our services', 'Audit & inspection services', 'Independent, standards-based audits for institutions, food businesses, workplaces and buildings.', { fields: ['buttons'], defaults: { buttons: [{ label: 'View all services', href: '/services' }] }, note: 'Service cards come from Admin → Services.' }),
      why,
      head('enquiry', 'Enquiry form', 'Get started', 'Tell us what you need', "Share a few details about your organisation and the audit or inspection you need – we'll confirm the scope, standards and timeline."),
      head('sectors', 'Who we serve', 'Who we serve', 'Sectors we work with', 'Independent audits and inspections for organisations across these sectors.', { fields: ['items'], itemFields: ['title'], itemLabel: 'Sector', defaults: { items: ['Educational institutions', 'Restaurants & food businesses', 'Hotels & hospitality', 'Builders & contractors', 'Factories & industries', 'Commercial buildings', 'Warehouses & logistics', 'Offices & workplaces'].map((title) => ({ title })) } }),
      head('gallery', 'Gallery preview', 'Gallery', 'From our audits', 'Real photos from our on-site inspection audits.', { fields: ['buttons'], defaults: { buttons: [{ label: 'View full gallery', href: '/gallery' }] } }),
      head('process', 'How it works', 'How it works', 'From enquiry to report', 'A clear, documented process for every audit and inspection.', { fields: ['items'], itemFields: ['title', 'text'], itemLabel: 'Step', defaults: ({ settings = {} }) => ({ items: (settings.process || []).slice(0, 6).map((p) => ({ title: p.title, text: p.description })) }) }),
      head('testimonials', 'Client testimonials', 'Client testimonials', 'What our clients say', 'Organisations we have audited share their experience of working with Aspira.', { fields: ['buttons'], defaults: { buttons: [{ label: 'Read all testimonials', href: '/testimonials' }] } }),
      head('insights', 'Insights (latest articles)', 'Insights', 'Guides from our auditors', '', { note: 'Shown when blog posts are published.' }),
      head('faq', 'FAQ', 'FAQ', 'Frequently asked questions', '', { fields: ['items'], itemFields: ['title', 'text'], itemLabel: 'Question & answer', note: 'Leave the questions empty to show FAQs from the Green, Hygiene and Safety service pages.' }),
      cta('Planning an audit or inspection?', "Tell us about your organisation and we'll confirm the scope, standards and timeline."),
    ],
  },
  {
    slug: 'about',
    label: 'About us',
    path: '/about',
    sections: [
      { ...intro('About Aspira', 'Aspiring to improve the *quality of lives*', ({ settings = {} }) => settings.aboutShort || '', { image: true }), note: 'Leave the image empty to use the company photo (or Settings → About image).' },
      { key: 'story', label: 'Our story', fields: ['eyebrow', 'heading', 'body'], defaults: ({ settings = {} }) => ({ eyebrow: 'Our story', heading: 'Impartial. Transparent. *Technically sound.*', body: settings.aboutLong || '' }) },
      head('field', 'In the field (photos)', 'In the field', 'Our on-site *inspection audits*', '', { fields: ['buttons'], defaults: { buttons: [{ label: 'View our gallery', href: '/gallery' }] } }),
      { key: 'vision', label: 'Vision & mission', fields: ['items'], itemFields: ['title', 'text'], itemLabel: 'Card', defaults: ({ settings = {} }) => ({ items: [{ title: 'Our vision', text: settings.vision || '' }, { title: 'Our mission', text: settings.mission || '' }] }) },
      { key: 'values', label: 'Our values', fields: ['eyebrow', 'heading', 'items'], itemFields: ['title', 'text'], itemLabel: 'Value', defaults: ({ settings = {} }) => ({ eyebrow: 'Our values', heading: 'What guides every audit', items: (settings.values || []).map((v) => ({ title: v.title, text: v.description })) }) },
      { key: 'pillars', label: 'Our focus (People · Processes · Planet)', fields: ['eyebrow', 'heading', 'items'], itemFields: ['title', 'text'], itemLabel: 'Pillar', defaults: ({ settings = {} }) => ({ eyebrow: 'Our focus', heading: 'People. Processes. *Planet.*', items: (settings.pillars || []).map((v) => ({ title: v.title, text: v.description })) }) },
      why,
      cta(),
    ],
  },
  { slug: 'services', label: 'Services (list)', path: '/services', sections: [intro('Services', 'Audit & *inspection* services', 'We check whether institutions, restaurants and businesses follow the required environmental, hygiene and safety standards — with a clear report and practical recommendations.'), cta()] },
  {
    slug: 'service',
    label: 'Service detail pages',
    path: '/services/:slug',
    template: true,
    sections: [['overview', 'Overview'], ['services', 'Sub-services'], ['benefits', 'Benefits'], ['scope', 'Scope of audit'], ['standards', 'Standards'], ['fees', 'Fees table'], ['process', 'Process / flowchart'], ['photos', 'Our audit photos'], ['enquire', 'Why us + enquiry form'], ['faq', 'FAQs'], ['related', 'Related services & testimonials']]
      .map(([key, label]) => ({ key, label, fields: [], note: 'The text of this section is edited in Admin → Services. Here you can hide it or add new sections after it.' }))
      .concat([cta()]),
  },
  { slug: 'accreditations', label: 'Accreditation', path: '/accreditations', sections: [intro('Accreditation', 'Accreditations & *recognitions*', 'Accreditations are a mark of credibility, impartiality, and adherence to international standards. Our accredited audits give you confidence that processes are rigorously evaluated, reliable, and globally recognised.'), { key: 'nabcb', label: 'NABCB accreditation', fields: [], note: 'Details come from Admin → Accreditations.' }, { key: 'qci', label: 'QCI recognition', fields: [], note: 'Details come from Admin → Accreditations.' }, head('standards', 'Standards', 'Standards', 'The standards behind *our audits*', '', { fields: ['items'], itemFields: ['title', 'text'], itemLabel: 'Standard', defaults: { items: [{ title: 'ISO/IEC 17020:2012', text: 'Conformity assessment requirements for inspection bodies – competence, impartiality and consistency in our inspection processes.' }, { title: 'FSSAI Hygiene Rating Scheme', text: 'Hygiene rating audits of food establishments against Schedule 4 of the FSS (Licensing & Registration of Food Businesses) Regulations.' }, { title: 'NBC 2016 Part 11', text: 'Green audits of educational institutions against the National Building Code of India 2016, Part 11 – Approach to Sustainability, as per NAAC advisory.' }] } }), cta('Planning an audit or inspection?', 'Speak to our team about scope, timelines and fees. We respond to every enquiry.')] },
  { slug: 'gallery', label: 'Gallery', path: '/gallery', sections: [intro('Gallery', 'Our work in pictures', 'Real photos from our on-site inspection audits.')] },
  { slug: 'careers', label: 'Careers', path: '/careers', sections: [intro('Careers', 'Work with Aspira Certifications', "We are an independent, NABCB-accredited inspection body based in Chennai. If you'd like to be part of our team, see our current openings or send us your resume.")] },
  { slug: 'policies', label: 'Policies', path: '/policies', sections: [intro('Policies', 'Our policies', 'How we work as an independent inspection body – and how we treat the information you share with us.')] },
  { slug: 'testimonials', label: 'Testimonials', path: '/testimonials', sections: [intro('Client testimonials', 'What our clients *say*', 'At Aspira Certifications, audits are conducted with a strong focus on credibility, rigor, and value. Our work supports organizations in strengthening compliance, improving systems, and advancing quality, safety, and sustainability practices. Here’s what organizations say about their experience working with us.'), cta()] },
  { slug: 'contact', label: 'Contact', path: '/contact', sections: [intro('Contact', "Let's talk about your *audit*", 'Request a quote or speak to our experts — we respond to every enquiry.')] },
  {
    slug: 'complaints',
    label: 'Complaints & appeals',
    path: '/complaints-and-appeals',
    sections: [
      intro('Impartiality', 'Complaints & *appeals*', 'Every complaint and appeal is acknowledged, recorded and handled impartially under our documented procedure.'),
      { key: 'procedure', label: 'Complaints procedure', fields: ['eyebrow', 'heading', 'items'], itemFields: ['title', 'text'], itemLabel: 'Step', defaults: () => ({ eyebrow: 'Complaints procedure', heading: 'How we handle your complaint', items: [{ title: 'Submit', text: 'Email us. Verbal complaints made in person or by phone are documented within 24 hours.' }, { title: 'Acknowledge & record', text: 'Each submission is acknowledged and logged under our documented procedure.' }, { title: 'Review', text: 'The Quality Manager checks relevance, gathers information and handles the matter impartially. Anyone involved in the original inspection or decision is excluded. Complaints about auditor conduct are reviewed independently.' }, { title: 'Resolve', text: 'We aim to resolve cases within 15 working days of receipt. If more time is needed, you will be kept informed. The final decision is communicated formally.' }, { title: 'Escalate', text: 'If you are still unsatisfied, you can escalate to the Managing Director, whose decision is final.' }] }), note: 'The complaint email addresses are added to the first step automatically from Settings.' },
      { key: 'appeals', label: 'Hygiene rating appeals', fields: ['eyebrow', 'heading', 'items'], itemFields: ['title'], itemLabel: 'Point', defaults: () => ({ eyebrow: 'Hygiene rating appeals', heading: 'Hygiene Rating Audit appeals', items: ['Appeals can be submitted in writing or online by the FBO or applicant, and each receives a unique reference number.', 'If we cannot resolve the appeal within 15 days, it is referred to the Quality Council of India (QCI).', 'If the matter remains unresolved or unsatisfactory, the appellant can escalate to FSSAI within 15 days of the QCI decision.', 'The process follows QCI–PADD guidelines.'].map((title) => ({ title })) }) },
      { key: 'form', label: 'Complaint form', fields: ['heading', 'intro'], defaults: () => ({ heading: 'Submit a complaint or appeal', intro: 'This creates a recorded submission with a reference number.' }) },
    ],
  },
  {
    slug: 'certificate-status',
    label: 'Certificate status',
    path: '/certificate-status',
    sections: [
      intro('Certificate status', 'Check the status of an *Aspira certificate*', 'Fill in the details below exactly as printed on the certificate. Our team will verify the certificate and confirm its status to you by email.'),
      { key: 'howto', label: 'How it works (card)', fields: ['heading', 'items'], itemFields: ['title', 'text'], itemLabel: 'Step', defaults: () => ({ heading: 'How it works', items: [{ title: 'Enter the details', text: 'Your name, email and the certificate number exactly as printed on the certificate.' }, { title: 'We verify it', text: 'Our team checks the certificate against our records.' }, { title: 'You hear back', text: 'We confirm by email whether Aspira issued it and its current status.' }] }) },
      { key: 'form', label: 'Certificate status form', fields: ['heading', 'intro'], defaults: () => ({ heading: 'Certificate status', intro: 'Fields marked * are required.' }) },
    ],
  },
  { slug: 'resources', label: 'Insights & guides', path: '/resources', sections: [intro('Insights & guides', 'Learning resources *for audits*', 'Technical guides, checklists and reference material to help you prepare for green, hygiene and safety audits.'), cta()] },
  { slug: 'blog', label: 'Blog', path: '/blog', sections: [intro('Insights', 'Guides for institutions & *food businesses*', 'Practical articles on green audits, hygiene rating, accreditation and safety — written by the Aspira team.'), cta()] },
];

export const CUSTOM_LAYOUTS = [
  ['text', 'Text', 'Heading and paragraphs'],
  ['text-image', 'Text + image (image right)', 'Paragraphs with a photo on the right'],
  ['image-text', 'Image + text (image left)', 'Paragraphs with a photo on the left'],
  ['cards', 'Cards', 'A grid of cards – title, text, optional image and link'],
  ['list', 'Checklist', 'Points with green ticks'],
  ['faq', 'FAQ', 'Questions and answers'],
  ['gallery', 'Photo gallery', 'A grid of photos'],
  ['cta', 'Call to action', 'Dark band with heading and buttons'],
  ['quote', 'Quote', 'A highlighted quote with name'],
];
