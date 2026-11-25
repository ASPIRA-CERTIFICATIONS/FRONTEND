/**
 * Aspira's own photos (originals supplied by the client in public/media).
 * Optimised copies live in public/gallery: aspira-NN.webp keeps the original
 * resolution, aspira-NN-sm.webp is a 720px preview for grids.
 * All are on-site inspection audit photos; captions only give the place
 * where the photo's GPS stamp shows one. No client names are added.
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

// Every photo is from an on-site inspection audit, so photos carry no category tags.
const T = 'On-site inspection audit';
export const COMPANY_PHOTOS = [
  p('01', 1600, 1037, T, '', 'Thoraipakkam, Chennai, Tamil Nadu'),
  p('02', 1280, 650, T, '', 'Dindigul, Tamil Nadu'),
  p('03', 1188, 1178, T),
  p('04', 1278, 665, T),
  p('05', 1456, 900, T),
  p('06', 1600, 1200, T),
  p('07', 1600, 1069, T, '', 'Tiruchirappalli, Tamil Nadu'),
  p('08', 1600, 1061, T, '', 'Jaipur, Rajasthan'),
  p('09', 1600, 830, T),
  p('10', 1106, 589, T),
];

export const photo = (n) => COMPANY_PHOTOS.find((x) => x._id === `aspira-${n}`);
