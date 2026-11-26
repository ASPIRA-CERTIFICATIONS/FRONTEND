/**
 * Client testimonial letters already published on aspiracertifications.com/client-testimonials.
 * Save the two files into Frontend/public/testimonials/ – until then the images load
 * from the current WordPress site (kept live during the migration).
 */
const OLD = 'https://aspiracertifications.com/wp-content/uploads/2026/03';
export const TESTIMONIAL_LETTERS = [
  { _id: 'letter-1', src: '/testimonials/client-testimonial-1.jpeg', fallback: `${OLD}/client-testimonial-1.jpeg`, width: 1220, height: 1600 },
  { _id: 'letter-2', src: '/testimonials/client-testimonial-2.jpeg', fallback: `${OLD}/client-testimonial-2.jpeg`, width: 1125, height: 1600 },
];
