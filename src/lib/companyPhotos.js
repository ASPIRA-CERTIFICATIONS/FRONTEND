/**
 * Aspira's own photos (originals supplied by the client in public/media).
 * Optimised copies live in public/gallery: aspira-NN.webp keeps the original
 * resolution, aspira-NN-sm.webp is a 720px preview for grids.
 * All are on-site inspection audit photos. GPS/geotag stamps have been cropped
 * out of the optimised copies; no client names or locations are shown.
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
  p('01', 1600, 777, T),
  p('02', 1280, 484, T),
  p('03', 1188, 1178, T),
  p('04', 1278, 665, T),
  p('05', 1456, 900, T),
  p('06', 1600, 1110, T),
  p('07', 1600, 807, T),
  p('08', 1600, 790, T),
  p('09', 1600, 830, T),
  p('10', 1106, 589, T),
];

/**
 * Admin → Settings images override the company photos once you upload your own.
 * The original stock defaults (images.unsplash.com) are ignored so the real photos stay.
 */
export const customImage = (url) => (url && !/images\.unsplash\.com/.test(url) ? url : '');

export const photo = (n) => COMPANY_PHOTOS.find((x) => x._id === `aspira-${n}`);
