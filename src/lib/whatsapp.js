/** WhatsApp click-to-chat helpers. The number comes from Site settings (contact.whatsapp). */
export const DEFAULT_WA_MESSAGE = 'Hello Aspira Certifications, I would like to know more about your audit services.';

export function waLink(number, message = DEFAULT_WA_MESSAGE) {
  const n = String(number || '').replace(/\D/g, '');
  if (!n) return '';
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/** Pick the pre-filled message for the current page */
export function waMessageFor(pathname, services = []) {
  const m = pathname.match(/^\/services\/([^/]+)/);
  if (m) {
    const s = services.find((x) => x.slug === m[1]);
    if (s?.whatsappMessage) return s.whatsappMessage;
    if (s) return `Hello Aspira, I would like to enquire about ${s.title}. Please share the details.`;
  }
  if (pathname.startsWith('/accreditations')) return 'Hello Aspira, I would like to know more about your NABCB accreditation and green audits for educational institutions.';
  if (pathname.startsWith('/certificate-status')) return 'Hello Aspira, I would like to verify a certificate issued by Aspira.';
  if (pathname.startsWith('/blog')) return 'Hello Aspira, I read your article and would like to discuss an audit.';
  return DEFAULT_WA_MESSAGE;
}
