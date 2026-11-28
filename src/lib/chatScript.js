/**
 * Spira – Aspira's audit assistant. Wording from the client's content doc ("Chatbot Texts").
 * Each branch is a list of steps: a question with answer buttons, an optional reply per answer
 * (or one reply for all answers), then a summary card and the shared contact capture.
 */
export const SPIRA = {
  name: 'Spira',
  tagline: "Aspira's audit assistant",
  opening: "Hi, I'm Spira 👋 Tell me what you're looking into, and I'll share what's worth knowing before you book an audit.",
  talkToPerson: 'Talk to a person',
  contactIntro: "I'll send your summary to our team so they can reply with the right details.",
  closing: (name) => `Thank you, ${name}! Your summary is with our team, and they'll be in touch soon.`,
  readMore: 'Meanwhile, you can read more about',
};

export const BRANCHES = [
  {
    key: 'green',
    label: 'Green audit for a college or university',
    service: 'Green Audits',
    slug: 'green-audits',
    steps: [
      {
        id: 'goal',
        q: "What's the green audit for?",
        options: [
          ['NAAC accreditation', 'NAAC looks closely at a campus\'s environmental practices. A green audit from an NABCB-accredited inspection body, like Aspira (IB 159), carries real weight in your submission.'],
          ['Rankings', 'NIRF, QS, Times Higher Education and UI GreenMetric reward measured data on energy, water and waste, not just policies. An audit gives you that evidence.'],
          ['Our own sustainability goals', 'A first audit sets your baseline, so every improvement after that can be measured year on year.'],
          ['Not sure yet', 'Most colleges start for NAAC and then reuse the findings for rankings and reports, so one audit can serve several goals.'],
        ],
      },
      {
        id: 'areas',
        q: 'Which areas matter most to you?',
        options: [['Energy'], ['Water'], ['Waste'], ['Green cover & biodiversity'], ['All of them']],
        reply: "A full green audit covers energy, water, waste, air quality, green cover and campus hygiene, so whatever your focus, it's included.",
      },
      { id: 'campuses', q: 'How many campuses should the audit cover?', options: [['One'], ['Two or three'], ['More than three']] },
    ],
    summary: (a) => `Your green audit: for ${a.goal === 'Not sure yet' ? 'a goal still to be decided' : lc(a.goal)}, covering ${a.areas === 'All of them' ? 'energy, water and waste' : lc(a.areas)} across ${lc(a.campuses)} campus${a.campuses === 'One' ? '' : 'es'}. Next step: our team shares the scope and a quote.`,
  },
  {
    key: 'hygiene',
    label: 'FSSAI hygiene rating',
    service: 'Hygiene Rating Audits',
    slug: 'hygiene-rating-audits',
    steps: [
      {
        id: 'business',
        q: 'What kind of food business do you run?',
        options: [['Restaurant or hotel'], ['Cafeteria or canteen'], ['Bakery or sweet shop'], ['Cloud kitchen'], ['Catering'], ['Other']],
        reply: "Your hygiene rating appears as 1 to 5 smileys on a QR-coded certificate. Customers can scan it, so it's often the first thing they notice.",
      },
      {
        id: 'portal',
        q: "Have you applied on FSSAI's hygiene rating portal yet?",
        options: [
          ['Yes', 'Great. Once you select Aspira as your audit agency on the portal, we assign an auditor and arrange the visit.'],
          ['Not yet', "You apply on FSSAI's hygiene rating portal and choose your audit agency there. Aspira is a QCI-recognised Hygiene Rating Audit Agency, so you'll find us listed."],
          ['Not sure how', "It's simple: you register on the portal, apply for a hygiene rating and select an agency. Our team can walk you through it."],
        ],
      },
      {
        id: 'handlers',
        q: 'How many food handlers work there?',
        options: [['1 to 50'], ['51 to 100'], ['More than 100']],
        reply: "The audit looks at food handling, storage, cleaning, pest control and staff hygiene, including food handlers' training and medical fitness records.",
      },
    ],
    summary: (a) => `Your hygiene rating audit: ${lc(a.business)} with ${lc(a.handlers)} food handlers, portal application ${{ Yes: 'done', 'Not yet': 'not started yet', 'Not sure how': 'needs guidance' }[a.portal] || lc(a.portal)}. Next step: our team guides you on the portal and schedules the audit.`,
  },
  {
    key: 'safety',
    label: 'Safety audit',
    service: 'Safety Audits',
    slug: 'safety-audits',
    steps: [
      {
        id: 'type',
        q: 'Which safety audit are you looking for?',
        options: [
          ['Fire safety', 'A fire NOC shows your building was approved once. A fire safety audit checks whether alarms, sprinklers, pumps and exits still work today.', 'fire-safety-audits'],
          ['Electrical safety', 'Electrical faults are one of the leading causes of building fires, and most start in panels, cabling or overloaded circuits nobody checks.', 'electrical-safety-audits'],
          ['Construction site', 'A construction site changes every week, so its risks do too: scaffolding, excavations, lifting and work at height.', 'construction-safety-audits'],
          ['Workplace safety', 'An independent audit sees what routine walkthroughs miss: machine guarding, chemicals, emergency readiness and records.', 'workplace-safety-audits'],
          ['Warehouse safety', 'Small forklift impacts on racking add up long before anything visibly gives way.', 'warehouse-safety-audits'],
          ['Not sure', 'Tell us about your site and our team will suggest the right audit.'],
        ],
      },
      {
        id: 'site',
        q: 'What type of site is it?',
        options: [['Factory or warehouse'], ['Office or IT park'], ['Hospital or hotel'], ['Mall or high-rise'], ['School or campus'], ['Construction site']],
      },
      {
        id: 'reason',
        q: "What's prompting the audit?",
        options: [
          ['A client or insurer asked', "An independent inspection body's report is usually what clients and insurers want to see."],
          ['An upcoming inspection', 'A recent independent audit gives you a clear view of your site before the authorities visit.'],
          ['After an incident', 'An audit after an incident looks beyond the cause, at the wider risks around it.'],
          ['A routine check', 'Regular audits catch the slow drift that daily routines miss.'],
        ],
        after: 'Many sites combine fire and electrical safety audits in a single visit.',
      },
    ],
    summary: (a) => `Your safety audit: ${a.type === 'Not sure' ? 'type to be suggested' : lc(a.type)} for a ${lc(a.site)}, prompted by ${{ 'A client or insurer asked': 'a client or insurer request', 'An upcoming inspection': 'an upcoming inspection', 'After an incident': 'an incident', 'A routine check': 'a routine check' }[a.reason] || lc(a.reason)}. Next step: our team confirms the scope and shares a quote.`,
  },
  {
    key: 'energywater',
    label: 'Energy or water audit',
    service: 'Energy / Water Audits',
    slug: 'energy-audits',
    steps: [
      { id: 'which', q: 'Which one?', options: [['Energy audit'], ['Water audit'], ['Both']] },
      {
        id: 'energy',
        when: (a) => a.which !== 'Water audit',
        q: "What's your biggest energy concern?",
        options: [
          ['High electricity bills', 'Your bill shows the total, not where the energy went. Contract demand set years ago and power factor penalties are common hidden costs.'],
          ['Planning solar', 'An energy audit first shows how much you really use and when, which is what sizes solar correctly.'],
          ['Sustainability or ESG reporting', 'Measured energy data is the starting point for carbon and Business Responsibility and Sustainability Reporting (BRSR) disclosures.'],
        ],
      },
      {
        id: 'water',
        when: (a) => a.which !== 'Energy audit',
        q: 'Where does your water come from?',
        options: [
          ['Borewell', 'Groundwater use is increasingly monitored, and knowing exactly how much you draw is the first step.'],
          ['Municipal supply', "Comparing what you're billed for with what you use often reveals hidden leaks."],
          ['Tankers', "Every litre lost to leaks or overflows is a litre you've paid to bring in."],
          ['A mix', 'Mixed sources are rarely all metered. A water balance shows where the gap is.'],
        ],
      },
    ],
    summary: (a) => {
      const kind = a.which === 'Both' ? 'energy and water' : a.which === 'Water audit' ? 'water' : 'energy';
      const focus = [a.energy, a.water].filter(Boolean).map(lc).join(' and ');
      return `Your ${kind} audit: focus on ${focus}. Next step: our team shares the scope and a quote.`;
    },
  },
  {
    key: 'greenbuilding',
    label: 'Green building assessment',
    service: 'Green Building Assessments',
    slug: 'green-building-assessments',
    steps: [
      {
        id: 'rating',
        q: 'Are you aiming for a green rating?',
        options: [
          ['IGBC', 'Most IGBC ratings are valid for three years. An assessment shows where your building stands before you apply or renew.'],
          ['GRIHA', 'GRIHA ratings last five years, and existing buildings can be rated too.'],
          ['Not sure which', 'Both are respected in India. The right choice depends on your building type and what tenants or funders expect.'],
          ['No, just an assessment', 'Even without a rating, an assessment shows how your building performs on energy, water, waste and indoor comfort.'],
        ],
      },
      { id: 'building', q: 'What type of building is it?', options: [['School or campus'], ['Office or commercial'], ['Factory or warehouse'], ['Hospital or hotel']] },
    ],
    summary: (a) => `Your green building assessment: a ${lc(a.building)} building measured against ${{ IGBC: 'IGBC', GRIHA: 'GRIHA', 'Not sure which': 'IGBC or GRIHA', 'No, just an assessment': 'green building benchmarks, without a rating' }[a.rating]}. Next step: our team confirms the scope and shares a quote.`,
  },
  { key: 'verify', label: 'Verify an Aspira certificate' },
  { key: 'other', label: 'Something else', service: 'General enquiry', slug: '' },
];

export const VERIFY = {
  text: 'You can check any Aspira certificate here:',
  link: { to: '/certificate-status', label: 'Certificate status' },
  ask: 'Anything else I can help with?',
  options: ['Yes, I have a question', 'No, thanks'],
};
export const OTHER_PROMPT = "Sure. Tell me a little about what you need and I'll pass it to the right person.";

function lc(s) {
  const v = String(s || '');
  return /^(NAAC|IGBC|GRIHA|ESG)/.test(v) ? v : v.charAt(0).toLowerCase() + v.slice(1);
}
