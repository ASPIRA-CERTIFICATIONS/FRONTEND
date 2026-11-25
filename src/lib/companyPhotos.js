/**
 * Aspira's own photos (originals supplied by the client in public/media).
 * Optimised copies live in public/gallery: aspira-NN.webp keeps the original
 * resolution, aspira-NN-sm.webp is a 720px preview for grids.
 * Captions describe only what is visible – no client names are added.
 */
const p = (n, w, h, title, category, caption = '') => ({
  _id: `aspira-${n}`,
  image: `/gallery/aspira-${n}.webp`,
  thumb: `/gallery/aspira-${n}-sm.webp`,
  width: w,
  height: h,
  title,
  category,
  caption,
});

export const ONSITE = 'On-site inspections';
export const MEETINGS = 'Meetings & reviews';
export const SESSIONS = 'Sessions & events';

export const COMPANY_PHOTOS = [
  p('01', 1600, 1037, 'Green audit opening meeting', MEETINGS, 'Thoraipakkam, Chennai, Tamil Nadu'),
  p('02', 1280, 650, 'On-site measurements with the audit team', ONSITE, 'Dindigul, Tamil Nadu'),
  p('03', 1188, 1178, 'Environmental measurement on campus', ONSITE),
  p('04', 1278, 665, 'Field inspection of campus green cover', ONSITE),
  p('05', 1456, 900, 'Audit session with faculty members', SESSIONS),
  p('06', 1600, 1200, 'Presentation to faculty and staff', SESSIONS),
  p('07', 1600, 1069, 'Audit meeting with the institution team', MEETINGS, 'Tiruchirappalli, Tamil Nadu'),
  p('08', 1600, 1061, 'Audit review meeting', MEETINGS, 'Jaipur, Rajasthan'),
  p('09', 1600, 830, 'Document review with the institution team', MEETINGS),
  p('10', 1106, 589, 'With the institution team after the audit', SESSIONS),
];

export const photo = (n) => COMPANY_PHOTOS.find((x) => x._id === `aspira-${n}`);
